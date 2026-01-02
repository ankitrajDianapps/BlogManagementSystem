const express = require('express')
const { connectDB } = require('./config/db.js')
const userRoutes = require("./modules/user")
const postRoutes = require("./modules/Post")



const app = express()

app.use(express.json())
connectDB()

app.use("/api/auth", userRoutes)
app.use("/api/posts", postRoutes)

app.listen(8000, () => {
    console.log("Server is listening at port 8000")

})
