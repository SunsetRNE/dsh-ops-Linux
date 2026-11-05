import { FILE_TOOLS, PTC_TOOLS, PTC_RESIDENT_TOOLS } from '../capabilities/registry.js';
export { PTC_RESIDENT_TOOLS } from '../capabilities/registry.js';
import { migrateRawNames } from '../compat/alias.js';
export const PTC_LOADABLE_TOOLS = [...FILE_TOOLS, ...PTC_TOOLS].filter(tool => !PTC_RESIDENT_TOOLS.includes(tool));
export function parsePtcConfig(raw = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        throw new Error('PTC config must be an object');
    const input = raw;
    for (const key of Object.keys(input))
        if (!['binaryPath', 'required', 'allowedTools', 'alwaysLoaded'].includes(key))
            throw new Error('Unknown PTC config key: ' + key);
    if (input.binaryPath !== undefined && typeof input.binaryPath !== 'string')
        throw new Error('binaryPath must be a string');
    if (input.required !== undefined && typeof input.required !== 'boolean')
        throw new Error('required must be boolean');
    const names = (key, fallback) => {
        const value = input[key] ?? fallback;
        if (!Array.isArray(value))
            throw new Error(key + ' must be an array of raw API names');
        const migrated = migrateRawNames(value);
        for (const name of migrated)
            if (typeof name !== 'string' || !PTC_LOADABLE_TOOLS.includes(name))
                throw new Error(key + ' contains unsupported API: ' + String(name));
        return [...new Set(migrated)];
    };
    return { binaryPath: input.binaryPath, required: input.required ?? false,
        allowedTools: names('allowedTools', PTC_LOADABLE_TOOLS), alwaysLoaded: names('alwaysLoaded', []) };
}
