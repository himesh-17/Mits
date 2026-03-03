function sendSuccess(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

function sendError(res, message, statusCode = 400, errors = null) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
}

export { sendSuccess, sendError };