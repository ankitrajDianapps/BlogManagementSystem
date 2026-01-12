const { logger } = require("../../utils/logging.js")
const analyticsLogger = logger.child({ module: "AnalyticsService" })

const { Post } = require("../../model/Post.js")
const { Reply } = require("../../model/Reply.js")
const { Comment } = require("../../model/Comment.js")
const { PostView } = require("../../model/PostView.js")

const { TrendingPost } = require("../../model/trendingPost.js")
const AppError = require("../../utils/AppError.js")
const { default: mongoose, mongo, MongooseError } = require("mongoose")
const { User } = require("../../model/User.js")



const createDashBoard = async (user) => {
    try {

        //deterimine total number of posts of the user
        const posts = await Post.find(
            { author: user._id, status: "published" }
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

        const totalViews = post.viewCount
        const [commentsCount, repliesCount] = await Promise.all([

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


const todaysTrendingPost = async () => {
    try {

        //lets determine the tredingPost as - searach in  table TrendinPost for the documents whose trendind_at field is greater than currentTime-1 minute

        const trendingDate = new Date(Date.now() - 2 * 60 * 1000)

        const todaysTrendingPost = await TrendingPost.find({ trending_at: { $gte: trendingDate } }).populate("post", "title")

        if (todaysTrendingPost.size == 0) {
            console.log("NO post trending today")
            return;
        }
        console.log(todaysTrendingPost)
        return todaysTrendingPost

    } catch (err) {
        analyticsLogger.error(err.message, { function: "todaysTrendingPost" })
        throw err;
    }
}



const authorPerformaceMetrics = async (authorId) => {
    try {

        if (!authorId) throw new AppError("Author Id is required", 400)

        if (!mongoose.Types.ObjectId.isValid(authorId))
            throw new AppError("Invlaid Id format", 400)

        //check is the user with this id author or not
        const user = await User.findOne({ _id: authorId })

        if (!user) throw new Error("User with this Id is not a author", 400)

        //determine tottal number of post of this user
        const total_publishedPosts = await Post.countDocuments({ author: user._id, status: "published" })
        // console.log(total_publishedPosts)

        const total_draftPosts = await Post.countDocuments({ author: user._id, status: "draft" })
        // console.log(total_draftPosts)

        const aggregateViewsResult = await Post.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$viewCount" }
                }
            }
        ])

        const totalViews = aggregateViewsResult[0]?.totalViews || 0

        // console.log(totalViews)


        //now determine total number of comments  on all the post of the author

        const aggregateCommentsResult = await Comment.aggregate([
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    as: "post"
                }
            },
            { $unwind: "$post" },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 }
                }
            }
        ]);


        const comment_count = aggregateCommentsResult[0]?.totalComments || 0
        // console.log(comment_count)



        // determine the reply  count same as the  above we do for the comment

        const aggregateReplyResult = await Reply.aggregate([
            {
                $lookup: {

                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    as: "post"
                }
            },
            { $unwind: "$post" },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalReply: { $sum: 1 }
                }
            }
        ])

        // console.log(aggregateReplyResult)
        const replyCount = aggregateReplyResult[0]?.totalReply || 0


        totalComments = comment_count + replyCount


        //most viewed post of the  author
        const post = await Post.find({ author: authorId }).sort({ viewCount: -1 }).limit(1).select("title viewCount")

        return {
            total_publishedPosts: total_publishedPosts,
            total_draftPosts: total_draftPosts,
            totalViews: totalViews,
            totalComments: totalComments,
            mostViewedPost: post
        }



    } catch (err) {
        analyticsLogger.error(err.message, { function: "authorPerformaceMetrics" })
        throw err
    }
}



module.exports = {
    createDashBoard,
    postAnalytics,
    todaysTrendingPost,
    authorPerformaceMetrics
}