import { ApiError } from "./ApiError.js";

function validateRequest(validator) {
    return (req, res, next) => {
        const { error } = validator(req.body);

        if (error) {
            return next(new ApiError(400, error.message || "Validation failed"));
        }

        next();
    };
}

export { validateRequest };