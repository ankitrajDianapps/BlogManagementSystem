const { logger } = require("../../utils/logging.js")
const analyticsLogger = logger.child({ module: "AnalyticsService" })

const { Post } = require("../../model/Post.js")
const { Reply } = require("../../model/Reply.js")
const { Comment } = require("../../model/Comment.js")
const { PostView } = require("../../model/PostView.js")
const AppError = require("../../utils/AppError.js")
const { default: mongoose } = require("mongoose")
const { log } = require("winston")

const createDashBoard = async (user) => {
    try {

        //deterimine total number of posts of the user
        const posts = await Post.find(
            { author: user._id }
        )

        const totalPosts = posts.length;

        const postIds = posts.map(p => p._id)

        const [totalViews, commentsCount, repliesCount] = await Promise.all([
            await PostView.countDocuments({
                post_id: { $in: postIds }
            }),
            await Comment.countDocuments({
                post: { $in: postIds }
            }),
            await Reply.countDocuments({
                post: { $in: postIds }
            })

        ])

        const totalComment = commentsCount + repliesCount

        return DashBoardData = {
            userName: user.userName,
            avatar: user.avatar,
            totalPosts: totalPosts,
            totalViews: totalViews,
            totalComment: totalComment
        }







    } catch (err) {
        analyticsLogger.error(err.message, { function: "createDashBoard" })
        throw err
    }
}


const postAnalytics = async (req) => {
    try {

        const user = req.user
        const postId = req.params.postId

        if (!postId) throw new AppError("postId is required", 400)

        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError("Invalid Id format", 400)

        //check is the post exists with this id or not
        const post = await Post.findOne({ _id: postId, status: "published" }).populate("author", "userName")
        if (!post) throw new AppError("No post exists with this Id")


        // now lets determine all the details of this post

        const [totalViews, commentsCount, repliesCount] = await Promise.all([
            await PostView.countDocuments({
                post_id: post._id
            }),
            await Comment.countDocuments(
                { post: post._id }
            ),
            await Reply.countDocuments(
                { post: post._id }
            )

        ])

        const totalComment = commentsCount + repliesCount

        return {
            title: post.title,
            author: post.author.userName,
            totalViews: totalViews,
            totalComment: totalComment
        }


    } catch (err) {
        analyticsLogger.error(err.message, { function: "postAnalytics" })
        throw err;
    }
}

module.exports = {
    createDashBoard,
    postAnalytics
}