const mongoose = require("mongoose")


const trendingPostSchema = mongoose.Schema(
    {
        post: {
            type: mongoose.Types.ObjectId,
            ref: "post",
            required: true,
            index: true
        },
        trending_at: {
            type: Date,
            required: true,
            index: true
        },
        total_views_on_trending_day: Number,

    },
    { timestamps: true }
)

module.exports.TrendingPost = mongoose.model("trending_post", trendingPostSchema)