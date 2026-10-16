export const successResponse = ({ res, message = "Done", data = null, status = 200 }) => {
    return res.status(status).json({
        message,
        status,
        data
    })
}