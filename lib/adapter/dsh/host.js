/** Runtime half of the DSH product adapter. Optional host services stay optional. */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
export function service(ctx, name) {
    try {
        const value = ctx.get(name);
        return value === undefined || value === null ? undefined : value;
    }
    catch {
        return undefined;
    }
}
/** Scope helpers are deliberately lazy: load-time plugin evaluation needs no DSH scope package. */
export async function loadScopes() {
    return import('@deepseek-ai/dsh-scope');
}
export async function loadCarrierHost(anchor) {
    if (!path.isAbsolute(anchor))
        throw new Error('--host-anchor must be an absolute path to the host package.json.');
    const require = createRequire(anchor);
    const editorRequire = createRequire(require.resolve('@deepseek-ai/dsh-config-editor'));
    const boot = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-app-boot')).href);
    const yaml = await import(pathToFileURL(editorRequire.resolve('yaml')).href);
    const atomic = await import(pathToFileURL(editorRequire.resolve('@deepseek-ai/dsh-atomic-write')).href);
    for (const name of ['loadProfileDirectory', 'composeEntries', 'readProfilePatches', 'resolveBundleDir', 'loadOverlayPatches']) {
        if (typeof boot[name] !== 'function')
            throw new Error(`Host profile API unavailable: ${name}`);
    }
    return { boot, yaml, atomic };
}
