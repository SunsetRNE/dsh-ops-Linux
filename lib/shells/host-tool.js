import { errorMessage } from './types.js';
import { BashArgumentError, isBashArgumentError } from './argument-error.js';
import { approveBashPolicy } from './approval.js';
import { HOST_BASH_OUTPUT_SCHEMA, hostFailure, hostForeground, renderHostBash } from './host-contract.js';
import { BashJobAdmissionError, startBashJob, waitOnBashJob } from './jobs.js';
import { createJsonDigestProjection } from './json-digest.js';
import { bashPresentationMeta, presentBashCall, presentBashResult } from './presentation.js';
export const HOST_MAX_BASH_TIMEOUT_MS = 600_000;
export function hostBashDefinition(ctx, base, createExecution, resolveWorkdir, jobs) {
    // The registry arrives already bound by the component (`ctx.inject(['jobs'], …)`), exactly as the
    // host's own bash tool does it. Re-reading a tracked service at call time returns a fresh traceable
    // proxy, so an identity comparison against the definition-time value can never hold and must not
    // decide whether background work is available.
    const parameters = { ...base.parameters, required: ['description'], properties: {
            ...base.parameters.properties,
            description: { type: 'string', description: 'Required: clear active-voice description of this command, 5–10 words.' },
            timeoutMs: { type: 'number', description: 'Defaults to 120000 ms; capped at 600000 ms. With host jobs, expiry hands the running command to job_output/job_kill; otherwise it stops the command.' },
            ...(jobs ? { run_in_background: { type: 'boolean', description: 'Return a host job id immediately; collect with job_output and stop with job_kill. No execution timeout.' } } : {}),
            sandbox_permissions: { type: 'string', enum: ['workspace-write', 'danger-full-access'], description: 'After a real denial, request the narrowest wider mode for this exact command with justification. Approval applies only to this call. Do not bypass a rejection.' },
            justification: { type: 'string', description: 'One sentence explaining why this command needs wider access, in the user’s language. Required when changing sandbox_permissions.' },
        } };
    const projection = createJsonDigestProjection();
    return {
        ...base,
        description: 'Execute a Bash command in a fresh shell using the host sandbox, approvals and jobs. Relative workdir uses the current session workspace. Output is bounded with spill paths. Use command for host-compatible calls; script_path is an OPS extension for an existing script file. Verify resolved absolute targets before delete or move. Never bypass a sandbox denial by switching shells.',
        parameters: { ...parameters },
        projectContent: projection.projectContent,
        // The host validates this value against the declared schema before invoking its renderer.
        output: { schema: HOST_BASH_OUTPUT_SCHEMA, render: (_args, value) => [{ type: 'text', text: renderHostBash(value) }], presentationMeta: bashPresentationMeta },
        presentCall: presentBashCall,
        presentResult: presentBashResult,
        async execute(input, exec = {}) {
            const complete = async (value) => { await projection.prepare(value, exec); return value; };
            let timeoutMs = 120_000;
            let policy;
            let attempted = false;
            let process;
            try {
                if (!input || typeof input !== 'object' || Array.isArray(input))
                    throw new BashArgumentError('invalid arguments: expected an object', 'arguments');
                const args = input;
                const unknown = Object.keys(args).find(key => !Object.hasOwn(parameters.properties, key));
                if (unknown !== undefined)
                    throw new BashArgumentError(`invalid arguments: unknown key ${JSON.stringify(unknown)}; this tool accepts ${Object.keys(parameters.properties).join(', ')}`, unknown);
                if (args.run_in_background !== undefined && typeof args.run_in_background !== 'boolean')
                    throw new BashArgumentError('invalid run_in_background: expected a boolean', 'run_in_background');
                const { run_in_background, sandbox_permissions, justification, ...local } = args;
                if (local.timeoutMs !== undefined && (typeof local.timeoutMs !== 'number' || !Number.isFinite(local.timeoutMs) || local.timeoutMs <= 0))
                    throw new BashArgumentError('invalid timeoutMs: expected a positive finite number', 'timeoutMs');
                timeoutMs = Math.min(local.timeoutMs ?? 120_000, HOST_MAX_BASH_TIMEOUT_MS);
                local.timeoutMs = timeoutMs;
                local.workdir = resolveWorkdir(local, exec.agent?.session);
                // Pure validation occurs before approval, job admission or physical preparation.
                base.resolve(local);
                if (typeof args.description !== 'string' || !args.description.trim())
                    throw new BashArgumentError('invalid description: expected a non-empty string', 'description');
                if (!exec.agent?.session?.id)
                    return hostFailure('EXECUTOR_UNAVAILABLE: an authoritative session is required.', timeoutMs);
                const standing = ctx.get('sandboxPolicy')?.resolve({ session: exec.agent.session });
                if (!standing || !['read-only', 'workspace-write', 'danger-full-access'].includes(standing.mode))
                    return hostFailure('EXECUTOR_UNAVAILABLE: authoritative session policy is unavailable.', timeoutMs);
                policy = await approveBashPolicy(ctx, args, exec, standing);
                exec.signal?.throwIfAborted();
                const dshEnv = ctx.get('shellEnv')?.collect(exec) ?? {};
                const approvedPolicy = policy;
                const start = async (execution, options) => {
                    attempted = true;
                    process = await createExecution(local, execution, standing, approvedPolicy, dshEnv, options);
                    return process;
                };
                if (jobs) {
                    let attached;
                    try {
                        attached = startBashJob(jobs, args, exec, start);
                    }
                    catch (error) {
                        if (run_in_background || attempted || error instanceof BashJobAdmissionError && error.runInvoked)
                            throw error;
                        ctx.logger?.warn?.(`Bash job admission refused; using the foreground deadline: ${errorMessage(error)}`);
                    }
                    if (attached)
                        return run_in_background ? { kind: 'background', jobId: attached.id, label: attached.label } : await complete(await waitOnBashJob(jobs, attached, exec, timeoutMs));
                }
                else if (run_in_background)
                    return hostFailure('EXECUTOR_UNAVAILABLE: the host job registry is unavailable.', timeoutMs);
                const execution = await start(exec, {});
                const result = await execution.result();
                return await complete(hostForeground(result, execution.started ? 'unknown' : 'none'));
            }
            catch (error) {
                const message = isBashArgumentError(error) ? `INVALID_BASH_ARGUMENT: ${errorMessage(error)}` : errorMessage(error);
                return { ...hostFailure(message, timeoutMs, process ? (process.started ? 'unknown' : 'none') : attempted ? 'unknown' : 'none', exec.signal?.aborted === true), ...(policy ? { sandbox: { mode: policy.mode, denied: false } } : {}) };
            }
        },
    };
}
