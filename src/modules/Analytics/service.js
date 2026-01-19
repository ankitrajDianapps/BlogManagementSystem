const { logger } = require("../../utils/logging.js")
const analyticsLogger = logger.child({ module: "AnalyticsService" })

const { Post } = require("../../model/Post.js")

const { Comment } = require("../../model/Comment.js")
const { PostView } = require("../../model/PostView.js")
const { messages } = require("../../messages/apiResponses.js")
const { TrendingPost } = require("../../model/trendingPost.js")
const AppError = require("../../utils/AppError.js")
const { default: mongoose, mongo, MongooseError, Mongoose } = require("mongoose")
const { User } = require("../../model/User.js")
const { Like } = require("../../model/Like.js")
const { computeTotalCommentsForUserPosts } = require("../../Query/commentQuery.js")
const { post } = require("./index.js")



const getDashBoard = async (user) => {
    try {

        const aggregateViewsResult = await Post.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" }
                }
            },
        ])

        const totalViews = aggregateViewsResult[0]?.totalViews || 0
        const totalPosts = aggregateViewsResult[0]?.totalPosts || 0

        const totalComments = await computeTotalCommentsForUserPosts(user._id);

        return DashBoardData = {
            userName: user.userName,
            avatar: user.avatar,
            totalPosts: totalPosts,
            totalViews: totalViews,
            totalComments: totalComments
        }

    } catch (err) {

        analyticsLogger.error(err.message, { function: "createDashBoard" })
        throw err
    }
}


const postAnalytics = async (req) => {
    try {

        const postId = req.params.postId
        if (!postId) throw new AppError(messages.POST_ID_REQUIRED, 400)

        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        //check is the post exists with this id or not
        const post = await Post.findOne({ _id: postId, status: "published" }).populate("author", "userName")
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)


        // now lets determine all the details of this post

        const totalViews = post.viewCount
        const commentsCount = await Comment.countDocuments({ post: post._id, isDeleted: false })
        const likeCount = await Like.countDocuments({ post_id: post._id })

        return {
            title: post.title,
            author: post.author.userName,
            totalViews: totalViews,
            totalComment: commentsCount,
            likeCount: likeCount
        }


    } catch (err) {
        analyticsLogger.error(err.message, { function: "postAnalytics" })
        throw err;
    }
}


const todaysTrendingPost = async () => {
    try {

        //lets determine the tredingPost as - searach in  table TrendinPost for the documents whose trendind_at field is greater than currentTime-1 minute

        const trendingDate = new Date(Date.now() - 2 * 60 * 1000)

        const todaysTrendingPost = await TrendingPost.find({ trending_at: { $gte: trendingDate } }).populate("post", "title")

        if (todaysTrendingPost.size == 0) {
            console.log("No post trending today")
            return;
        }
        // console.log(todaysTrendingPost)
        return todaysTrendingPost

    } catch (err) {
        analyticsLogger.error(err.message, { function: "todaysTrendingPost" })
        throw err;
    }
}



const authorPerformaceMetrics = async (authorId) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(authorId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        //check is the user with this id author or not
        const user = await User.findOne({ _id: authorId })

        if (!user) throw new Error("User not found", 400)

        //determine tottal number of post of this user
        // const total_publishedPosts = await Post.countDocuments({ author: user._id, status: "published" })
        // console.log(total_publishedPosts)

        const aggregateViewsResult = await Post.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(authorId),
                    status: "published"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" }
                }
            }
        ])

        const totalViews = aggregateViewsResult[0]?.totalViews || 0
        const totalPosts = aggregateViewsResult[0]?.totalPosts || 0


        // console.log(totalViews)

        //now determine total number of comments  on all the post of the author

        const totalComments = await computeTotalCommentsForUserPosts(authorId)

        //most viewed post of the  author
        const post = await Post.find({ author: authorId }).sort({ viewCount: -1 }).limit(1).select("title viewCount")

        // determine total likes the user gets in his entire posts

        const aggregateLikesResult = await Like.aggregate([
            {
                $lookup: {
                    from: "posts",
                    localField: "post_id",
                    foreignField: "_id",
                    as: "post"
                }
            },
            {
                $unwind: "$post"
            },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: 1 }
                }
            }
        ])

        const totalLikes = aggregateLikesResult[0]?.totalLikes || 0

        return {
            total_publishedPosts: totalPosts,
            totalViews: totalViews,
            totalComments: totalComments,
            totalLikes: totalLikes,
            mostViewedPost: post
        }



    } catch (err) {
        analyticsLogger.error(err.message, { function: "authorPerformaceMetrics" })
        throw err
    }
}



module.exports = {
    getDashBoard,
    postAnalytics,
    todaysTrendingPost,
    authorPerformaceMetrics
}