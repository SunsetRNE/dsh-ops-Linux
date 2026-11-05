import { ConfigError } from '../config.js';
import { DISCOVERY_TERMS } from '../capabilities/discovery.js';
import { migrateRawNames } from '../compat/alias.js';
export const DISCOVERABLE_TOOLS = Object.freeze(Object.keys(DISCOVERY_TERMS));
export const DISCOVERY_CONFIG_KEYS = Object.freeze(['enabled', 'maxResults', 'allowedTools', 'alwaysLoaded', 'binaryPath', 'required', 'denyCredentialReads']);
export function resolveDiscoveryConfig(raw = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        throw new ConfigError('discovery config must be an object');
    const input = raw;
    for (const key of Object.keys(input)) {
        if (!DISCOVERY_CONFIG_KEYS.includes(key)) {
            throw new ConfigError(`unknown discovery key: ${key}`);
        }
    }
    const boolean = (key, fallback) => {
        if (input[key] === undefined)
            return fallback;
        if (typeof input[key] !== 'boolean')
            throw new ConfigError(`${key} must be boolean`);
        return input[key];
    };
    const names = (key, fallback) => {
        const list = input[key] === undefined ? fallback : input[key];
        if (!Array.isArray(list))
            throw new ConfigError(`${key} must be an array of implemented capability names`);
        const migrated = migrateRawNames(list);
        for (const name of migrated)
            if (typeof name !== 'string' || !Object.hasOwn(DISCOVERY_TERMS, name)) {
                throw new ConfigError(`${key} contains an unavailable capability: ${JSON.stringify(name)}`);
            }
        return [...new Set(migrated)];
    };
    const maxResults = input.maxResults === undefined ? 3 : input.maxResults;
    if (typeof maxResults !== 'number' || !Number.isInteger(maxResults) || maxResults < 1 || maxResults > 5)
        throw new ConfigError('maxResults must be an integer from 1 to 5');
    if (input.binaryPath !== undefined && (typeof input.binaryPath !== 'string' || !input.binaryPath.trim()))
        throw new ConfigError('binaryPath must be a nonempty string');
    const allowedTools = names('allowedTools', DISCOVERABLE_TOOLS);
    const alwaysLoaded = names('alwaysLoaded', []);
    for (const tool of alwaysLoaded)
        if (!allowedTools.includes(tool))
            throw new ConfigError(`alwaysLoaded capability ${tool} must be in allowedTools`);
    return { enabled: boolean('enabled', true), maxResults, allowedTools, alwaysLoaded,
        binaryPath: input.binaryPath, required: boolean('required', false),
        denyCredentialReads: boolean('denyCredentialReads', true) };
}
