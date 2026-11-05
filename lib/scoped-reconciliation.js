const cancelled = new Error('Superseded scope reconciliation');
export function scopedReconciliation(failed) {
    const states = new Map();
    const cancel = (members) => {
        for (const member of members)
            states.get(member)?.controller.abort(cancelled);
    };
    return {
        cancel,
        forget(member) { cancel([member]); states.delete(member); },
        version: (member) => states.get(member),
        run(members, action) {
            const keys = [...members];
            cancel(keys);
            const controller = new AbortController(), { signal } = controller;
            const work = { controller, signal, pending: true, promise: Promise.resolve(),
                current: () => !signal.aborted,
                wait: (promise) => new Promise((resolve, reject) => {
                    const abort = () => reject(cancelled);
                    // Attach both continuations even if already cancelled: a late host
                    // rejection is observed, and can neither publish nor go unhandled.
                    promise.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
                    if (signal.aborted)
                        abort();
                    else
                        signal.addEventListener('abort', abort, { once: true });
                }),
            };
            for (const key of keys)
                states.set(key, work);
            work.promise = Promise.resolve().then(() => { if (work.current())
                return action(work); })
                .catch(error => { if (work.current())
                failed(error); }).finally(() => { work.pending = false; });
            return work.promise;
        },
        async drain(member) {
            const before = states.get(member), pending = before?.pending === true;
            let current;
            do {
                current = states.get(member);
                await current?.promise;
            } while (current !== states.get(member));
            return pending || current !== before;
        },
        async stop() {
            cancel(states.keys());
            await Promise.all([...new Set(states.values())].map(work => work.promise));
            states.clear();
        },
    };
}
/** Ancestor overlays and their descendants commit together; roots stay independent. */
export function scopeFamilies(members, targets, ancestors) {
    const all = new Set(members), groups = new Map();
    const root = (member) => ancestors(member).filter(scope => all.has(scope)).at(-1) ?? member;
    const selected = new Set([...targets].map(root));
    for (const member of all) {
        const key = root(member);
        if (!selected.has(key))
            continue;
        let family = groups.get(key);
        if (!family) {
            family = new Set();
            groups.set(key, family);
        }
        family.add(member);
    }
    return [...groups.values()];
}
