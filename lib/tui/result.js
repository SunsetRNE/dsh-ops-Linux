/** Read only OPS outcome facts (presentation metadata or JSON envelopes), never shell stdout or arbitrary tool prose. */
import { FILE_TOOLS, publicToolName } from '../policy.js';
import { OUTCOME_META } from '../kernel/presentation-outcome.js';
import { PTC_TOOLS } from '../ptc/contract.js';
const JSON_TOOLS = new Set([...FILE_TOOLS, ...PTC_TOOLS].map(publicToolName));
const MAX_JSON_BYTES = 64 * 1024;
export const BUSINESS_OUTCOMES = Object.freeze(['completed', 'planned', 'rejected', 'error', 'partial', 'unknown', 'unconfirmed']);
const UNCONFIRMED = Object.freeze({ outcome: 'unconfirmed' });
const integer = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
/** Event payloads are observed defensively, never retained as activity metadata. */
export function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function resultDetails(tool, data, nested) {
    if (!JSON_TOOLS.has(tool) || !record(data))
        return UNCONFIRMED;
    const message = record(data.message) ? data.message : undefined;
    const hostFailed = data.error !== undefined || (nested ? data.isError === true : message?.isError === true);
    // Native results render model text; their outcome travels in the host's replayable presentation metadata.
    const meta = !nested && record(data.meta) ? data.meta[OUTCOME_META] : undefined;
    if (record(meta))
        return summarize(meta, hostFailed);
    const content = nested ? data.content : message?.content;
    // Multiple blocks can be a spill preview plus locator, not the original JSON envelope.
    if (!Array.isArray(content) || content.length !== 1 || !record(content[0]) || content[0].type !== 'text')
        return UNCONFIRMED;
    const text = content[0].text;
    if (typeof text !== 'string' || text.length > MAX_JSON_BYTES || Buffer.byteLength(text, 'utf8') > MAX_JSON_BYTES)
        return UNCONFIRMED;
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        return UNCONFIRMED;
    }
    return record(value) ? summarize(value, hostFailed) : UNCONFIRMED;
}
function summarize(value, hostFailed) {
    const summary = {};
    for (const key of ['done', 'total', 'failed', 'unknown', 'omitted', 'nextOffset']) {
        if (integer(value[key]))
            summary[key] = value[key];
    }
    for (const key of ['complete', 'dryRun'])
        if (typeof value[key] === 'boolean')
            summary[key] = value[key];
    const error = record(value.error) ? value.error : undefined;
    const code = error?.code;
    if (typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(code))
        summary.errorCode = code;
    const outcome = error?.effectState === 'unknown' || (summary.unknown ?? 0) > 0 || value.status === 'unknown' ? 'unknown'
        : value.status === 'rejected' ? 'rejected'
            : value.status === 'error' || value.status === 'failed' ? 'error'
                : (summary.failed ?? 0) > 0 || value.status === 'partial' ? 'partial'
                    : value.status === 'planned' || (value.status === 'completed' && value.dryRun === true) ? 'planned'
                        : value.status === 'completed' ? 'completed' : 'unconfirmed';
    return Object.freeze({ outcome: hostFailed && (outcome === 'completed' || outcome === 'planned') ? 'unconfirmed' : outcome, ...summary });
}
