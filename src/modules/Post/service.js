
const { logger } = require("../../utils/logging.js")
const postLogger = logger.child({ module: "postService" })
const { Post } = require("../../model/Post.js")
const { User } = require("../../model/User.js")
const { Comment } = require("../../model/Comment.js")

const { PostView } = require("../../model/PostView.js")
const { Like } = require("../../model/Like.js")
const AppError = require("../../utils/AppError.js")
const { default: mongoose, mongo } = require("mongoose")

const { messages } = require("../../messages/apiResponses.js")

const createPost = async (data, user) => {
    try {
        // first create the slug from the post
        const title = data.title.toLowerCase().replace(/ {2,}/g, " ")
        data.title = title

        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = title.replaceAll(" ", "-") + "-by-" + user.userName + "-" + randomStr;

        //! problem -> what if a user tries to post with same title then slug becomes same
        const postWithSameSlug = await User.find({ slug: slug })
        if (postWithSameSlug.length > 0) {
            postLogger.error("Post with same slug already exists")
            throw new AppError("Internal Server Error", 500)
        }

        // now we create the post
        const post = await Post.create(
            {
                title: data.title,
                slug: slug,
                content: data.content,
                excerpt: data.excerpt,
                author: user._id,
                tags: data.tags,
                category: data.category,
                status: data.status,
                featuredImage: data.featuredImage,
                viewCount: data.viewCount,
                publishedAt: new Date()
            }
        )

        return post;


    } catch (err) {
        postLogger.error(err)
        throw new AppError(err.message, err.statusCode)
    }
}

