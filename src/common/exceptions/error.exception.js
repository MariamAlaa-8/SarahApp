export const ApplicationException = ({
    message = "error",
    options = {
        cause: { status: 400 }
    }
} = {}) => {
    throw new Error(message, options);
}
export const BadException = (message = "BadRequest", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 400, ...extra }
        }
    });
}
export const TooManyException = (message = "TooManyException", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 429, ...extra }
        }
    });
}
export const ConflictException = (message = "conflict", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 409, ...extra }
        }
    });
}
export const NotfoundException = (message = "Notfound", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 404, ...extra }
        }
    });
}
export const UnauthorizedException = (message = "Unauthorized", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 401, ...extra }
        }
    });
}
export const UnauthorizedExecution = (message = "Unauthorized", extra = {}) => {
    return UnauthorizedException(message, extra);
}
export const ForbiddenException = (message = "Forbidden", extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 403, ...extra }
        }
    });
}
export const ForbiddenExecution = (message = "Forbidden", extra = {}) => {
    return ForbiddenException(message, extra);
}