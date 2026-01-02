const { validatePost, validatePostUpdate } = require("./validation.js")
const postService = require("./service.js")
const { Post } = require("../../model/Post.js")

module.exports.createPost = async (req, res) => {
    try {

        await validatePost(req.body)

        const post = await postService.createPost(req.body, req.user)

        res.status(200).json({ message: "Post created successfully", data: post })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getAllPublishedPosts = async (req, res) => {
    try {

        let user = req.user

        let page = Number(req.query.page) || 1
        let limit = Number(req.query.limit) || 5

        const posts = await postService.getAllPublishedPosts(page, limit, user)

        res.status(200).json({ message: "posts fetched successfully", data: posts })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}




module.exports.getPostById = async (req, res) => {
    try {


        const post = await postService.getPostById(req.params.id)

        res.status(200).json({ message: "post fetched successfull", data: post })


    } catch (err) {
        res.status(err.statusCode).json({ message: err.message })
    }
}




module.exports.updatePost = async (req, res) => {
    try {

        await validatePostUpdate(req.body)

        const updatedPost = await postService.updatePost(req.body, req.params.id, req.user)

        res.status(200).json({ message: "post updated succesfully", data: updatedPost })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}




module.exports.deletePost = async (req, res) => {
    try {

        const deletedPost = await postService.deletePost(req.params.id, req.user)

        res.status(200).json({ message: "Post deleted Successfully" })

    } catch (err) {
        res.status(err.statusCode).json({ message: err.message })
    }
}