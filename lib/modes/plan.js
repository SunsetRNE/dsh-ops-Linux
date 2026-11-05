import { publicToolName } from '../policy.js';
/** Raw resident native file capabilities: one per replaced official tool plus the multi-file reader. */
export const NATIVE_RESIDENT_RAW = Object.freeze(['inspect_local_file', 'glob', 'grep', 'read_files', 'result']);
/** Official Windows shell names the host may publish. Only visible ones are replaced. */
export const SHELL_OFFICIAL_NAMES = Object.freeze(['pwsh', 'pwsh_persistent']);
const NATIVE_REPLACEMENTS = Object.freeze(['read', 'glob', 'grep']);
/** Everything one mode publishes; consumers read this instead of branching on ids. */
export const MODE_PLANS = Object.freeze({
    // Minimal keeps its terse prompts: only the Windows shell is replaced, and
    // advanced tools arrive through the discovery entry when that row is on.
    minimal: Object.freeze({ nativeFiles: false, replacements: [], shell: true, ptc: false, discovery: 'all', section: null }),
    standard: Object.freeze({ nativeFiles: true, replacements: NATIVE_REPLACEMENTS, shell: true, ptc: false, discovery: 'advanced', section: 'standard' }),
    ptc: Object.freeze({ nativeFiles: false, replacements: [], shell: true, ptc: true, discovery: 'none', section: 'ptc' }),
    cordis: Object.freeze({ nativeFiles: true, replacements: NATIVE_REPLACEMENTS, shell: true, ptc: false, discovery: 'advanced', section: 'cordis' }),
});
/**
 * The resident native capability names of one mode.
 * @param mode - the mode to read.
 * @returns public OPS names, or an empty list when the mode publishes no native file tools.
 */
export function residentTools(mode) {
    return MODE_PLANS[mode].nativeFiles ? NATIVE_RESIDENT_RAW.map(raw => publicToolName(raw)) : [];
}
