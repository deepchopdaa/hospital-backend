// controllers/patientController.js
const generatePatientId = require("./patientId")
const Patient = require("../model/Patient");
const Appointment = require("../model/Appointment");


/* New Patient Appointment Booking */

const NewPatient = async (req, res) => {
    try {
        const { FullName, PhoneNo, Date: inputDate, Time, Message } = req.body;

        if (!FullName || !PhoneNo || !inputDate || !Time) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const CheckPhoneNo = await Patient.findOne({ PhoneNo })
        if (CheckPhoneNo) {
            return res.status(400).json({
                success: false,
                message: "This PhoneNo patient Alreadty Exist"
            })
        }
        const PatientId = await generatePatientId();
        const newPatient = await Patient.create({ PatientId, FullName, PhoneNo });

        const appointment = await Appointment.create({
            PatientId: newPatient._id,
            Date: inputDate,
            Time,
            Message,
        });

        const result = await Appointment.findById(appointment._id).populate("PatientId");

        return res.status(200).json({
            success: true,
            message: "New patient and appointment added.",
            data: result,
        });
    } catch (error) {
        console.error("New Patient Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while adding new patient.",
        });
    }
};

/* existing Patient Appointment Booked */

const ExistPatient = async (req, res) => {
    try {
        const { PatientId, Date: inputDate, Time, Message } = req.body;

        if (!PatientId || !inputDate || !Time) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const existingPatient = await Patient.findOne({ PatientId });

        if (!existingPatient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const AlreadyBooked = await Appointment.findOne({ PatientId: existingPatient._id, Status: "upcoming" })

        if (AlreadyBooked) {
            return res.status(400).json({ success: false, message: "This Patient Appointment Already Booked" })
        }

        const appointment = await Appointment.create({
            PatientId: existingPatient._id,
            inputDate,
            Time,
            Message,
        });

        const result = await Appointment.findById(appointment._id).populate("PatientId").sort({ createdAt: -1 });

        return res.status(200).json({ success: true, message: "Appointment added for existing patient.", data: result });
    } catch (error) {
        console.error("Exist Patient Error:", error);
        return res.status(500).json({ success: false, message: "Server error while adding appointment." });
    }
};

/* Get appitnemnt By PatientId */

const GetByPatientId = async (req, res) => {
    try {

        const { id: PatientId } = req.params;

        const patient = await Patient.findOne({ PatientId });

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const allAppointments = await Appointment.find({ PatientId: patient._id });
        const now = new Date();
        console.log(allAppointments, "find appintment")

        for (let appt of allAppointments) {
            const [hours, minutes] = appt.Time.split(':').map(Number);
            const apptDateTime = new Date(appt.Date);
            apptDateTime.setHours(hours, minutes, 0, 0);
            if (appt.Status === "upcoming" && apptDateTime < now) {
                appt.Status = "completed";
                await appt.save();
            }
        }

        const appointment = await Appointment.findOne({ PatientId: patient._id, Status: "upcoming" })
            .populate("PatientId")
            .sort({ createdAt: -1 });

        console.log(appointment, "appoitment find by PatientId")

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found for this patient." });
        }

        return res.status(200).json({ success: true, data: appointment });

    } catch (error) {
        console.error("GetByPatientId Error:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

/* Get Patient ID By PhoneNo */

const GetByPhoneNo = async (req, res) => {
    try {
        const { no: PhoneNo } = req.params;
        const patient = await Patient.findOne({ PhoneNo });

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        return res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error("GetByPhoneNo Error:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// Reschedule appointment


const Reschedule = async (req, res) => {
    try {
        const { no: PatientId } = req.params;
        const { Date: inputDate, Time } = req.body;

        if (!inputDate || !Time) {
            return res.status(400).json({ success: false, message: "Date and Time are required." });
        }
        console.log(inputDate, Time)
        const patient = await Patient.findOne({ PatientId });

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }
        const existingAppointment = await Appointment.findOne({ PatientId: patient._id, Status: "upcoming" }).sort({ createdAt: -1 });
        if (!existingAppointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }
        await Appointment.findByIdAndUpdate(
            existingAppointment._id,
            { Date: inputDate, Time },
            { new: true }
        );
        const updatedAppointment = await Appointment.findById(existingAppointment._id).populate("PatientId");
        console.log(updatedAppointment, "updated appointment")

        return res.status(200).json({
            success: true,
            message: "Appointment rescheduled.",
            data: updatedAppointment
        });
    } catch (error) {
        console.error("Reschedule Error:", error);
        return res.status(500).json({ success: false, message: "Server error while rescheduling." });
    }
};


/* cancel appointment */


const CancelAppointment = async (req, res) => {
    try {
        const { no: PatientId } = req.params;
        console.log("Cancel request for Case No:", PatientId);
        const patient = await Patient.findOne({ PatientId });
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }
        const appointment = await Appointment.findOneAndUpdate(
            { PatientId: patient._id, Status: 'upcoming' },
            { Status: 'canceled' },
            { new: true }
        ).populate("PatientId");
        if (!appointment) {
            return res.status(404).json({ success: false, message: "No upcoming appointment found to cancel." });
        }
        console.log("Cancelled Appointment:", appointment);
        return res.status(200).json({
            success: true,
            message: "Appointment status updated to cancelled.",
            data: appointment,
        });
    } catch (error) {
        console.error("Cancel Appointment Error:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

/* Check Patient */

const CheckPatient = async (req, res) => {
    try {
        const { PatientId } = req.body;
        console.log(PatientId, "PatientId")
        if (!PatientId) {
            return res.status(400).json({ success: false, message: "PatientId required!" });
        }
        const existingPatient = await Patient.findOne({ PatientId });
        if (!existingPatient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }
        return res.status(200).json({ success: true, message: "Appointment added for existing patient.", data: existingPatient });
    } catch (error) {
        console.error("Exist Patient Error:", error);
        return res.status(500).json({ success: false, message: "Server error while adding appointment." });
    }
};

module.exports = {
    NewPatient,
    ExistPatient,
    GetByPatientId,
    GetByPhoneNo,
    Reschedule,
    CancelAppointment,
    CheckPatient
};
