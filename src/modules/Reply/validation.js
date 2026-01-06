const AppError = require("../../utils/AppError.js")
const { logger } = require("../../utils/logging.js")
const replyLogger = logger.child({ module: "replyValidation" })

module.exports.addReplyValidation = async (reply) => {
    try {


        if (!reply) throw new AppError("missing body part for adding reply", 400)

        if (!reply.content) throw new AppError("content field is required", 400)
        if (content == "") throw new AppError("content can't be empty", 400)

    } catch (err) {
        replyLogger.error(err.messag, { function: "addReplyValidator" })
    }
}