export const ErrorCode = {
    BAD_REQUEST: 'BAD_REQUEST',
    CONFLICT: 'CONFLICT',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export function getErrorMessage(code: ErrorCode, detail?: string): string {
    switch (code) {
        case ErrorCode.BAD_REQUEST:
            return 'Please check the form and try again.';
        case ErrorCode.CONFLICT:
            return detail
                ? `This ${detail} is already registered.`
                : 'This value is already registered.';
        case ErrorCode.NOT_FOUND:
            return 'The requested resource was not found.';
        case ErrorCode.UNAUTHORIZED:
            return 'You are not authorized to do this.';
        case ErrorCode.SERVER_ERROR:
            return 'Something went wrong on our end.';
        default:
            return 'An unexpected error occurred.';
    }
}
