const mongoose = require("mongoose")


const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        refreshToken: {
            type: String,
            required: true,
            trim: true
        },
        isValid: {
            type: Boolean,
            required: true,
            default: true
        },
        deviceType: {
            type: String,
            default: "Postman"
        },
        deviceModel: {
            type: String
        },
        IpAddress: {
            type: String,
            required: true
        }
    }
)


module.exports.Session = mongoose.model("session", sessionSchema)