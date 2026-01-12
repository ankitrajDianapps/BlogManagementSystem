
const AnalyticsService = require("./service.js")

module.exports.createDashBoard = async (req, res) => {
    try {

        const DashBoardData = await AnalyticsService.createDashBoard(req.user)
        res.status(200).json({ message: "DashBoard data fetched successfully", DashBoardData: DashBoardData })

    } catch (err) {
        res.status(err.statusCode).json(err.message)
    }
}

module.exports.postAnalytics = async (req, res) => {
    try {

        const postAnalyticsData = await AnalyticsService.postAnalytics(req)
        res.status(200).json({ message: "Post Analytics fetched successfully", postAnalyticsData: postAnalyticsData })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.todaystrendingPost = async (req, res) => {
    try {

        const trendingPosts = await AnalyticsService.todaysTrendingPost()
        if (trendingPosts.length == 0) {
            res.status(200).json({ message: "No  trending posts today" })
            return;
        }

        res.status(200).json({ message: "Trending posts fetched successfully", trending_posts: trendingPosts })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}



module.exports.authorPerformaceMetrics = async (req, res) => {
    try {

        const performanceData = await AnalyticsService.authorPerformaceMetrics(req.params.authorId)

        res.status(200).json({ message: "performance metrics fetched successfully", performanceData: performanceData })

    } catch (err) {
        res.status(err.statusCode || 500).json({ mmessage: err.message })
    }
}