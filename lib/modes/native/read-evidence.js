import { exactJson } from './read-observation.js';
export function generation(session) {
    try {
        const value = session.surface.contentGeneration;
        return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
    }
    catch {
        return;
    }
}
export function readRecord(observation, exec) {
    return { ...observation, callId: exec.callId, name: exec.name, args: exactJson(exec.arguments) };
}
/** Positive evidence is the exact role, source, durable identity and body in this provider request. */
export function requestProof(options, state) {
    const proof = new Map();
    for (const entry of state.records) {
        if (!entry.messageId)
            continue;
        const results = options.messages.filter(message => message.role === 'tool' && message.id === entry.messageId);
        if (results.length !== 1)
            continue;
        const result = results[0];
        if (!result || result.role !== 'tool' || result.isError || result.toolCallId !== entry.callId
            || result.source.kind !== 'tool' || result.source.callId !== entry.callId
            || exactJson(result.content) !== exactJson([{ type: 'text', text: entry.body }]))
            continue;
        const resultIndex = options.messages.indexOf(result);
        const calls = options.messages.slice(0, resultIndex).flatMap(message => message.role === 'assistant' && message.source.kind === 'model'
            ? message.content.filter(block => block.type === 'tool-call' && block.id === entry.callId) : []);
        if (calls.length !== 1)
            continue;
        const call = calls[0];
        if (!call || call.type !== 'tool-call' || call.name !== entry.name)
            continue;
        try {
            if (exactJson(JSON.parse(call.arguments)) === entry.args)
                proof.set(entry, entry.messageId);
        }
        catch { /* Raw arguments that cannot identify this successful call are not proof. */ }
    }
    return proof;
}
