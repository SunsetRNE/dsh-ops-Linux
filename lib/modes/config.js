/**
 * Configuration for a mode row.
 *
 * A mode row carries the file/PTC resolver settings it needs and accepts the
 * compatibility keys older rows used, so one validator owns every accepted key
 * and a malformed row still fails loud and names the offending key.
 */
import { LEGACY_FASTCTX_KEYS, resolveConfig } from '../config.js';
import { parsePtcConfig } from '../ptc/config.js';
import { editable, settingsConfig } from '../settings/schema.js';
import { configObject } from '../settings/schema.js';
/** Every key a mode row accepts: the settings each enhanced preset really reads. */
export const MODE_CONFIG_KEYS = Object.freeze([
    ...LEGACY_FASTCTX_KEYS,
    'binaryPath', 'required', 'denyCredentialReads', 'promptPolicy', 'extraGuidance',
    'bashPath', 'publishBashTool', 'allowSystemShellFallback', 'configUpdateVersion',
    'allowedTools', 'alwaysLoaded',
]);
const PTC_KEYS = new Set(['allowedTools', 'alwaysLoaded']);
/**
 * Validate one mode row's config.
 * @param rawConfig - the loader row's config value.
 * @returns the resolved configuration.
 * @throws ConfigError naming an unknown or malformed key.
 */
export function resolveModeConfig(rawConfig) {
    if (rawConfig !== undefined && rawConfig !== null && (typeof rawConfig !== 'object' || Array.isArray(rawConfig))) {
        throw new Error('config must be an object');
    }
    const raw = (rawConfig ?? {});
    for (const key of Object.keys(raw)) {
        if (!MODE_CONFIG_KEYS.includes(key)) {
            throw new Error(`unknown key(s) ${JSON.stringify(key)}; accepted keys are ${MODE_CONFIG_KEYS.map(entry => JSON.stringify(entry)).join(', ')}`);
        }
    }
    const core = Object.fromEntries(Object.entries(raw).filter(([key]) => !PTC_KEYS.has(key)));
    const ptc = Object.fromEntries(Object.entries(raw).filter(([key]) => PTC_KEYS.has(key)));
    const resolved = resolveConfig(core);
    const api = parsePtcConfig(ptc);
    return { ...resolved, allowedTools: api.allowedTools, alwaysLoaded: api.alwaysLoaded };
}
/**
 * Editable settings fields for one mode row, in the order the host renders them.
 * @param mode - the mode the row enables.
 * @returns field descriptors for the row settings form.
 */
export function modeFields(mode) {
    const shared = {
        publishBashTool: editable('boolean', 'Publish Bash for authorized sessions.'),
        bashPath: editable('string', 'Absolute Bash executor path. Remove the override to select the optional managed installation.'),
    };
    if (mode === 'minimal')
        return shared;
    if (mode === 'ptc')
        return {
            required: editable('boolean', 'Fail startup if the native worker is unavailable.'),
            binaryPath: editable('string', 'Optional explicit native worker path.'),
            allowedTools: editable('array', 'PTC APIs available for SDK selection.', { type: 'string' }),
            alwaysLoaded: editable('array', 'PTC APIs published before SDK selection.', { type: 'string' }),
            promptPolicy: editable('boolean', 'Publish tool routing guidance.'),
        };
    return {
        ...shared,
        promptPolicy: editable('boolean', 'Publish tool routing guidance.'),
        extraGuidance: editable('string', 'Additional tool routing guidance.'),
        binaryPath: editable('string', 'Optional explicit native worker path; omit to use the packaged worker.'),
        required: editable('boolean', 'Fail activation when the native worker is unavailable.'),
        denyCredentialReads: editable('boolean', 'Refuse credential locations during file reads.'),
    };
}
/**
 * The settings descriptor one mode component exports as `Config`.
 * @param mode - the mode the row enables.
 * @returns a settings descriptor that validates with {@link resolveModeConfig}.
 */
export function modeConfigForm(mode) {
    return settingsConfig(value => {
        const raw = configObject(value ?? {});
        const resolved = resolveModeConfig(raw);
        // Keep raw ordinary keys: the host saves individual paths, and the component
        // owns normalization when the row activates.
        return { ...raw, publishBashTool: resolved.publishBashTool, promptPolicy: resolved.promptPolicy };
    }, modeFields(mode));
}
