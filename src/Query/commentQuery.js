const { logger } = require("../utils/logging.js")
const queryLogger = logger.child({ module: "CommentQueryLogger" })
const mongoose = require("mongoose")
const { Comment } = require("../model/Comment.js")


const computeTotalCommentsForUserPosts = async (authorId) => {

    try {
        const aggregateCommentsResult = await Comment.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    as: "post"
                }
            },
            { $unwind: "$post" },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 }
                }
            }
        ]);

        console.log(aggregateCommentsResult[0])

        const totalComments = aggregateCommentsResult[0]?.totalComments || 0

        return totalComments
    }
    catch (err) {
        queryLogger.error(err.message, { function: "computeTotalCommentsForUserPosts" })
    }


}





module.exports = {
    computeTotalCommentsForUserPosts
}