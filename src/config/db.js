const mongoose = require("mongoose")
require("dotenv").config()
const { logger } = require("../utils/logging.js");
const dbLogger = logger.child({ module: "db.js" })

module.exports.connectDB = async () => {

    try {
        let url = process.env.MONGO_URL;
        await mongoose.connect(url)
    } catch (err) {
        console.log(err)
    }
}
