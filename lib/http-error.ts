// Typed error thrown by API helpers, converted into an HTTP response by withErrorHandling
export class HttpError extends Error {
    status: number;
    field?: string;

    constructor(status: number, message: string, field?: string) {
        super(message);
        this.status = status;
        this.field = field;
    }
}
