/** Reviewed replacement choices, shared with the browser without importing host code. */
export const RAW_OFFICIAL_REPLACEMENTS = Object.freeze({
    read: 'inspect_local_file', glob: 'glob', grep: 'grep',
});
export const OFFICIAL_REPLACEMENT_NAMES = Object.freeze(Object.keys(RAW_OFFICIAL_REPLACEMENTS));
