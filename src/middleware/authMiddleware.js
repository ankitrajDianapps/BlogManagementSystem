const AppError = require("../utils/AppError.js")
const jwt = require("jsonwebtoken")
const { logger } = require("../utils/logging.js")
const { User } = require("../model/User.js")
const { Session } = require("../model/Session.js")
const { apiResponse } = require("../config/responseHandler.js")
const authLogger = logger.child({ module: "authMiddleware" })


module.exports.auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1]

        if (!token) {
            return apiResponse({ code: 401, message: "Token not found , Authorization failed", status: false })
        }

        // lets verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET)


        //now check if user exist with the userId of the payload or not
        const user = await User.findOne(
            { _id: payload.userId }
        )

        if (!user) {
            return apiResponse({ code: 401, message: "No such user exists or user deleted", status: false })
        }

        // lets check is the session of the user exists or logout
        const session = await Session.find({ userId: user._id, isValid: true })
        if (session.length == 0) {
            return apiResponse({ code: 401, message: "Session expired , login again....", status: false })


        }

        req.user = user;
        next()


    } catch (err) {
        authLogger.error(err.message)
        console.log("HELLO")
        return apiResponse({ res, code: err.statusCode, message: err.message, status: false })
    }
}