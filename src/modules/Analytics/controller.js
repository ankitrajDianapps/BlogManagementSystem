
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