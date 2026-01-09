const cron = require("node-cron")
const { logger } = require("../utils/logging.js")
const dailyAggregationLogger = logger.child({ module: "dailyAggregation" })

const { Post } = require("../model/Post.js")
const { PostView } = require("../model/PostView.js")
const { Comment } = require("../model/Comment.js")
const { Reply } = require("../model/Reply.js")
const { PostEngagement } = require("../model/PostEngagement.js")
const { Like } = require("../model/Like.js")

const dailyAggregation = async () => {

    try {

        // heere we will update the PostEngagement table about which post of the DB has howmany views and how many likes

        const viewStats = await PostView.aggregate([
            {
                $group: {
                    _id: "$post_id",
                    view_count: { $sum: 1 }
                }
            }
        ])

        const likeStats = await Like.aggregate([
            {
                $group: {
                    _id: "$post_id",
                    like_count: { $sum: 1 }
                }
            }
        ])

        const commentStats = await Comment.aggregate([
            {
                $group: {
                    _id: "$post",
                    comment_count: { $sum: 1 }
                }
            }
        ])

        const replyStats = await Reply.aggregate([
            {
                $group: {
                    _id: "$post",
                    reply_count: { $sum: 1 }
                }
            }
        ])


        const engagementMap = {}

        viewStats.forEach(v => {
            engagementMap[v._id] = { view_count: v.view_count, comment_count: 0, like_count: 0 }
        })

        commentStats.forEach(c => {
            if (!engagementMap[c._id]) engagementMap[c._id] = { view_count: 0, like_count: 0 }

            engagementMap[c._id].comment_count = c.comment_count
        })

        replyStats.forEach(r => {
            if (!engagementMap[r._id]) engagementMap[r._id] = { view_count: 0, comment_count: 0, like_count: 0 }
            engagementMap[r._id].comment_count += r.reply_count
        })

        likeStats.forEach(l => {
            if (!engagementMap[l._id]) engagementMap[l._id] = { view_count: 0, comment_count: 0 }
            engagementMap[l._id].like_count = l.like_count
        })


        const bulkOperation = Object.entries(engagementMap).map(([postId, data]) => ({
            updateOne: {
                filter: { post_id: postId },
                update: { $set: data },
                upsert: true
            }
        }))

        await PostEngagement.bulkWrite(bulkOperation)


    } catch (err) {
        dailyAggregationLogger.error(err.message)
    }
}


// cron.schedule("*/1 * * * *", dailyAggregation)


module.exports = dailyAggregation