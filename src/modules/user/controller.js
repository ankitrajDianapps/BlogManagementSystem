const { User } = require("../../model/User.js");
const { logger } = require("../../utils/logging.js");
const { validateUser, validateLogin, validateUserUpdate } = require("./validation.js");
const userService = require("./service.js");
const AppError = require("../../utils/AppError.js");
const userLogger = logger.child({ module: "userController" })

const fs = require("fs");
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

        res.status(200).json({ message: "User Registered successfully", user })

    } catch (err) {
        // console.log(err)
        // userLogger.error(err, { function: "registerUser" })

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


module.exports.updateUser = async (req, res) => {
    try {

        if (!req.params.id) throw new AppError("Id is required to update the user", 400)

        //check that a user can only update its only profile not others , while doing authorization we have saved the current loginedUser in req.user

        if (req.user._id.toString() != req.params.id) throw new AppError("You are not authorized to update other users profile", 400)


        await validateUserUpdate(req.body)
        const user = await userService.updateUser(req.body, req.params.id)

        res.status(200).json({ message: "User updated successfully", data: user })


    } catch (err) {
        userLogger.error(err.message)
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

        if (!user) throw new AppError("Your session has expired , Login again", 400)

        const accessToken = await generateAccessToken(user._id);

        res.status(200).json({ message: "Access token refreshed successfully", data: accessToken })


    } catch (err) {
        console.log(err)
        res.status(err.statusCode || 500).json({ message: err.message })
    }
}