export const RUNTIME_ACTIONS = ['install-bash', 'remove-bash', 'upgrade-pwsh'];
const codec = (name, parse) => ({
    mode: 'strict', typeSymbol: `dsh-ops#${name}`, create: () => ({ parse }),
});
function enumValue(value, choices) {
    if (typeof value !== 'string' || !choices.includes(value))
        throw new Error(`Expected one of: ${choices.join(', ')}`);
    return value;
}
export const parseAction = (value) => enumValue(value, RUNTIME_ACTIONS);
export const parseSource = (value) => enumValue(value, ['managed', 'git']);
function planId(value) {
    if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value))
        throw new Error('Expected a current runtime plan identifier');
    return value;
}
const jsonResult = codec('RuntimeResult', value => value);
function method(name, parameter, cancellable = false) {
    return { id: `dsh-ops#opsSettings/${name}`, service: 'opsSettings', namespace: 'opsSettings', method: name,
        invocation: { kind: 'direct' }, result: jsonResult,
        parameters: parameter ? [{ name: parameter.wire, wire: parameter.wire, source: 'json', codec: parameter.codec }] : [],
        ...(cancellable ? { cancellation: { parameter: 'signal' } } : {}),
    };
}
export const RUNTIME_DESCRIPTORS = Object.freeze([
    method('snapshot'), method('plan', { wire: 'action', codec: codec('RuntimeAction', parseAction) }),
    method('select', { wire: 'source', codec: codec('BashSource', parseSource) }),
    method('execute', { wire: 'id', codec: codec('RuntimePlanId', planId) }, true),
]);
export const RUNTIME_REMOTE = Object.freeze({ package: 'dsh-ops', descriptors: RUNTIME_DESCRIPTORS });
