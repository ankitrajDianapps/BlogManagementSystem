const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { isAuthor } = require("../../middleware/roleMiddleware.js")
const { createPost, getAllPublishedPosts, getPostById, updatePost, deletePost } = require("./controller.js")


const router = express.Router()
router.use(express.json())

router.post("", auth, isAuthor, createPost)
router.get("", auth, getAllPublishedPosts)
router.get("/:id", auth, getPostById)
router.patch("/:id", auth, updatePost)
router.delete("/:id", auth, deletePost)

module.exports = router