const mongoose = require("mongoose")

const postViewSchema = new mongoose.Schema({

    postId: {
        type: mongoose.Types.ObjectId,
        require: true
    },
    ip_address: string,
    user_agent: string,
    viewed_at: Date


})

module.exports.PostView = mongoose.model("postview", postViewSchema)