const { logger } = require("../utils/logging.js")
const midlogger = logger.child({ module: "roleMiddleware" })

module.exports.isAuthor = async (req, res, next) => {
    try {
        // get the current logged in user
        const user = req.user
        const role = user.role;

        if (role != "author") {
            res.status(400).json({ message: "only authors are allowed to create a post" })
        }
        next()

    } catch (err) {
        midlogger.error(err.message)
    }

}