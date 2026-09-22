export const ErrorCode = {
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorMessage: Record<ErrorCode, string> = {
    BAD_REQUEST: 'Please check the form and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to do this.',
    SERVER_ERROR: 'Something went wrong on our end.',
    UNKNOWN: 'An unexpected error occurred.',
};
