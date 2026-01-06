const mongoose = require("mongoose")

const replySchema = new mongoose.Schema(
    {
        parentComment: {
            type: mongoose.Types.ObjectId,
            ref: "comment"
        },

        post: {
            type: mongoose.Types.ObjectId,
            ref: "post"
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        parentReply: {
            type: mongoose.Types.ObjectId,
            ref: "reply"
        },

        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
)


module.exports.Reply = mongoose.model("reply", replySchema)