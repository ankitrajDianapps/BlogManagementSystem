const { User } = require("../model/User.js")

const inActiveUserCleanup = async () => {
    try {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

        await User.updateMany(
            { lastLogin: { $lte: ninetyDaysAgo } },
            { isActive: false })

    } catch (err) {
        console.log(err.message)
    }
}


module.exports = inActiveUserCleanup