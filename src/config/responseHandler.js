

const apiResponse = ({ res, code, message, status, data }) => {
    return res.status(code || 500).json(
        {
            message,
            status,
            data
        }
    )
}

module.exports = { apiResponse }