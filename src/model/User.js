const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        bio: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "admin", "author"],
            required: true,
            lowercase: true
        },
        avatar: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
        },
        lastLogin: {
            type: Date,
        }
    }
)


module.exports.User = mongoose.model("user", userSchema)