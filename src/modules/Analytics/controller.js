const { apiResponse } = require("../../config/responseHandler.js")
const AnalyticsService = require("./service.js")

module.exports.createDashBoard = async (req, res) => {
    try {

        const DashBoardData = await AnalyticsService.createDashBoard(req.user)
        return apiResponse({
            res,
            code: 200,
            message: "DashBoard data fetched successfully",
            status: true,
            data: DashBoardData
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}

module.exports.postAnalytics = async (req, res) => {
    try {

        const postAnalyticsData = await AnalyticsService.postAnalytics(req)

        return apiResponse({
            res,
            code: 200,
            message: "Post Analytics fetched successfully",
            status: true,
            data: postAnalyticsData
        })


    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.todaystrendingPost = async (req, res) => {
    try {

        const trendingPosts = await AnalyticsService.todaysTrendingPost()

        return apiResponse({
            res,
            code: 200,
            message: "Trending posts fetched successfully",
            status: true,
            data: trendingPosts
        })


    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}



module.exports.authorPerformaceMetrics = async (req, res) => {
    try {

        const performanceData = await AnalyticsService.authorPerformaceMetrics(req.params.authorId)

        return apiResponse({
            res,
            code: 200,
            message: "Performance metrics fetched successfully",
            status: true,
            data: performanceData
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}