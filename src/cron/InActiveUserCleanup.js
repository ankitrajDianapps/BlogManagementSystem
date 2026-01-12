const { User } = require("../model/User.js")

const inActiveUserCleanup = async () => {
    try {

        // find the user from the user table whose lastlogin field is more than 90 days

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

        const user = await User.find({ lastLogin: { $lte: ninetyDaysAgo } })

        if (user.length == 0) {
            console.log("no user to inactivate")
            return;
        }
        const userIds = []
        user.forEach(u => {
            userIds.push(u._id)
        })

        await User.updateMany(
            { _id: { $in: [userIds] } },
            { isActive: false }
        )



    } catch (err) {
        console.log(err.message)
    }
}


module.exports = inActiveUserCleanup