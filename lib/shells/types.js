export function errorMessage(error) {
    return String(typeof error === 'object' && error !== null && 'message' in error ? error.message ?? error : error);
}
