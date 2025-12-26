"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
const constants_1 = require("../constants");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message) {
        super(message, constants_1.HTTP_STATUS.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, constants_1.HTTP_STATUS.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, constants_1.HTTP_STATUS.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, constants_1.HTTP_STATUS.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends BadRequestError {
    errors;
    constructor(errors) {
        super(Object.values(errors).join(", "));
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map