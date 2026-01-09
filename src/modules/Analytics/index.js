const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { createDashBoard, postAnalytics } = require("./controller.js")

const router = express.Router()

router.get("/overview", auth, createDashBoard)
router.get("/post/:postId", auth, postAnalytics)

module.exports = router