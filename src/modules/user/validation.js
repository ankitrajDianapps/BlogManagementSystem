const AppError = require("../../utils/AppError.js")

module.exports.validateUser = async (data) => {

    if (!data) throw new AppError("user data is required to register", 400)
    if (!data.userName || !data.email || !data.password || !data.fullName || !data.role) {
        throw new AppError("Missing Field", 400)
    }

    // console.log(typeof data.role)
    if (typeof data.fullName != "string") throw new AppError("fullName must be a string", 400)
    if (data.bio && typeof data.role != "string") throw new AppError("role must be a string", 400)
    if (typeof data.bio != "string") throw new AppError("Bio must be  string", 400)
    if (data.isActive && typeof data.isActive != "boolean") throw new AppError("isActive must be a Boolean", 400)
    if (typeof data.role != "string") throw new AppError("role must be a string", 400)
    if (data.avatar && typeof data.avatar != "string") throw new AppError("Avatar must be a string", 400)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new AppError("Invalid Email format", 400)
    }

    const onlyStringRegex = /^[a-zA-Z]+$/
    if (!onlyStringRegex.test(data.fullName)) throw new AppError("fullName can contain only alphabets", 400)
    if (!onlyStringRegex.test(data.role)) throw new AppError("role can contain only alphabets", 400)
    if (!onlyStringRegex.test(data.isActive)) throw new AppError("isActive must be a boolean", 400)


    const roleRegex = /user|author|admin/

    if (data.role && !roleRegex.test(data.role)) throw new AppError(`${data.role} is not a valid role`, 400)


}

module.exports.validateLogin = async (data) => {


    if (!data.email || !data.password) {
        throw new AppError("missing field", 400)
    }


    if (typeof data.password != "string") throw new AppError("Password must be a string", 400)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new AppError("Invalid Email format", 400)
    }

}


module.exports.validateUserUpdate = async (data) => {

    if (!data) throw new AppError("No data found for the update")


    if (data.email) throw new AppError("Email can't be updated", 400)
    if (data.userName) throw new AppError("Username can't be updateed", 400)
    if (data.role) throw new AppError("Role can't be updated", 400)
    if (data.isActive) throw new AppError("isActive field can't be updated", 400)
    if (data.password) throw new AppError("Password field can't be updated", 400)


    const onlyStringRegex = /^[a-zA-Z ]+$/
    if (data.fullName && !onlyStringRegex.test(data.fullName)) throw new AppError("FullName must contain only alphabets")
    if (data.bio && typeof data.bio != "string") throw new AppError("Bio must be String", 400)
    if (data.avatar && typeof data.avatar != "string") throw new AppError("Avatar url must be String", 400)






}