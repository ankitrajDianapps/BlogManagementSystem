const { addReplyValidation } = require("./validation.js")
const replyService = require("./service.js")
const AppError = require("../../utils/AppError.js")


module.exports.addReply = async (req, res) => {
    try {

        await addReplyValidation(req.body)
        const reply = await replyService.addReply(req.body, req.params.commentId, req.user)

        res.status(200).json({ message: "Reply added successfully", reply: reply })


    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getReply = async (req, res) => {
    try {

        const replies = await replyService.getReply(req.params.commentId, req.body)

        res.status(200).json({ message: "reply fetched successfully", reply: replies })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}



module.exports.updateReply = async (req, res) => {
    try {

        await addReplyValidation(req.body)

        const updatedReply = await replyService.updateReply(req.body.content, req.params.id, req.user)

        res.status(200).json({ message: "Reply updated successfully", reply: updatedReply })




    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.deleteReply = async (req, res) => {
    try {

        await replyService.deleteReply(req.params.id, req.user)

        res.status(200).json({ message: "Reply deleted successfully" })


    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}



module.exports.addNestedReply = async (req, res) => {
    try {

        await addReplyValidation(req.body)
        const reply = await replyService.addNestedReply(req.params.replyId, req.body.content, req.user)

        res.status(200).json({ message: "reply addded successfully", reply: reply })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.getRepliesByReplyId = async (req, res) => {
    try {

        const replies = await replyService.getRepliesByReplyId(req.params.replyId)

        res.status(200).json({ message: "nested replies fetched successfully", replies: replies })
    } catch (err) {
        res.status(err.statusCode).json({ message: err.message })
    }
}