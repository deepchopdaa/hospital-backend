const mongoose = require("mongoose")

const AppointmentSchema = mongoose.Schema({
    PatientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patient'
    },
    Date: {
        type: Date,
        require: true,
        default: Date.now()
    },
    Time: {
        type: String,
        requried: true
    },
    Status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    Message: {
        type: String
    }
}, { timestamps: true, versionKey: false })

const Patient = mongoose.model("appointment", AppointmentSchema)
module.exports = Patient