import { ErrorCode, ErrorMessage } from './errors';

export class ApiError extends Error {
    code: ErrorCode;
    status: number;

    constructor(status: number, code: ErrorCode) {
        super(ErrorMessage[code]);
        this.status = status;
        this.code = code;
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
        case 500:
            return ErrorCode.SERVER_ERROR;
        default:
            return ErrorCode.UNKNOWN;
    }
}
