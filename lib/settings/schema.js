function descriptor(field) {
    return {
        type: field.type, meta: { ...field.meta },
        ...(field.inner ? { inner: descriptor(field.inner) } : {}),
        ...(field.dict ? { dict: Object.fromEntries(Object.entries(field.dict).map(([key, value]) => [key, descriptor(value)])) } : {}),
        // The host strips volatile metadata from its validation copy. Returning a
        // detached tree keeps that operation from corrupting subsequent descriptions.
        toJSON() { return JSON.parse(JSON.stringify({ ...this, toJSON: undefined })); },
    };
}
export const editable = (type, description, inner) => ({
    type, meta: { volatile: true, description }, ...(inner ? { inner } : {}),
});
export function settingsConfig(normalize, fields) {
    return Object.assign(descriptor({ type: 'object', dict: fields }), {
        '~standard': {
            version: 1, vendor: 'dsh-ops',
            validate(value) {
                try {
                    return { value: normalize(value) };
                }
                catch (error) {
                    return { issues: [{ message: error instanceof Error ? error.message : String(error) }] };
                }
            },
        },
    });
}
export function configObject(value) {
    if (value === undefined)
        return {};
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('config must be an object');
    return value;
}
