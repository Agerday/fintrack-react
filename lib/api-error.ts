import { ErrorCode, getErrorMessage } from './errors';

export class ApiError extends Error {
    code: ErrorCode;
    status: number;
    field?: string;

    constructor(status: number, code: ErrorCode, field?: string, serverMessage?: string) {
        // Field validation errors (400) and business-rule conflicts (409 without a field, e.g.
        // "A paid invoice cannot be deleted") keep the precise server message. Everything else
        // uses our mapping: a duplicate field (409 + field) reads better as "This email is already registered."
        const useServerMessage =
            serverMessage &&
            ((code === ErrorCode.BAD_REQUEST && field) || (code === ErrorCode.CONFLICT && !field));
        super(useServerMessage ? serverMessage : getErrorMessage(code, field));
        this.status = status;
        this.code = code;
        this.field = field;
    }
}

export function mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
        case 400:
            return ErrorCode.BAD_REQUEST;
        case 401:
            return ErrorCode.UNAUTHORIZED;
        case 404:
            return ErrorCode.NOT_FOUND;
        case 409:
            return ErrorCode.CONFLICT;
        case 500:
            return ErrorCode.SERVER_ERROR;
        default:
            return ErrorCode.UNKNOWN;
    }
}
