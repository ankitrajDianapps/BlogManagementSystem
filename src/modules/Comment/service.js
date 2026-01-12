
const { default: mongoose } = require("mongoose")
const AppError = require("../../utils/AppError.js")
const { logger } = require("../../utils/logging.js")
const commentLogger = logger.child({ module: "commentService" })
const { Post } = require("../../model/Post.js")
const { Comment } = require("../../model/Comment.js")

const addComment = async (comment, postId, parentCommentId, user) => {
    try { //NOTE : here the user is one who comments on the post

        if (!postId) throw new AppError("Post Id is required", 400)

        //check the format of comment id
        if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError("Invalid Id format")

        // check if the postId provided by user  exists or not
        const post = await Post.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError("No post exists with this id , post deleted , archived or only drafted", 400)

        console.log(parentCommentId)

        // if parentComment is present with request but that comment is deleted then we dont allow users to add commment on that

        if (parentCommentId) {
            const comment = await Comment.findById(parentCommentId)
            if (!comment) throw new AppError("No comment exists with this id", 400)
            if (comment.isDeleted) throw new AppError("Comment deleted , can't add reply on it", 400)
        }

        //create the commment
        const newComment = await Comment.create({
            content: comment.content,
            post: post._id,
            user: user._id,
            parentCommentId: parentCommentId
        })

        // return await newComment.populate("user", "userName avatar").populate("post", "title")
        // await newComment.save()
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

        if (!postId) throw new AppError("PostId required", 400)

        if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError("Invalid postId format", 400)

        const post = await Post.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError("No posts exists with this id", 400)

        console.log(parentCommentId)

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

        if (!id) throw new AppError("Id is required", 400)

        if (!mongoose.Types.ObjectId.isValid(id))
            throw new AppError("Invalid Id format", 400)

        //check is the comment with this id exist or not
        const comment = await Comment.findOne({ _id: id, isDeleted: false })
        if (!comment) throw new AppError("No any comment exists with this id or deleted", 400)

        // lets check is the user updating his own comment or others
        if (comment.user._id.toString() != user._id) {
            throw new AppError("You are not authorized to update others comment", 403)
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
        if (!id) throw new AppError("Id is required", 400)
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new AppError("Invalid Id Format", 400)

        // lets check is the comment with whis id exist or not
        const comment = await Comment.findById(id)
        if (!comment) throw new AppError("No comment exists with this id", 400)

        // also check is user trying to deleting his own comment
        if (comment.user._id.toString() != user._id) throw new AppError("You are not authorized to delete others comment", 403)


        // now delete the comment
        // const deletedComment = await Comment.deleteOne({ _id: id })

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