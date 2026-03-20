function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === "development";

    console.error(err);

    // Always forward the message for intentional ApiErrors (4xx).
    // For unexpected 500s, hide the internals in production.
    const isClientError = statusCode >= 400 && statusCode < 500;
    const message = (isClientError || isDevelopment)
        ? (err.message || "Internal Server Error")
        : "Internal Server Error";

    const response = {
        success: false,
        message,
    };

    if (isDevelopment && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

export { notFoundHandler, errorHandler };