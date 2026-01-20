const express = require("express")
const Route = express.Router();
const { NewPatient, ExistPatient, GetByPatientId, GetByPhoneNo, Reschedule, CancelAppointment, CheckPatient } = require("../Controller/Patient.controller")
Route.post("/NewPatient", NewPatient)
Route.post("/ExistPatientCheck", CheckPatient)
Route.post("/ExistPatient", ExistPatient)
Route.get("/Get/:id", GetByPatientId)
Route.get("/getphoneno/:no", GetByPhoneNo)
Route.put("/Update/:no", Reschedule)
Route.delete("/calcel/:no", CancelAppointment)


module.exports = Route