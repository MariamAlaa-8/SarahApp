import express from 'express'
import cors from 'cors'
import { connectDB } from './DB/connection.db.js'
import { globalErrorHandling } from './middleware/index.js'
import { PORT } from './config.js'
import { authenticationController } from './modules/authentication/index.js'
import { usersController } from './modules/users/index.js'
import { messageController } from './modules/message/index.js'
import { anonymousController } from './modules/anonymous/index.js'
import morgan from 'morgan'
const app = express()

app.use(cors(),morgan('common'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/assets", express.static("./assets"))

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to sarahApp API'
    })
})

app.use('/auth', authenticationController)
app.use('/users', usersController)
app.use('/messages', messageController)
app.use('/anonymous', anonymousController)

app.all('*', (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server`, {
        cause: { status: 404 }
    }))
})

app.use(globalErrorHandling)

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error.message)
})

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason)
})
const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()