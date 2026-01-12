const { addCommentValidaiton } = require("./validation.js")
const commentService = require("./service.js")
const AppError = require("../../utils/AppError.js")


module.exports.addComment = async (req, res) => {
    try {

        await addCommentValidaiton(req.body)
        const parentCommentid = req.query.parentCommentId;

        const comment = await commentService.addComment(req.body, req.params.postId, parentCommentid, req.user)

        res.status(200).json({ message: "Comment added successfully", comment: comment })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getAllComments = async (req, res) => {
    try {

        const comments = await commentService.getAllComments(req.params.postId, req.query.parentCommentId)

        res.status(200).json({ message: "comment fetched successfully", comments: comments })

    } catch (err) {
        res.status(err.statusCode).json({ message: err.message })
    }
}



module.exports.updateComment = async (req, res) => {
    try {


        await addCommentValidaiton(req.body)
        const updatedComment = await commentService.updateComment(req.params.id, req.body.content, req.user)

        res.status(200).json({ message: "comment updated successfully", comment: updatedComment })


    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}


module.exports.deleteComment = async (req, res) => {
    try {
        await commentService.deleteComment(req.params.id, req.user)

        res.status(200).json({ message: "comment deleted successfully" })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })

    }
}