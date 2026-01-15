const mongoose = require("mongoose")

const postEngagementSchema = mongoose.Schema({
    post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    date: Date,
    view_count: {
        type: Number,
        default: 0
    },
    comment_count: {
        type: Number,
        default: 0
    },
    like_count: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
)

module.exports.PostEngagement = mongoose.model("post_engagement", postEngagementSchema)