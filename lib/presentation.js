const probes = new WeakSet();
export function isPresentationProbe(context) { return probes.has(context); }
export async function inspectPresentation(prompt, scope, signal) {
    const context = { scope, signal };
    probes.add(context);
    try {
        return await prompt.assemble(context);
    }
    finally {
        probes.delete(context);
    }
}
export async function isNativePresentation(prompt, scope, signal) {
    const assembly = await inspectPresentation(prompt, scope, signal);
    return !assembly.sections.some(section => section.name === 'tools:ptc-only' && Boolean(section.text.trim()));
}
