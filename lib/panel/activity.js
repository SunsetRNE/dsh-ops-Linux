/** Fence queued work before shutdown, while callers await operations already running. */
export function activityGate() {
    let stopped = false;
    const cancelled = new Error('Panel collection stopped');
    return {
        async run(operation) {
            if (stopped)
                throw cancelled;
            return operation();
        },
        stop() { stopped = true; },
        cancelled(error) { return error === cancelled; },
    };
}
