const { User } = require("../../model/User.js")
const { logger } = require("../../utils/logging.js")
const bcrypt = require("bcryptjs")
const AppError = require("../../utils/AppError.js")
const { generateAccessToken, generateRefreshToken } = require("../../utils/token.js")
const { Session } = require("../../model/Session.js")

const uaParser = require("ua-parser-js")
const { uploadAvatar } = require("../../utils/Upload.js")

const serviceLogger = logger.child({ module: "userService " })

const registerUser = async (data, file) => {

    try {

        const hashedPassword = await bcrypt.hash(data.password, 10)

        //lets check if  user with same  email or username alreay exist
        const isUserNameExists = await User.findOne(
            { userName: data.userName }
        )

        if (isUserNameExists) {
            throw new AppError("userName already exists", 400)
        }

        const isEmailExists = await User.findOne(
            { email: data.email }
        )
        if (isEmailExists) {
            throw new AppError("email already exists", 400)
        }


        //?------Upload profile image




        // let registeredUser;
        console.log(file)

        const registeredUser = await User.create(
            {
                userName: data.userName,
                email: data.email,
                role: data.role,
                password: hashedPassword,
                bio: data.bio,
                fullName: data.fullName,
                isActive: data.isActive,
                avatar: file?.filename,
                lastLogin: data.lastLogin
            }
        )
        return registeredUser;
    } catch (err) {
        console.log(err)
        serviceLogger.error(err.message, { function: "registerUser" })
        throw new AppError(err.message, err.statusCode)
    }

}


const loginUser = async (req) => {
    try {
        const data = req.body;

        //first check if a user with this email  exist or not
        const user = await User.findOne({ email: data.email }).select("+password")
        if (!user) throw new AppError("User with this email not registered", 400)

        //if user exists then determine the password and match it

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) throw new AppError("wrong password", 400)

        // now user has entered credentials
        // now we create access token

        const accessToken = await generateAccessToken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        console.log(accessToken)
        // console.log(refreshToken)

        //hash the refreshToken before saving it to the DB
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

        // as we are implementing only single device login , so first letss invalidate if any session of this user already exist

        await Session.updateMany(
            { userId: user._id },
            { isValid: false }
        )

        // now create a session for this user
        //we get the detail for the device in the headers in user-agents

        const ua = uaParser(req.headers["user-agent"])
        const Device = JSON.stringify(ua, null, " ")

        await Session.create(
            {
                userId: user._id,
                refreshToken: hashedRefreshToken,
                deviceType: Device.os,
                deviceModel: Device.device,
                IpAddress: req.ip
            }
        )

        return { message: "User Logged in succesfully", token: { accessToken, hashedRefreshToken } }
    } catch (err) {
        serviceLogger.error(err.message)
        if (!err.statusCode) throw new AppError("Internal server Error", 500)
        throw new AppError(err.message, err.statusCode)
    }
}



const updateUser = async (data, id) => {
    try {

        // first check if a user exist with this or not
        const user = await User.find(
            { _id: id }
        )

        if (!user) throw new AppError("No user Exists with this id", 400)


        const updatedUser = await User.updateOne(
            { _id: id },
            {
                fullName: data.fullName,
                role: data.role,
                bio: data.bio,
                isActive: data.isActive,
                avatar: data.avatar
            },
            { runValidators: true }
        )

        return updatedUser


    } catch (err) {
        serviceLogger.error(err.message)
        throw new AppError(err.message, err.statusCode)
    }
}

module.exports = {
    registerUser,
    loginUser,
    updateUser
}