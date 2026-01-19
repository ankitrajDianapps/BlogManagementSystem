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


        const aggregateResult = await PostView.aggregate([
            {
                $match: {
                    viewed_at: { $gt: twoMinuteAgo }
                }
            },
            {
                $group: {
                    _id: "$post_id",
                    total_views_on_trending_day: { $sum: 1 }
                }
            },
            {
                $sort: { total_views_on_trending_day: -1 }
            },
            {
                $limit: 3
            },
            {
                $addFields: {
                    post: "$_id",
                    trending_at: new Date()
                }
            },
            {
                $project: {
                    _id: 0,
                    post: 1,
                    total_views_on_trending_day: 1,
                    trending_at: 1,

                }
            }
        ])

        // now push the todays trending post in the table
        await TrendingPost.insertMany(aggregateResult)
        console.log("trending post cron execution completed")

        // if (trendinngPostToInsert.length > 0) console.log("updated trending posts :", trendinngPostToInsert)
        // else console.log("No any post trending for today")

    } catch (err) {
        trendingLogger.error(err.message)


    }
}