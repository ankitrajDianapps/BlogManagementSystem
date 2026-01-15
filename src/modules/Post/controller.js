const { validatePost, validatePostUpdate } = require("./validation.js")
const postService = require("./service.js")
const { Post } = require("../../model/Post.js")
const AppError = require("../../utils/AppError.js")
const { apiResponse } = require("../../config/responseHandler.js")

module.exports.createPost = async (req, res) => {
    try {
        await validatePost(req.body)
        const post = await postService.createPost(req.body, req.user,)

        return apiResponse({
            res,
            code: 201,
            message: "Post created successfully",
            status: true,
            data: post
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.getAllPublishedPosts = async (req, res) => {
    try {

        const posts = await postService.getAllPublishedPosts(req.query, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Post fetched successfully",
            status: true,
            data: posts
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.getPostById = async (req, res) => {
    try {

        const post = await postService.getPostById(req)

        return apiResponse({
            res,
            code: 200,
            message: "Post fetched successfully",
            status: true,
            data: post
        })


    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}




module.exports.updatePost = async (req, res) => {
    try {

        if (!req.body) throw new AppError("Missing body part to update post", 400)
        await validatePostUpdate(req.body)

        const updatedPost = await postService.updatePost(req.body, req.params.id, req.user, false)

        return apiResponse({
            res,
            code: 200,
            message: "Post updated successfully",
            status: true,
            data: updatedPost
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.deletePost = async (req, res) => {
    try {

        const deletedPost = await postService.deletePost(req.params.id, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Post deleted successfully",
            status: true
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}



module.exports.publishDraftPost = async (req, res) => {
    try {
        await validatePostUpdate(req.body)

        const updatedPost = await postService.updatePost(req.body, req.params.id, req.user, true)

        return apiResponse({
            res,
            code: 200,
            message: "Post published successfully",
            status: true,
            data: updatedPost
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.getOwnPosts = async (req, res) => {
    try {

        const posts = await Post.find({ author: req.user._id, status: "published" })

        return apiResponse({
            res,
            code: 200,
            message: "Post fetched successfully",
            status: true,
            data: posts
        })


    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }

}




module.exports.likePost = async (req, res) => {
    try {

        await postService.likePost(req)

        return apiResponse({
            res,
            code: 200,
            message: "Post Liked successfully",
            status: true
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.unlikePost = async (req, res) => {
    try {

        await postService.unlikePost(req)

        return apiResponse({
            res,
            code: 200,
            message: "Post unliked successfully",
            status: true
        })


    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}