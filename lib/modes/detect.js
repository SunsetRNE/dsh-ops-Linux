import { MODE_IDS, MODE_PRESET } from './types.js';
const modeByPreset = new Map(MODE_IDS.map(mode => [MODE_PRESET[mode], mode]));
/** Read an optional service by name without requiring its type package at load time. */
function service(ctx, name) {
    try {
        const getter = ctx.get;
        const value = typeof getter === 'function' ? Reflect.apply(getter, ctx, [name]) : undefined;
        return value === undefined || value === null ? undefined : value;
    }
    catch {
        return undefined;
    }
}
/**
 * The preset id an Agent is currently composed from.
 * @param ctx - a context on the same Cordis root as the Agent.
 * @param agent - the live Agent.
 * @returns the preset id, or undefined when the host composes no preset for it.
 */
export function presetOf(ctx, agent) {
    const registry = service(ctx, 'agentPresets');
    if (registry !== undefined) {
        try {
            const id = registry.composedPreset?.(agent.ctx);
            if (typeof id === 'string' && id !== '')
                return id;
        }
        catch { /* a collected generation is not a preset for this Agent */ }
    }
    const projections = service(ctx, 'sessionProjections');
    try {
        const state = projections?.stateOf?.(agent.session, 'agentPreset');
        if (typeof state === 'string' && state !== '')
            return state;
    }
    catch { /* projection unavailable */ }
    const header = agent.session?.header;
    const declared = header?.agentPreset;
    return typeof declared === 'string' && declared !== '' ? declared : undefined;
}
/**
 * The OPS mode that applies to an Agent.
 * @param ctx - a context on the same Cordis root as the Agent.
 * @param agent - the live Agent.
 * @returns the mode, or undefined when no enhanced preset applies.
 */
export function modeOf(ctx, agent) {
    const preset = presetOf(ctx, agent);
    if (preset !== undefined)
        return modeByPreset.get(preset);
    // No preset roster means one deployment-wide composition; treat it as the
    // built-in Standard preset so a headless/SDK host keeps the OPS surface.
    return service(ctx, 'agentPresets') === undefined ? 'standard' : undefined;
}
