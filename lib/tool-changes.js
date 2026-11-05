let changing;
const dispatches = new WeakMap();
export function toolChangeScopes() { return changing?.consumed ? undefined : changing?.scopes; }
export function withToolChange(scopes, action) {
    const previous = changing;
    changing = { scopes: previous && !previous.consumed ? previous.scopes.length && scopes.length ? [...previous.scopes, ...scopes] : [] : scopes, consumed: false };
    try {
        return action();
    }
    finally {
        changing = previous;
    }
}
/** Every dispatch has its own args array; nested unwrapped mutations receive no attribution. */
export function onToolChange(ctx, callback) {
    ctx.on('internal/dispatch', (_type, name, args) => {
        if (name !== 'tools/change')
            return;
        if (!dispatches.has(args)) {
            const scopes = toolChangeScopes();
            dispatches.set(args, scopes);
            if (changing)
                changing.consumed = true;
        }
        callback(dispatches.get(args));
    }, { prepend: true, global: true });
}
