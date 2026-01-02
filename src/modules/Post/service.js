
const { logger } = require("../../utils/logging.js")
const postLogger = logger.child({ module: "postService" })
const { Post } = require("../../model/Post.js")
const { User } = require("../../model/User.js")
const AppError = require("../../utils/AppError.js")
const { default: mongoose, mongo } = require("mongoose")

const createPost = async (data, user) => {
    try {


        // first create the slug from the post
        const title = data.title.toLowerCase().replace(/ {2,}/g, " ")
        data.title = title

        const randomStr = Math.random().toString(36).substring(2, 8);

        const slug = title.replaceAll(" ", "-") + "-by-" + user.userName + "-" + randomStr;

        //! problem -> what if a user tries to post with same title then slug becomes same

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



const getAllPublishedPosts = async (page, limit, user) => {
    try {


        /*
        let page = 1 and limit=3 so skip=0 
        page =2 and limit=3 so skip = 3 , means for first page 2 skip first 3 posts
        page =3 and limit=3 so skip=6 , means at page 3 skip first 6 posts
        

        */
        let skip = (page - 1) * limit;

        //determine all the post of the logged in user
        const posts = await Post.find(
            {
                author: user._id,
                status: "published"
            }
        ).skip(skip).limit(limit)


        if (posts.length == 0) throw new AppError("No posts at this Page", 400)

        return posts

    } catch (err) {
        postLogger.error(err.message, { function: "getAllPublishedPosts" })
        throw new AppError(err.message, err.statusCode)
    }
}


const getPostById = async (id) => {
    try {

        // check the id searched by the user is valid object id or not
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid Id format", 400)
        }

        console.log(id)

        const post = await Post.find(
            { _id: id }
        )

        if (!post) throw new AppError("No post exists with this Id", 404)
        // console.log(post)

        return post

    } catch (err) {
        postLogger.error(err.message, { function: "getPostById" })
        throw err
    }
}


const updatePost = async (post, id, user) => {

    try {

        //check does the user has send valid objectId
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid Id format", 400)
        // first check is the user updating its own post or others

        const postToUpdate = await Post.findById(id).populate("author")

        if (!postToUpdate) throw new AppError("No post Exists with this id", 403)

        if (postToUpdate?.author?.id?.toString() != user._id) throw new AppError("Your are not authorized to update others post", 403)

        // if user has changes the title then we need to format the title and slug
        if (post.title) {
            const title = post.title.toLowerCase().replace(/ {2,}/g, " ")
            post.title = title
            const randomStr = Math.random().toString(36).substring(2, 8);
            const slug = title.replaceAll(" ", "-") + "-by-" + user.userName + "-" + randomStr;

            post.title = title;
            post.slug = slug
        }


        //  due to any reason from the server side , if it create the same slug for two posts then in that case lets check and throw internal server Error
        const post = await Post.exists({ slug: post.slug })
        if (post) {
            postLogger.warn("same slug already exist")
            throw new AppError("Internal Server Error", 500)
        }


        const updatedPost = await Post.findByIdAndUpdate(
            id,
            post,
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

        //first check the id format is objectId or not
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid Id format", 400)
        }

        // now check are we authorized to delete that post
        const postToDelete = await Post.findById(id).populate("author")

        if (!postToDelete) throw new AppError("No Post exists with this id", 403)



        if (postToDelete?.author?._id.toString() != user._id) throw new AppError("You are not authorized to delete others posts", 400)


        // now lets delete the post

        const deletedPost = await Post.deleteOne({ _id: id })
        return


    } catch (err) {
        postLogger.error(err.message, { function: "deletePost" })
        throw err
    }
}

module.exports = {
    createPost,
    getAllPublishedPosts,
    getPostById,
    updatePost,
    deletePost
}