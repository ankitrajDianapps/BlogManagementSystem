const express = require("express")
const { auth } = require("../../middleware/authMiddleware.js")
const { isAuthor } = require("../../middleware/roleMiddleware.js")
const { createPost, getAllPublishedPosts, getPostById, updatePost, deletePost, publishDraftPost, getOwnPosts } = require("./controller.js")


const router = express.Router()
router.use(express.json())

router.post("", auth, isAuthor, createPost)
router.get("", auth, getAllPublishedPosts)
router.get("/my-posts", auth, getOwnPosts)
router.get("/:id", auth, getPostById)
router.patch("/:id", auth, updatePost)
router.delete("/:id", auth, deletePost)
router.patch("/:id/publish", auth, publishDraftPost)


module.exports = router