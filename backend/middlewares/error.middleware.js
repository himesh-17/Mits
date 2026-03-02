function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === "development";

    console.error(err);

    const response = {
        success: false,
        message: isDevelopment ? (err.message || "Internal Server Error") : "Internal Server Error",
    };

    if (isDevelopment && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

export { notFoundHandler, errorHandler };