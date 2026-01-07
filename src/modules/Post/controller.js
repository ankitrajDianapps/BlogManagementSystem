const { validatePost, validatePostUpdate } = require("./validation.js")
const postService = require("./service.js")
const { Post } = require("../../model/Post.js")
const AppError = require("../../utils/AppError.js")

module.exports.createPost = async (req, res) => {
    try {

        await validatePost(req.body)

        const post = await postService.createPost(req.body, req.user,)

        res.status(200).json({ message: "Post created successfully", data: post })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getAllPublishedPosts = async (req, res) => {
    try {

        let user = req.user



        const posts = await postService.getAllPublishedPosts(req.query, user)

        res.status(200).json({ message: "posts fetched successfully", data: posts })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}




module.exports.getPostById = async (req, res) => {
    try {


        const post = await postService.getPostById(req)

        res.status(200).json({ message: "post fetched successfull", data: post })


    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}




module.exports.updatePost = async (req, res) => {
    try {

        if (!req.body) throw new AppError("Missing body part to update post", 400)
        await validatePostUpdate(req.body)

        const updatedPost = await postService.updatePost(req.body, req.params.id, req.user, false)

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



module.exports.publishDraftPost = async (req, res) => {
    try {


        await validatePostUpdate(req.body)

        // const updatedPost = await postService.publishDraftedPost(req.body, req.params.id, req.user)
        const updatedPost = await postService.updatePost(req.body, req.params.id, req.user, true)

        res.status(200).json({ message: "post published from draft successfully", data: updatedPost })


    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getOwnPosts = async (req, res) => {
    try {

        const posts = await Post.find({ author: req.user._id, status: "published" })
        // console.log(posts)

        if (posts.length == null) res.status(400).json({ message: "No posts exists" })

        res.status(200).json({ message: "posts fetched successfully", posts: posts })


    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }

}

