const express = require('express')
const { connectDB } = require('./config/db.js')
const userRoutes = require("./modules/user")
const postRoutes = require("./modules/Post")
const commentRouter = require("./modules/Comment")
const replyRouter = require("./modules/Reply")
const analyticsRouter = require("./modules/Analytics")

const cron = require("node-cron")
const dailyAggregation = require("./cron/dailyAggregation.js")
const { postAnalytics } = require('./modules/Analytics/controller.js')

const app = express()

app.use(express.json())
connectDB()

app.use("/api/auth", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRouter)
app.use("/api/reply", replyRouter)
app.use("/api/analytics", analyticsRouter)


// cron.schedule("*/1 * * * *", dailyAggregation)

cron.schedule("* * * * * *", dailyAggregation)

app.listen(8000, () => {
    console.log("Server is listening at port 8000")

})
