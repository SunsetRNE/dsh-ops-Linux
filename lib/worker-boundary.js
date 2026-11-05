export function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function errorText(error) {
    return String(record(error) ? error.message ?? error : error);
}
