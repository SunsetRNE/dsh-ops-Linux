import { errorMessage } from './types.js';
import { hostForeground } from './host-contract.js';
/** A run hook may have been accepted even when admission itself throws. */
export class BashJobAdmissionError extends Error {
    runInvoked;
    constructor(cause, runInvoked) {
        super(errorMessage(cause), { cause });
        this.runInvoked = runInvoked;
        this.name = 'BashJobAdmissionError';
    }
}
const running = (view) => ['running', 'stopping'].includes(view.status);
export function startBashJob(jobs, args, exec, start) {
    const label = args.description ?? args.command ?? args.script_path ?? 'Bash';
    let process;
    let stopped;
    let runInvoked = false;
    let attempted = false;
    const cancellation = new AbortController();
    const output = ['stdout', 'stderr'].map(stream => ({
        channel: stream,
        read: (offset) => process?.observed[stream].readFrom(offset) ?? { text: '', nextOffset: offset, lossy: false },
    }));
    let id;
    try {
        id = jobs.start({ kind: 'bash', label,
            ...(exec.agent ? { owner: exec.agent.id } : {}), output,
            run: () => {
                runInvoked = true;
                const done = Promise.resolve().then(async () => {
                    cancellation.signal.throwIfAborted();
                    attempted = true;
                    process = await start({ ...exec, signal: cancellation.signal }, { onExpiry: 'none' });
                    if (cancellation.signal.aborted)
                        process.kill(stopped);
                    const value = await process.result();
                    const state = value.cancelled || value.signal || value.timedOut ? 'killed' : value.error ? 'failed' : 'completed';
                    const detail = value.error ?? (value.signal ? `signal: ${value.signal}` : `exit code: ${value.exitCode ?? 0}`);
                    const sandbox = value.sandbox?.runnerFailed ? '; sandbox runner failed before the command ran'
                        : value.sandbox?.denied ? `; sandbox denied file access under ${value.sandbox.mode} mode` : '';
                    return { status: state, detail: detail + sandbox };
                }).catch((error) => ({ status: cancellation.signal.aborted ? 'killed' : 'failed', detail: errorMessage(error) }));
                return { done, cancel: reason => { stopped = reason; cancellation.abort(new Error(reason)); process?.kill(reason); } };
            },
        });
    }
    catch (error) {
        // Cancel the queued microtask before a refused admission can orphan a command.
        cancellation.abort(error);
        process?.kill('job admission failed');
        throw new BashJobAdmissionError(error, runInvoked);
    }
    return { id, label, process: () => process, stopped: () => stopped,
        effects: () => process ? (process.started ? 'unknown' : 'none') : attempted ? 'unknown' : 'none' };
}
export async function waitOnBashJob(jobs, attached, exec, timeoutMs) {
    const owner = exec.agent?.id;
    const stop = async (reason) => {
        jobs.kill(attached.id, owner, reason);
        const settled = await jobs.wait(attached.id, timeoutMs, owner);
        if (!running(settled))
            jobs.remove(attached.id, owner);
    };
    let view;
    try {
        view = await jobs.wait(attached.id, timeoutMs, owner, exec.signal);
    }
    catch (error) {
        await stop('tool call aborted');
        throw error;
    }
    if (running(view)) {
        if (!attached.process()?.started) {
            await stop('timed out during preparation');
            return hostForeground({ timedOut: true, timeoutMs,
                stdout: { text: '', truncated: false }, stderr: { text: '', truncated: false } }, attached.effects());
        }
        const read = jobs.read(attached.id, owner);
        const stdout = read.chunks.filter(chunk => chunk.channel !== 'stderr').map(chunk => chunk.text).join('');
        const stderr = read.chunks.filter(chunk => chunk.channel === 'stderr').map(chunk => chunk.text).join('');
        const text = stdout + (stderr ? `${stdout && !stdout.endsWith('\n') ? '\n' : ''}[stderr]\n${stderr}` : '');
        const loss = read.lossy ? '\n[some output was dropped from memory; full output: '
            + ((read.job.output.spillPaths ?? []).join(', ') || '(unavailable)') + ']' : '';
        return { kind: 'promoted', jobId: attached.id, label: attached.label, timeoutMs, output: text + loss };
    }
    jobs.remove(attached.id, owner);
    const process = attached.process();
    if (!process)
        throw new Error(view.detail ?? 'Bash job preparation failed');
    return hostForeground({ ...await process.result(), ...(attached.stopped() ? { stopped: attached.stopped() } : {}) }, process.started ? 'unknown' : 'none');
}