const getAllPublishedPosts = async (query, user) => {
    try {

        let { page, limit, category, tags, author } = query

        page = Number(query.page) || 1
        limit = Number(query.limit) || 5

        /*
        let page = 1 and limit=3 so skip=0 
        page =2 and limit=3 so skip = 3 , means for first page 2 skip first 3 posts
        page =3 and limit=3 so skip=6 , means at page 3 skip first 6 posts
        */
        let skip = (page - 1) * limit;
        //implementing the dynamc filterin

        const orConditions = []

        if (category) {
            orConditions.push({
                category: new RegExp(`^${category.trim()}`, "i")
            })
        }

        if (tags) {
            orConditions.push({
                tags: {
                    $in: tags.split(",").map(tag => new RegExp(`^${tag.trim()}`, "i"))
                }
            })
        }

        if (author) {
            const userDoc = await User.find({
                userName: new RegExp(`^${author}`, "i")
            })

            const ids = []
            userDoc.forEach((user) => ids.push(user._id))

            orConditions.push({
                author: {
                    $in: ids
                }
            })
        }

        const filter = {
            status: "published"
        }

        if (orConditions.length > 0) filter.$or = orConditions

        console.log(filter)

        //determine all the post of the logged in user
        const posts = await Post.find(
            filter
        ).skip(skip).limit(limit)


        if (posts.length == 0) throw new AppError("No posts at this Page", 404)

        return posts

    } catch (err) {
        postLogger.error(err.message, { function: "getAllPublishedPosts" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getPostById = async (req) => {
    try {

        const id = req.params.id;
        const user = req.user;
        const ua = req.headers["user-agent"]

        // check the id searched by the user is valid object id or not
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(messages.INVALID_ID_FORMAT, 400)
        }

        const post = await Post.findOne(
            { _id: id, status: "published" }
        )

        if (!post) throw new AppError(messages.POST_NOT_FOUND, 404)
        // console.log(post)

        //! now determine total comments on this post
        const commentCount = await Comment.countDocuments({ post: post._id, isDeleted: false })

        const responsePost = {
            ...post.toObject(),
            totalComment: commentCount
        }


        //! now we will update view count by matching is this post already viewed by the same user then dont update othewise update

        const postviewDetail = await PostView.find({ post_id: post._id, user_id: user._id })


        if (postviewDetail.length == 0) {
            await PostView.create({
                post_id: id,
                user_id: user._id,
                ip_address: req.ip,
                user_agent: ua,
                viewed_at: new Date()

            })

            //also increment the value of view-count for the post table
            await Post.updateOne({ _id: id }, { $inc: { viewCount: 1 } })
        }

        return responsePost

    } catch (err) {
        postLogger.error(err.message, { function: "getPostById" })
        throw err
    }
}


const updatePost = async (post, id, user, draftToPublish) => {

    try {

        if (!id) throw new AppError(messages.POST_ID_REQUIRED, 400)

        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        let postToUpdate

        if (draftToPublish) {
            postToUpdate = await Post.findOne({ _id: id, status: "draft" }).populate("author")
        }
        else {
            postToUpdate = await Post.findOne({ _id: id, status: "published" }).populate("author")
        }

        let message = ""
        if (!postToUpdate) {
            draftToPublish == true ? message = messages.DRAFT_POST_NOT_FOUND : message = messages.POST_NOT_FOUND

            throw new AppError(message, 404)
        }

        if (postToUpdate?.author?.id?.toString() != user._id) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        // if user has changes the title then we need to format the title and slug
        if (post?.title) {
            const title = post.title.toLowerCase().replace(/ {2,}/g, " ")
            postToUpdate.title = title
            const randomStr = Math.random().toString(36).substring(2, 8);
            const slug = title.replaceAll(" ", "-") + "-by-" + user.userName + "-" + randomStr;

            postToUpdate.title = title;
            postToUpdate.slug = slug
        }

        if (draftToPublish) postToUpdate.status = "published"

        //  due to any reason from the server side , if it create the same slug for two posts then in that case lets check and throw internal server Error
        const isPostSlugExists = await Post.exists({ slug: post?.slug })
        if (isPostSlugExists) {
            postLogger.warn("same slug already exist")
            throw new AppError("Internal Server Error", 500)
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            postToUpdate,
            { new: true, runValidators: true }
        )

        return updatedPost;
    } catch (err) {
        // postLogger.error(err.message, { function: "updatePost" })
        console.log(err)
        throw err;
    }
}


const deletePost = async (id, user) => {
    try {

        if (!id) throw new AppError(messages.POST_ID_REQUIRED, 400)

        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        // now check are we authorized to delete that post
        const postToDelete = await Post.findOne({ _id: id }).populate("author")

        if (!postToDelete) throw new AppError(messages.POST_NOT_FOUND, 404)

        if (postToDelete?.author?._id.toString() != user._id) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        // now lets delete the post

        const deletedPost = await Post.deleteOne({ _id: id })

        //delete all the comments of it
        await Comment.deleteMany({ post: id })

    } catch (err) {
        postLogger.error(err.message, { function: "deletePost" })
        throw err
    }
}


const likePost = async (req) => {
    try {
        const user = req.user
        const postId = req.params.postId;
        if (!postId) throw new AppError(messages.POST_ID_REQUIRED, 400)

        if (!mongoose.Types.ObjectId.isValid(postId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const post = await Post.findById(postId)
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // check if the user already have liked the post

        const isLiked = await Like.exists({ post_id: postId, user: user._id })

        if (!isLiked) {
            await Like.create({ post_id: postId, user: user._id, liked_at: new Date() })
        }
        return "Post Liked successfully"
    } catch (err) {
        postLogger.error(err.message, { function: "likePost" })
        throw err;
    }
}



const unlikePost = async (req) => {
    try {

        const postId = req.params.postId;
        const user = req.user

        if (!postId) throw new AppError(messages.POST_ID_REQUIRED, 400)

        if (!mongoose.Types.ObjectId.isValid(postId))
            throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const post = await Post.findById(postId)
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        const isLiked = await Like.exists({ post_id: postId, user: user._id })

        if (isLiked) {
            await Like.deleteOne({ post_id: postId, user: user._id })
        }

        return;

    } catch (err) {
        postLogger.error(err.message, { function: "unlike Post" })
        throw err;
    }
}




module.exports = {
    createPost,
    getAllPublishedPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    unlikePost
}