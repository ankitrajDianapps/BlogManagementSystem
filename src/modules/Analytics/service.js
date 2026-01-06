const { logger } = require("../../utils/logging.js")
const analyticsLogger = logger.child({ module: "AnalyticsService" })

const { Post } = require("../../model/Post.js")
const { Reply } = require("../../model/Reply.js")
const { Comment } = require("../../model/Comment.js")

const createDashBoard = async (user) => {
    try {

        //deterimine total number of posts of the user
        const posts = await Post.find(
            { author: user._id }
        )


        // determine total number of comments




    } catch (err) {
        analyticsLogger.error(err.message, { function: "createDashBoard" })
        throw err
    }
}


module.exports = {
    createDashBoard
}