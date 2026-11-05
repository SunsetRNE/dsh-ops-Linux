import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { RUNTIME_REMOTE } from '../settings/runtime-contract.js';
import { en, zh } from './locales.js';
import { DiscoveryForm } from './selections.js';
import { ShellForm } from './shell-form.js';
import { SETTINGS_CSS } from './styles.js';
export const name = 'dsh-ops-settings';
export const inject = ['slots', 'locale', 'remote'];
export async function apply(ctx) {
    ctx.effect(() => ctx.locale.register('dshOps', { en, zh }), 'dsh-ops: settings dictionaries');
    await ctx.remote.$mount(RUNTIME_REMOTE);
    ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.dshOpsSettings = 'true';
        style.textContent = SETTINGS_CSS;
        document.head.append(style);
        return () => style.remove();
    }, 'dsh-ops: settings styles');
    // Every enhanced-preset row shares the shell form: a mode row owns bashPath and
    // publishBashTool, and the host schema already edits the PTC pool of mode-ptc.
    ctx.slots.inject('plugins.row.config', function* () {
        for (const [row, summary] of [
            ['dsh-ops-mode-minimal', 'modeMinimal'], ['dsh-ops-mode-standard', 'modeStandard'],
            ['dsh-ops-mode-ptc', 'modePtc'], ['dsh-ops-mode-cordis', 'modeCordis'],
        ]) {
            yield ctx.slots.register({ name: 'plugins.row.config', key: `dsh-ops#${row}`, locale: 'dshOps' }, (props) => props.view === 'summary' ? _jsx(_Fragment, { children: props.t(summary) }) : _jsx(ShellForm, { ...props, api: ctx.remote.opsSettings }));
        }
        yield ctx.slots.register({ name: 'plugins.row.config', key: 'dsh-ops#dsh-ops-discovery', locale: 'dshOps' }, (props) => props.view === 'summary' ? _jsx(_Fragment, { children: props.t('discovery') }) : _jsx(DiscoveryForm, { ...props }));
    });
}
