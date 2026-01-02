const AppError = require("../utils/AppError.js")
const jwt = require("jsonwebtoken")
const { logger } = require("../utils/logging.js")
const { User } = require("../model/User.js")
const authLogger = logger.child({ module: "authMiddleware" })


module.exports.auth = async (req, res, next) => {
    try {

        const token = req.header("Authorization").split(" ")[1]

        if (!token) {
            res.status(401).json({ message: "Token not found , Authorization failed" })
        }

        // lets verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET)


        //now check if user exist with the userId of the payload or not
        const user = await User.findOne(
            { _id: payload.userId }
        )

        if (!user) {
            res.status(400).json({ message: "No such user exists or user deleted" })
        }

        req.user = user;
        next()


    } catch (err) {
        authLogger.error(err.message)
        res.status(500).json({ message: err.message })
    }
}