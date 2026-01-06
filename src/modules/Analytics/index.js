const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { createDashBoard } = require("./controller.js")

const router = express.Router()

router.get("/overview", auth, createDashBoard)

module.exports = router