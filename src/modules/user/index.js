const express = require("express")
const { registerUser, loginUser, updateUser, refresh } = require("./controller.js")
const { auth } = require("../../middleware/authMiddleware.js")

const multer = require("multer")
const { uploadAvatar } = require("../../utils/Upload.js")
const upload = multer()


const router = express.Router()
router.use(express.json())


router.post("/register", (req, res, next) => {
    uploadAvatar().single("avatar")(req, res, (err) => {
        if (err) {
            res.status(400).json({ message: err.message })
        }
        next()
    })
}, registerUser)  // By using this upload middleware , it adds file info into req.file and text to req.body
router.post("/login", loginUser)
router.post("/refresh", refresh)
router.post("/me", auth, (req, res) => res.status(200).json({ message: "current user profile", data: req.user }))
router.patch("/profile/:id", auth, updateUser)

module.exports = router