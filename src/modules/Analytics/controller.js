
const AnalyticsService = require("./service.js")

module.exports.createDashBoard = async (req, res) => {
    try {

        const DashBoardData = await AnalyticsService.createDashBoard(req.user)

    } catch (err) {
        res.status(err.statusCode).json(err.message)
    }
}