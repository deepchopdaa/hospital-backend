const Patient = require("../model/Patient");

const generatePatientId = async () => {
    const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
    const lastNumber = lastPatient?.PatientId?.split("-")[1] || "1000";
    const newPatientId = `d-${parseInt(lastNumber) + 1}`;
    return newPatientId;
};

module.exports = generatePatientId