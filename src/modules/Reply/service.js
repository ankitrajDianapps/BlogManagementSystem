const { logger } = require("../../utils/logging.js")
const replyLogger = logger.child({ module: "ReplyService" })
const mongoose = require("mongoose")
const { Comment } = require("../../model/Comment.js")
const { Reply } = require("../../model/Reply.js")
const AppError = require("../../utils/AppError.js")


const addReply = async (reply, commentId, user) => {
    try {
        if (!commentId) throw new AppError("comment Id is required", 400)

        //check the format of comment id
        if (!mongoose.Types.ObjectId.isValid(commentId)) throw new AppError("Invalid Id format")

        // check if the commentIdprovided by user  exists or not
        const comment = await Comment.findOne({ _id: commentId })
        if (!comment) throw new AppError("No comment exists with this id ", 400)


        //create the reply
        const newReply = await Reply.create({
            content: reply.content,
            post: comment.post._id,
            user: user._id,
            parentComment: commentId
        })

        // return await newComment.populate("user", "userName avatar").populate("post", "title")
        // await newComment.save()

        await newReply.populate("parentComment", "content")
        await newReply.populate("user", "userName avatar")
        await newReply.populate("post", "title")
        return newReply

    } catch (err) {
        replyLogger.error(err.message, { function: "addReply" })
        throw err
    }
}


const getReply = async (commentId, user) => {
    try {

        if (!commentId) throw new AppError("commentId required", 400)

        if (!mongoose.Types.ObjectId.isValid(commentId)) throw new AppError("Invalid commentId format", 400)

        const comment = await Comment.findOne({ _id: commentId })
        if (!comment) throw new AppError("No comment exists with this id", 400)


        // if comment exist then determine the reply of that post(NOTE : dont return the nested replies as normak reply)
        const replies = await Reply.find({ parentComment: commentId, parentReply: undefined }).populate("user", "userName avatar")



        // const replies = await Reply.aggregate([
        //     {
        //         $match: {
        //             parentComment: new mongoose.Types.ObjectId(commentId),
        //             parentReply: { $exists: false }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "replies",
        //             let: { rid: "$_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: { $eq: ["$parentReply", "$$rid"] }
        //                     }
        //                 },
        //                 { $count: "count" }
        //             ],
        //             as: "replyMeta"
        //         }
        //     },
        //     {
        //         $addFields: {
        //             replyCount: {
        //                 $ifNull: [{ $arrayElemAt: ["$replyMeta.count", 0] }, 0]
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             replyMeta: 0
        //         }
        //     }
        // ])



        return replies

    } catch (err) {
        replyLogger.error(err.message, { function: "getReply" })
        throw err;
    }
}


const updateReply = async (content, replyId, user) => {
    try {

        if (!replyId) throw new AppError("Reply Id is required", 400)

        if (!mongoose.Types.ObjectId.isValid(replyId)) throw new AppError("Invalid Id format", 400)

        //checg if reply exists with this id or not
        const reply = await Reply.findById(replyId)

        if (!reply) throw new AppError("No reply exists with this Id", 400)

        if (reply.user._id.toString() != user._id) throw new AppError("You are not authorized to update others reply", 403)

        const updatedReply = await Reply.findByIdAndUpdate(replyId, { content: content }, { new: true }).populate("user", "userName")
        return updatedReply;


    } catch (err) {
        replyLogger.error(err.message, { function: "updateReply" })
        throw err;
    }
}


const deleteReply = async (id, user) => {
    try {

        if (!id) throw new AppError("Reply Id is required", 400)
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid Id format", 400)

        const reply = await Reply.findById(id)
        if (!reply) throw new AppError("No Reply exists with this Id", 400)

        if (reply.user._id.toString() != user._id) throw new AppError("You are not authorized to delete others reply", 403)

        await Reply.deleteOne({ _id: id })
        return;


    } catch (err) {
        replyLogger.error(err.message)
        throw err;
    }
}


const addNestedReply = async (replyId, content, user) => {
    try {

        if (!replyId) throw new AppError("Id required", 400)

        if (!mongoose.Types.ObjectId.isValid(replyId)) throw new AppError("Invalid Id format", 400)

        const reply = await Reply.findById(replyId)
        if (!reply) throw new AppError("No reply exists with this id", 400)

        const nestedReply = await Reply.create(
            {
                content: content,
                parentComment: reply.parentComment._id,
                parentReply: reply._id,
                post: reply.post._id,
                user: user._id
            }
        )

        await nestedReply.populate("user", "userName avatar")

        return nestedReply
    } catch (err) {
        replyLogger.error(err.message, { function: "addNestedReply" })
        throw err
    }
}




const getRepliesByReplyId = async (replyId) => {
    try {

        if (!replyId) throw new AppError("ID is required", 400)

        if (!mongoose.Types.ObjectId.isValid(replyId)) throw new AppError("InvalidId format", 400)

        //check is  the replyId provided by user exist or not
        const reply = await Reply.findById(replyId)
        if (!reply) throw new AppError("No reply exists with this id")


        const nestedReplies = await Reply.find({
            parentReply: reply
        }).populate("user", "userName avatar")

        return nestedReplies;



    } catch (err) {
        replyLogger.error(err.message, { function: "getReplyByReplyId" })
    }
}


module.exports = {
    addReply,
    getReply,
    updateReply,
    deleteReply,
    addNestedReply,
    getRepliesByReplyId
}