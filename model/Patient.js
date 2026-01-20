const mongoose = require("mongoose")

const PatientSchema = mongoose.Schema({
    PatientId: {
        type: String,
    },
    FullName: {
        type: String,
        requried: true
    },
    PhoneNo: {
        type: Number,
        unique: true,
        requried: true,
        match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
    }
}, { timestamps: true, versionKey: false })

const Patient = mongoose.model("patient", PatientSchema)
module.exports = Patient