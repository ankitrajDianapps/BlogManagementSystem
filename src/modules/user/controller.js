const { User } = require("../../model/User.js");
const { logger } = require("../../utils/logging.js");
const { validateUser, validateLogin, validateUserUpdate } = require("./validation.js");
const userService = require("./service.js");
const AppError = require("../../utils/AppError.js");
const userLogger = logger.child({ module: "userController" })

const fs = require("fs/promises");
const { Session } = require("../../model/Session.js");
const { generateAccessToken } = require("../../utils/token.js");
const path = require("path");

module.exports.registerUser = async (req, res) => {
    try {

        // console.log(req.body)
        //data from the formdata comes as the string so we need to parse it
        const parsedData = JSON.parse(req.body.data)

        // console.log(parsedData)

        await validateUser(parsedData);

        const user = await userService.registerUser(parsedData, req.file)

        res.status(201).json({ message: "User Registered successfully", user })

    } catch (err) {
        //if any error occured then delete from the disk
        fs.unlinkSync(req.file.path)

        res.status(err.statusCode || 500).send(err.message)
    }
}



module.exports.loginUser = async (req, res) => {
    try {

        await validateLogin(req.body)

        const data = await userService.loginUser(req)

        res.status(200).json(data)

    } catch (err) {
        userLogger.error(err.message, { function: "loginUser" })
        res.status(err.statusCode || 500).send(err.message)
    }
}


module.exports.logoutUser = async (req, res) => {
    try {

        // delete the session of the user
        console.log(req.user._id)
        const s = await Session.updateMany({ userId: req.user._id }, { isValid: false })
        console.log(s)

        res.status(200).json({ message: "Logged out successsfully" })

    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}


module.exports.updateUser = async (req, res) => {
    try {


        const parsedData = JSON.parse(req.body.data)

        if (!req.params.id) throw new AppError("Id is required to update the user", 400)

        await validateUserUpdate(parsedData)
        const user = await userService.updateUser(parsedData, req.file, req.params.id, req.user)

        res.status(200).json({ message: "User updated successfully", data: user })


    } catch (err) {
        try {
            fs.unlinkSync(req.file.path)
        } catch (err) {
            console.log("file still exists in the  directory")
        }
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}




module.exports.refresh = async (req, res) => {
    try {

        const { refreshToken } = req.body;
        console.log(refreshToken)

        if (!refreshToken) throw new AppError("refresh token required", 400)

        //search for the user with same refres token
        const user = await Session.findOne(
            { refreshToken: refreshToken, isValid: true }
        )

        if (!user) throw new AppError("Your session has expired , Login again", 401)

        const accessToken = await generateAccessToken(user._id);

        res.status(200).json({ message: "Access token refreshed successfully", data: accessToken })


    } catch (err) {
        console.log(err)
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}