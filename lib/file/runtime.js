import { WORKER_TIMEOUT_MS } from '../worker-protocol.js';
import { publicToolName } from '../policy.js';
import { definition } from './contract.js';
import { NATIVE_FILE_TOOLS } from '../capabilities/registry.js';
import { resultDefinition, invokeResult } from './result.js';
import { registerNativeProvider } from './result-provider.js';
import { safeDisposeAll } from '../teardown.js';
import { invoke, failure } from './worker.js';
import { createNativeReadDedup } from '../modes/native/read-dedup.js';
export class NativeFileTools {
    ctx;
    config;
    report;
    file;
    active;
    disposers;
    stopped;
    readDedup;
    unregisterProvider;
    constructor({ ctx, config, report }) {
        this.ctx = ctx;
        this.config = config;
        this.report = report ?? (() => { });
        this.file = undefined;
        this.active = new Map();
        this.disposers = [];
        this.stopped = false;
        this.readDedup = createNativeReadDedup(ctx);
    }
    async start(names = NATIVE_FILE_TOOLS) {
        this.file = this.config.workerPath;
        if (!this.file) {
            if (this.config.required)
                throw new Error('Native file worker path is unavailable.');
            return [];
        }
        const definitions = names.map(rawName => this.definition(rawName));
        // Discovery starts a worker without a resident surface. Do not emit a
        // registry change for an empty provider on every newly attached agent.
        if (definitions.length)
            this.unregisterProvider = await registerNativeProvider(this.ctx, definitions, tool => this.ctx.tools.register(tool));
        return names.map(publicToolName);
    }
    definition(rawName) {
        const execute = (args, exec) => this.call(rawName, args, exec);
        return this.readDedup.wrap(rawName === 'result' ? resultDefinition(execute) : definition(rawName, execute));
    }
    async call(tool, args, exec) {
        if (this.stopped)
            return failure('POLICY_DENIED', 'Native file component is disposed.');
        if (!this.file)
            return failure('EXECUTOR_UNAVAILABLE', 'Native file worker path is unavailable.');
        const controller = new AbortController();
        const abort = () => controller.abort(exec?.signal?.reason);
        if (exec?.signal?.aborted)
            abort();
        else
            exec?.signal?.addEventListener?.('abort', abort, { once: true });
        const timer = setTimeout(() => controller.abort(new Error('Native file call timed out')), Math.min(this.config.toolCallTimeoutMs ?? WORKER_TIMEOUT_MS, WORKER_TIMEOUT_MS));
        timer.unref?.();
        const work = tool === 'result'
            ? invokeResult(this.ctx, this.file, args, exec, controller.signal, this.config)
            : invoke(this.ctx, this.file, tool, args, exec, controller.signal, this.config);
        this.active.set(controller, work);
        try {
            return await work;
        }
        finally {
            clearTimeout(timer);
            this.active.delete(controller);
            exec?.signal?.removeEventListener?.('abort', abort);
        }
    }
    cancel(reason) {
        for (const controller of this.active.keys())
            controller.abort(new Error(reason));
    }
    async stop() {
        this.stopped = true;
        this.readDedup.dispose();
        safeDisposeAll([this.unregisterProvider].filter((dispose) => typeof dispose === 'function'), error => this.report('dsh-ops: Native pager teardown failed: ' + error, 'warn'), 'result provider');
        for (const controller of this.active.keys())
            controller.abort(new Error('Native file component unloaded'));
        await Promise.allSettled(this.active.values());
        // Isolate each teardown: one throwing worker registration must not strand the rest.
        safeDisposeAll(this.disposers.splice(0), (error, where) => {
            this.report(`dsh-ops: ${where} teardown failed: ${error instanceof Error ? error.message : String(error)}`, 'warn');
        }, 'file runtime stop');
    }
}
