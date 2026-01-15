const express = require('express')
const { connectDB } = require('./config/db.js')
const userRoutes = require("./modules/user")
const postRoutes = require("./modules/Post")
const commentRouter = require("./modules/Comment")
const analyticsRouter = require("./modules/Analytics")

const cron = require("node-cron")
const dailyAggregation = require("./cron/dailyAggregation.js")
const { postAnalytics } = require('./modules/Analytics/controller.js')
const { trendingPosts } = require('./cron/TrendingPost.js')
const inActiveUserCleanup = require('./cron/InActiveUserCleanup.js')
const { InActiveUserCleanup } = require("./cron/InActiveUserCleanup.js")
const { messages } = require('./messages/apiResponses.js')

const app = express()

app.use(express.json())
connectDB()

app.use("/api/auth", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRouter)
app.use("/api/analytics", analyticsRouter)

app.use("", (req, res, next) => {
    res.status(404)
        .json({
            success: false,
            statusCode: 404,
            message: `End Point does not exsit ${req.url}`
        })
})


cron.schedule("*/2 * * * *", dailyAggregation)

cron.schedule("*/2 * * * *", trendingPosts)

cron.schedule("0 0 */7 * *", inActiveUserCleanup)

app.listen(8000, () => {
    console.log("Server is listening at port 8000")

})
