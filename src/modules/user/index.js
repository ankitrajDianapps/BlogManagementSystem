const express = require("express")
const multer = require("multer")
const { registerUser, loginUser, updateUser, refresh, logoutUser } = require("./controller.js")
const { auth } = require("../../middleware/authMiddleware.js")
const { uploadAvatar } = require("../../utils/Upload.js")
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

router.post("/profile", auth, (req, res) => res.status(200).json({ message: "current user profile", data: req.user }))

router.patch("/update-profile", auth, (req, res, next) => {
    uploadAvatar().single("avatar")(req, res, (err) => {
        if (err) {
            res.status(400).json({ message: err.message })
        }
        next()
    })
}, updateUser)

router.post("/logout", auth, logoutUser)

module.exports = router