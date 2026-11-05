/** Trusted cache metadata comes from the host, never tool arguments or selected operation roots. */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { workerEnvelope } from '../worker-protocol.js';
import { CAPABILITIES } from '../capabilities/registry.js';
import { publicToolName } from '../policy.js';
import { prepareWorkspace } from '../workspace-preparation.js';
import { resultSessionNonce, registerResultCleanup } from './result-lifecycle.js';
const locations = new WeakMap();
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** Parse only the runner's pre-separator contract, not the wrapped program's arguments. */
export function windowsCacheLocation(argv) {
    const separator = argv.indexOf('--');
    if (separator < 1)
        return undefined;
    const flags = argv.slice(1, separator);
    const one = (flag) => {
        const index = flags.indexOf(flag);
        return index >= 0 && flags.lastIndexOf(flag) === index ? flags[index + 1] : undefined;
    };
    const root = one('--temp'), sid = one('--temp-write-sid');
    const match = /^S-1-4-([1-9][0-9]*)-([1-9][0-9]*)-1$/.exec(sid ?? '');
    if (!root || !path.win32.isAbsolute(root) || root.includes('\0') || !match
        || match.slice(1).some(part => Number(part) > 1073741823))
        return undefined;
    return { root, windowsWriteSid: sid };
}
/**
 * bwrap gives workspace-write children a private tmpfs over /tmp, which hides the host-created
 * cache below tmpdir(). Re-expose exactly that one private directory; every other runner, and
 * read-only bwrap (no tmpfs), already sees it and is returned unchanged.
 */
export function exposePosixCache(argv, storage) {
    const separator = argv.indexOf('--');
    if (!storage || storage.windowsWriteSid !== undefined || separator < 1 || path.basename(argv[0]) !== 'bwrap'
        || !argv.slice(1, separator).some(option => option === '--tmpfs' || option.startsWith('--tmpfs='))
        || !path.isAbsolute(storage.root))
        return [...argv];
    return [...argv.slice(0, separator), '--bind', storage.root, storage.root, ...argv.slice(separator)];
}
function posixCacheLocation(key, create) {
    const parent = fs.realpathSync(tmpdir()), root = path.join(parent, `dsh-ops-results-${key}`);
    // Only one fresh leaf under the canonical temp root. No recursive mkdir through caller paths.
    if (create) {
        try {
            fs.mkdirSync(root, { mode: 0o700 });
        }
        catch (error) {
            if (error.code !== 'EEXIST')
                throw error;
        }
    }
    if (!fs.existsSync(root))
        return undefined;
    const info = fs.lstatSync(root);
    if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) !== 0
        || (process.getuid && info.uid !== process.getuid()))
        throw new Error('Result cache parent must be private and owned');
    return { root };
}
function currentTools(ctx, scope, tool) {
    const tools = ctx.get('tools'), visible = new Set(tools?.schemas(scope).map(item => item.name) ?? []);
    return CAPABILITIES.filter(item => item.rawName === tool
        || (visible.has(publicToolName(item.rawName)) && tools?.get(publicToolName(item.rawName), scope)))
        .map(item => item.rawName);
}
async function purge(ctx, session, file, storage, original) {
    const policyService = ctx.get('sandboxPolicy'), subprocess = ctx.get('subprocess');
    const policy = policyService?.resolve({ session });
    if (!policy || !subprocess || policy.mode === 'read-only' || policy.workspaceRoot !== original.workspaceRoot)
        throw new Error('Cleanup authority unavailable');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
    timer.unref?.();
    try {
        let argv = [file];
        if (policy.mode !== 'danger-full-access') {
            const confined = await ctx.get('sandbox')?.confine(argv, { ...policy, mode: 'workspace-write' }, controller.signal);
            if (!confined || !['full', 'partial'].includes(confined.enforcement) || !confined.argv.length)
                throw new Error('Cleanup confinement unavailable');
            if (process.platform === 'win32' && windowsCacheLocation(confined.argv)?.root !== storage.root)
                throw new Error('Cleanup cache grant changed');
            argv = exposePosixCache(confined.argv, storage);
        }
        const latest = policyService?.resolve({ session });
        if (latest?.mode !== policy.mode || latest?.workspaceRoot !== policy.workspaceRoot)
            throw new Error('Cleanup authority changed');
        const envelope = workerEnvelope('ptc', { root: policy.workspaceRoot, scope: session.id, tool: 'result', args: { action: 'purge' }, read_only: false }, 5000, storage);
        const handle = subprocess.spawn({ argv, cwd: policy.workspaceRoot, stdio: { stdin: { data: JSON.stringify(envelope) }, stdout: { maxBytes: 4096 }, stderr: { maxBytes: 4096 } }, graceMs: 1000, signal: controller.signal });
        const outcome = await handle.done, output = handle.collected.stdout.readFrom(0);
        const value = JSON.parse(output.text);
        if (outcome.exitCode !== 0 || outcome.signal || output.lossy || !value || typeof value !== 'object'
            || !('status' in value) || value.status !== 'completed')
            throw new Error('Cache purge did not complete');
    }
    finally {
        clearTimeout(timer);
    }
}
export async function resultStorage(ctx, session, scope, file, tool, policy, denyRoots, denyNames, signal, confined) {
    const nonce = resultSessionNonce(ctx, session), key = digest([session.id, policy.workspaceRoot, nonce]);
    const owner = ctx.root ?? ctx;
    let cache = locations.get(owner);
    if (!cache) {
        cache = new Map();
        locations.set(owner, cache);
    }
    let location = cache.get(key);
    if (process.platform === 'win32') {
        if (!location && policy.mode !== 'read-only') {
            if (policy.sessionId !== session.id)
                return undefined;
            // Full access is voluntarily narrowed for cache preparation; file execution keeps its own path.
            const cachePolicy = { ...policy, mode: 'workspace-write' };
            if (!confined) {
                const sandbox = ctx.get('sandbox');
                if (!sandbox)
                    return undefined;
                await prepareWorkspace(cachePolicy);
                confined = await sandbox.confine([file], cachePolicy, signal);
            }
            if (!['full', 'partial'].includes(confined.enforcement))
                return undefined;
            location = windowsCacheLocation(confined.argv);
        }
    }
    else
        location ??= posixCacheLocation(key, policy.mode !== 'read-only');
    if (!location)
        return undefined;
    cache.set(key, location);
    const storage = { ...location, authorityId: digest([nonce, policy.mode, policy.workspaceRoot, denyRoots, denyNames]), allowedTools: currentTools(ctx, scope, tool) };
    registerResultCleanup(ctx, session, key, async () => {
        try {
            await purge(ctx, session, file, storage, policy);
        }
        finally {
            cache.delete(key);
        }
    });
    return storage;
}
