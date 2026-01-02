const jwt = require("jsonwebtoken")

module.exports.generateAccessToken = async (userId) => {


    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "20m" }
    )
}


module.exports.generateRefreshToken = async (userId) => {
    return jwt.sign(
        { userId },
        process.env.REFRESH_SECRET,
        {
            expiresIn: "10d"
        }
    )
}