const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { getDashBoard, postAnalytics, todaystrendingPost, authorPerformaceMetrics } = require("./controller.js")

const router = express.Router()

router.get("/overview", auth, getDashBoard)
router.get("/post/:postId", auth, postAnalytics)
router.get("/trending", auth, todaystrendingPost)
router.get("/author/:authorId", auth, authorPerformaceMetrics)

module.exports = router