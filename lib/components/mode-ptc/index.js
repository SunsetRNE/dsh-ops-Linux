import { applyMode } from '../../modes/apply.js';
import { modeConfigForm } from '../../modes/config.js';
export const name = 'dsh-ops-mode-ptc';
export const Config = modeConfigForm('ptc');
export function apply(ctx, config) { applyMode(ctx, config, 'ptc'); }
