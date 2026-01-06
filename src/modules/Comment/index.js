const express = require("express")
const { addComment, getAllComments, updateComment, deleteComment } = require("./controller.js")
const { auth } = require("../../middleware/authMiddleware.js")

const router = express.Router()
router.use(express.json())


router.post("/:postId", auth, addComment)
router.get("/:postId", auth, getAllComments)
router.put("/:id", auth, updateComment)
router.delete("/:id", auth, deleteComment)

module.exports = router