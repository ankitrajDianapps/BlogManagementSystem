
const { default: mongoose } = require("mongoose")
const AppError = require("../../utils/AppError.js")
const { logger } = require("../../utils/logging.js")
const commentLogger = logger.child({ module: "commentService" })
const { Post } = require("../../model/Post.js")
const { Comment } = require("../../model/Comment.js")
const { messages } = require("../../messages/apiResponses.js")

const addComment = async (comment, postId, parentCommentId, user) => {
    try { //NOTE : here the user is one who comments on the post

        //check the format of comment id
        if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        // check if the postId provided by user  exists or not
        const post = await Post.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // console.log(parentCommentId)

        // if parentComment is present with request but that comment is deleted then we dont allow users to add commment on that

        if (parentCommentId) {
            const comment = await Comment.findOne({ _id: parentCommentId, isDeleted: false })
            if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)
        }

        //create the commment
        const newComment = await Comment.create({
            content: comment.content,
            post: post._id,
            user: user._id,
            parentCommentId: parentCommentId
        })

        await newComment.populate("user", "userName avatar")
        await newComment.populate("post", "title")
        return newComment


    } catch (err) {
        commentLogger.error(err.message, { function: "addComment" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getAllComments = async (postId, parentCommentId) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const post = await Post.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // console.log(parentCommentId)

        //if post exist then determine the comments of that post
        const comment = await Comment.find({ post: postId, parentCommentId: parentCommentId }).populate("user", "userName avatar")

        return comment

    } catch (err) {
        commentLogger.error(err.message, { function: "getAllComments" })
        throw err
    }
}

const updateComment = async (id, content, user) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(id))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        //check is the comment with this id exist or not
        const comment = await Comment.findOne({ _id: id, isDeleted: false })
        if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)

        // lets check if the user updating its own comment or others
        if (comment.user._id.toString() != user._id) {
            throw new AppError(messages.UNAUTHORIZED_ACTION, 403)
        }

        //now update the comment
        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content: content, isEdited: true },
            { new: true }
        )

        return updatedComment


    } catch (err) {
        commentLogger.error(err.message, { function: "updateComment" })
        throw err
    }
}



const deleteComment = async (id, user) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        // lets check is the comment with whis id exist or not
        const comment = await Comment.findOne({ _id: id, isDeleted: false })
        if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)

        // also check is user trying to deleting his own comment
        if (comment.user._id.toString() != user._id) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        // we will  not delete the comment , instead we mark it as isDeleted false an make its content as comment deleted  but its replies still  exists

        await Comment.updateOne({ _id: id }, { isDeleted: true, content: "content deleted" })
        return;

    } catch (err) {
        commentLogger.error(err.message)
        throw err
    }
}


module.exports = {
    addComment,
    getAllComments,
    updateComment,
    deleteComment
}