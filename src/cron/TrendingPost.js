const { logger } = require("../utils/logging.js")
const trendingLogger = logger.child({ module: "trendingPost" })

const { PostView } = require("../model/PostView.js")
const { TrendingPost } = require("../model/trendingPost.js")




module.exports.trendingPosts = async () => {
    try {

        // we will implement the concept as we will determine the posts  by grouping  by comparing date as in the last 1 minute which post has got the most like

        console.log("Trending post cron started")


        const twoMinuteAgo = new Date(Date.now() - 2 * 60 * 1000)

        //? lets determine the count of the view of the posts which is liked two minutes ago
        const trendingPost = await PostView.aggregate([
            {
                $match: {
                    viewed_at: { $gt: twoMinuteAgo }
                },
            },
            {
                $group: {
                    _id: "$post_id",
                    view_count: { $sum: 1 }
                }
            }
        ]).sort({ view_count: -1 }).limit(3)

        // console.log(trendingPost)

        // now save these two posts in the  trending post table

        const trendinngPostToInsert = []

        trendingPost.forEach(p => {
            trendinngPostToInsert.push({ post: p._id, total_views_on_trending_day: p.view_count, trending_at: new Date(Date.now()) })
        })

        // first check does the trendingPost table contains the document of todays date
        const todaysTrendingPost = await TrendingPost.find({ trending_at: { $gt: twoMinuteAgo } })

        if (todaysTrendingPost.length > 0) {
            console.log("trending post already updated")
            return
        }

        // now push the todays trending post in the table
        await TrendingPost.insertMany(trendinngPostToInsert)
        console.log("trending post cron execution completed")

        // console.log(trendinngPostToInsert)

        if (trendinngPostToInsert.length > 0) console.log("updated trending posts :", trendinngPostToInsert)
        else console.log("No any post trending for today")

    } catch (err) {
        trendingLogger.error(err.message)


    }
}