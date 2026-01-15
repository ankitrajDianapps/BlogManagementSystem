const { logger } = require("../../utils/logging.js")
const commentLogger = logger.child({ module: "commentValidator" })
const AppError = require("../../utils/AppError.js")

module.exports.addCommentValidaiton = async (comment) => {
    try {

        if (!comment?.content) throw new AppError("content field is required", 400)

        if (Object.keys(comment).length > 1) throw new AppError("Only content in required", 400)

    } catch (err) {
        commentLogger.error(err.message, { function: "addComment" })
        throw new AppError(err.message, err.statusCode)
    }
}