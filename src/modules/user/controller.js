const { logger } = require("../../utils/logging.js");
const { validateUser, validateLogin, validateUserUpdate } = require("./validation.js");
const userService = require("./service.js");
const AppError = require("../../utils/AppError.js");
const userLogger = logger.child({ module: "userController" })

const fs = require("fs");
const { Session } = require("../../model/Session.js");
const { generateAccessToken } = require("../../utils/token.js");
const path = require("path");
const { apiResponse } = require("../../config/responseHandler.js");

module.exports.registerUser = async (req, res) => {
    try {

        // console.log(req.body)
        //data from the formdata comes as the string so we need to parse it
        const parsedData = JSON.parse(req.body.data)

        // console.log(parsedData)

        await validateUser(parsedData);

        const user = await userService.registerUser(parsedData, req.file)

        return apiResponse({
            res,
            code: 201,
            message: "User created successfully",
            status: true,
            data: user
        })

    } catch (err) {
        //if any error occured then delete from the disk
        if (req.file) fs.unlinkSync(req.file.path)

        // res.status(err.statusCode || 500).send(err.message)
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}



module.exports.loginUser = async (req, res) => {
    try {

        await validateLogin(req.body)

        const data = await userService.loginUser(req)

        return apiResponse({
            res,
            code: 200,
            message: "User Login succesfully",
            status: true,
            data: data
        })

    } catch (err) {
        userLogger.error(err.message, { function: "loginUser" })
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false
        })
    }
}


module.exports.logoutUser = async (req, res) => {
    try {

        // delete the session of the user
        console.log(req.user._id)
        const s = await Session.updateMany({ userId: req.user._id }, { isValid: false })
        // console.log(s)

        return apiResponse({
            res,
            code: 200,
            message: "User Logout successfully",
            status: true,
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false,
        })
    }
}


module.exports.updateUser = async (req, res) => {
    try {
        const parsedData = JSON.parse(req.body.data)

        await validateUserUpdate(parsedData)
        const user = await userService.updateUser(parsedData, req.file, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "User updated successfully",
            status: true,
            data: user
        })


    } catch (err) {
        try {
            fs.unlinkSync(req.file.path)
        } catch (err) {
            console.log("file still exists in the  directory")
        }
        return apiResponse({
            res,
            code: err.statusCode,
            message: err.message,
            status: false,
        })
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