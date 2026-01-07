const mongoose = require("mongoose")

const postViewSchema = new mongoose.Schema({

    post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    ip_address: String,
    user_agent: String,
    viewed_at: Date


})

module.exports.PostView = mongoose.model("postview", postViewSchema)