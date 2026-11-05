import { applyMode } from '../../modes/apply.js';
import { modeConfigForm } from '../../modes/config.js';
export const name = 'dsh-ops-mode-minimal';
export const Config = modeConfigForm('minimal');
export function apply(ctx, config) { applyMode(ctx, config, 'minimal'); }
