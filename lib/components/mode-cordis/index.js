import { applyMode } from '../../modes/apply.js';
import { modeConfigForm } from '../../modes/config.js';
export const name = 'dsh-ops-mode-cordis';
export const Config = modeConfigForm('cordis');
export function apply(ctx, config) { applyMode(ctx, config, 'cordis'); }
