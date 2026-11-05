import { applyComponent } from '../../index.js';
export { Config } from '../../settings/file-config.js';
export const name = 'dsh-ops-file';
export function apply(ctx, config) { applyComponent(ctx, config, 'file'); }
