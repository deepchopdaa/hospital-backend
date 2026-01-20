require('dotenv').config();
const express = require("express")
const app = express()
const Connection = require("./config/Connection.model.js")
const cors = require("cors")
const PORT = process.env.PORT || 3000
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json())
Connection()

const PatientRoute = require("./Routes/Patient.route.js")

app.use("/patient", PatientRoute)
app.get("/get", (req, res) => {
    try {
        console.log("app is running perfectly")
        res.send("Success")
    } catch (error) {
        console.log("Error", error)
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`App is running on ${PORT}`)
})
