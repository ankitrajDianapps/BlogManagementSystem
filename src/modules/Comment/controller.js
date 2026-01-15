const { addCommentValidaiton } = require("./validation.js")
const commentService = require("./service.js");
const { apiResponse } = require("../../config/responseHandler.js");

module.exports.addComment = async (req, res) => {
    try {

        await addCommentValidaiton(req.body)
        const parentCommentid = req.query.parentCommentId;

        const comment = await commentService.addComment(req.body, req.params.postId, parentCommentid, req.user)
        return apiResponse({
            res,
            code: 201,
            message: "Comment Added succesfully",
            status: true,
            data: comment
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


module.exports.getAllComments = async (req, res) => {
    try {

        const comments = await commentService.getAllComments(req.params.postId, req.query.parentCommentId)

        return apiResponse({
            res,
            code: 200,
            message: "Comment fetched succesfully",
            status: true,
            data: comments
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



module.exports.updateComment = async (req, res) => {
    try {

        await addCommentValidaiton(req.body)
        const updatedComment = await commentService.updateComment(req.params.id, req.body.content, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Comment Updated succesfully",
            status: true,
            data: updatedComment
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


module.exports.deleteComment = async (req, res) => {
    try {
        await commentService.deleteComment(req.params.id, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "Comment deleted succesfully",
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