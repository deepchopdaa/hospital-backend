const mongoose = require("mongoose")
const Connection = async () => {
    try {
        await mongoose.connect(process.env.MongoDb_URI)
        console.log("MongoDb Connected !")
    } catch (error) {
        console.log("MongoDb Connection Error : ", error)
    }
}

module.exports = Connection