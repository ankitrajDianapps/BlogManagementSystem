const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        excerpt: {
            type: String,
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "published"
        },
        tags: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            trim: true
        },
        featuredImage: {
            type: String,
        },
        viewCount: {
            type: Number,
            default: 0
        },
        publishedAt: {
            type: Date,
        }
    },
    { timestamps: true }
)



module.exports.Post = mongoose.model("post", postSchema)
