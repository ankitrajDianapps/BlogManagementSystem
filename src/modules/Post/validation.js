const { logger } = require("../../utils/logging.js")
const validationLogger = logger.child({ module: "postValidation" })
const AppError = require("../../utils/AppError.js")

module.exports.validatePost = async (post) => {
    try {

        if (!post) throw new AppError("post data is required to create post")

        if (!post.title) throw new AppError("title is required", 400)
        if (!post.content) throw new AppError("content is required", 400)



        // if (post.title && typeof post.title != "string") throw new AppError("Title field must be String")
        // if (post.content && typeof post.content != "string") throw new AppError("Content field must be String")
        // if (post.excerpt && typeof post.excerpt != "string") throw new AppError("T field must be String")
        // if (post.title && typeof post.title != "string") throw new AppError("Title field must be String")

        for (let k in post) {
            if (post[k] && typeof post[k] != "string") throw new AppError(`${k} field must be string`)
        }

    } catch (err) {
        validationLogger.error(err)
        throw err;

    }
}


module.exports.validatePostUpdate = async (post) => {
    try {


        if (post?.status) throw new AppError("Status field not required", 400)
        if (post?.viewCount) throw new AppError("viewCount can't be updated", 400)
        if (post?.publishedAt) throw new AppError("published time can't be updated", 400)
        if (post?.author) throw new AppError("author can't be updated", 400)
        if (post?.slug) throw new AppError("Slug can't be updated", 400)

        //for each field for the update it should be  only string

        for (let field in post) {
            if (typeof post[field] != "string") {
                throw new AppError(`${field} must be in string`, 400)
            }
        }


    } catch (err) {
        validationLogger.error(err.message, { function: "validatePostUpdate" })
        throw err
    }
}