import { applyMode } from '../../modes/apply.js';
import { modeConfigForm } from '../../modes/config.js';
export const name = 'dsh-ops-mode-standard';
export const Config = modeConfigForm('standard');
export function apply(ctx, config) { applyMode(ctx, config, 'standard'); }
