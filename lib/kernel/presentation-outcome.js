/** Bounded outcome facts persisted as host presentation metadata: replayable for UIs, never model-facing. */
export const OUTCOME_META = 'opsOutcome';
const COUNTERS = ['done', 'total', 'failed', 'unknown', 'omitted', 'nextOffset'];
const FLAGS = ['complete', 'dryRun'];
const EFFECTS = new Set(['none', 'applied', 'partial', 'unknown']);
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
/** Copy only status, the error code/effect and safe counters; paths, messages and payloads never leave the value. */
export function outcomeFacts(value) {
    const facts = {};
    if (!record(value))
        return facts;
    if (typeof value.status === 'string' && /^[a-z][a-z-]{0,31}$/.test(value.status))
        facts.status = value.status;
    for (const key of COUNTERS) {
        const count = value[key];
        if (typeof count === 'number' && Number.isSafeInteger(count) && count >= 0)
            facts[key] = count;
    }
    for (const key of FLAGS) {
        const flag = value[key];
        if (typeof flag === 'boolean')
            facts[key] = flag;
    }
    if (record(value.error)) {
        const error = {};
        if (typeof value.error.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(value.error.code))
            error.code = value.error.code;
        if (typeof value.error.effectState === 'string' && EFFECTS.has(value.error.effectState))
            error.effectState = value.error.effectState;
        facts.error = error;
    }
    return facts;
}
/** dsh-tools `output.presentationMeta` for Native tools whose model text is not a JSON envelope. */
export function presentationMeta(_args, value) {
    return { [OUTCOME_META]: outcomeFacts(value) };
}
