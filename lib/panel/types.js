export const object = (value) => value !== null && typeof value === 'object';
export const field = (value, key) => object(value) ? value[key] : undefined;
export const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const optionalString = (value) => value === undefined || typeof value === 'string';
function textField(value) {
    if (value == null)
        return true;
    if (!object(value) || Array.isArray(value))
        return false;
    return (value.text == null || typeof value.text === 'string')
        && (value.chars == null || finite(value.chars)) && (value.droppedChars == null || finite(value.droppedChars));
}
/** Invalid persisted fields are counted as malformed; never coerce them into text or token totals. */
export function foldEvent(value) {
    if (typeof value.type !== 'string' || !value.type || typeof value.seq !== 'number' || !Number.isSafeInteger(value.seq) || value.seq < 0
        || !finite(value.time) || value.time < 0 || value.time > 8_640_000_000_000_000)
        return false;
    if (!['role', 'callId', 'name', 'reason', 'errorCode'].every(key => optionalString(value[key])))
        return false;
    if (![value.payload, value.reasoning, value.arguments].every(textField))
        return false;
    if (value.toolCalls !== undefined && !Array.isArray(value.toolCalls))
        return false;
    if (value.usageBuckets !== undefined && (!Array.isArray(value.usageBuckets) || !value.usageBuckets.every(item => typeof item === 'string')))
        return false;
    if (value.usage != null) {
        if (!object(value.usage) || Array.isArray(value.usage))
            return false;
        for (const key of ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens', 'reasoningTokens', 'totalTokens']) {
            if (value.usage[key] !== undefined && !finite(value.usage[key]))
                return false;
        }
    }
    return true;
}
export const missingFile = (error) => field(error, 'code') === 'ENOENT';
