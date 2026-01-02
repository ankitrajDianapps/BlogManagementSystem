const AppError = require("./AppError.js")
const { logger } = require("./logging.js")
const uploadLogger = logger.child({ module: "Upload" })
const path = require("path")
const multer = require("multer")

module.exports.uploadAvatar = () => {
    try {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                const filePath = path.join(__dirname, "../uploads/Avatar")
                cb(null, filePath)
                // const ext = path.extname(file.originalname).toLowerCase()
                // const mime = file.mimetype;
                // console.log(ext)
                // console.log(mime)
            },
            filename: function (req, file, cb) {
                const parsedData = JSON.parse(req.body.data)
                const name = parsedData.userName + file.originalname;
                cb(null, name)
            }

        })

        const fileFilter = (req, file, cb) => {
            const allowed = /jpeg|jpg|png/

            const ext = path.extname(file.originalname).toLowerCase()
            const mime = file.mimetype

            if (allowed.test(ext) && allowed.test(mime)) {
                cb(null, true)
            } else {
                cb(new Error("Only images are allowed"), false)

            }
        }


        return multer({
            storage,
            fileFilter
        })


    } catch (err) {
        uploadLogger.error(err.message)


    }
}



