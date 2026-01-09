const mongoose = require("mongoose")


const likeSchema = mongoose.Schema({

    user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    post_id: mongoose.Types.ObjectId,
    liked_at: Date
},
)

module.exports.Like = mongoose.model("like", likeSchema)