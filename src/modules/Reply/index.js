const express = require("express")
const { addComment } = require("../Comment/controller.js")
const { addReply, getReply, updateReply, deleteReply, addNestedReply, getRepliesByReplyId } = require("./controller.js")
const { auth } = require("../../middleware/authMiddleware.js")

const router = express.Router()
router.use(express.json())

router.post("/:commentId", auth, addReply)
router.get("/:commentId", auth, getReply)
router.put("/:id", auth, updateReply)
router.delete("/:id", auth, deleteReply)
router.post("/nestedreply/:replyId", auth, addNestedReply)
router.get("/nestedreplies/:replyId", auth, getRepliesByReplyId)

module.exports = router