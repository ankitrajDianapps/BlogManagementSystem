const mongoose = require("mongoose")
require("dotenv").config()
const { logger } = require("../utils/logging.js");
const dbLogger = logger.child({ module: "db.js" })




module.exports.connectDB = async function connectDB() {

    try {
        let url = process.env.MONGO_URL;

        const res = await mongoose.connect(url)

        return "Database connected successfully"
    } catch (err) {
        console.log(err)
    }
}


module.exports.connectDB()
    .then((res) => dbLogger.info(res))
    .catch((err) => dbLogger.error(err.message))