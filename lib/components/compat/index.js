import { joinCompatibility } from '../../modes/registry.js';
export const name = 'dsh-ops-compat';
export function apply(ctx) {
    const leave = joinCompatibility(ctx, true);
    ctx.effect(() => () => leave(), 'dsh-ops: compatibility switch');
    ctx.logger.info('dsh-ops: Compatibility mode is on; official tools stay exposed. Token efficiency and model ability are reduced.');
}
