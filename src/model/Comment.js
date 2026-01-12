const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Types.ObjectId,
            ref: "post"
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        parentCommentId: {
            type: mongoose.Types.ObjectId
        },
        content: {
            type: String,
            required: true,
            trim: true
        },

        isEdited: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
)


module.exports.Comment = mongoose.model("comment", commentSchema)
