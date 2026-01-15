const { logger } = require("../utils/logging.js")
const midlogger = logger.child({ module: "roleMiddleware" })

module.exports.isAuthor = async (req, res, next) => {
    try {
        // get the current logged in user
        const user = req.user
        const role = user.role;

        if (role != "author") {

            return apiResponse({
                res,
                code: 400,
                message: "only authors are allowed to create a post",
                status: false
            })
        }
        next()

    } catch (err) {
        midlogger.error(err.message)
    }
}