import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DISCOVERY_TERMS } from '../capabilities/discovery.js';
import { OFFICIAL_REPLACEMENT_NAMES as replacements } from '../capabilities/replacements.js';
import { checked, FormActions, strings, Unavailable, useEditor } from './forms.js';
const readReplacement = (value) => strings(value.replaceTools);
export function ReplacementForm(props) {
    const { form, t } = props, editor = useEditor(form, readReplacement, t);
    if (!editor.ready)
        return _jsx(Unavailable, { ...props });
    return _jsxs("form", { className: "ops-settings", onSubmit: event => { event.preventDefault(); void editor.save([{ op: 'set', path: ['replaceTools'], value: editor.draft }]); }, children: [_jsx("p", { children: t('replacementsHelp') }), _jsxs("fieldset", { disabled: editor.busy, children: [_jsx("legend", { children: t('replacements') }), replacements.map(name => _jsxs("label", { className: "ops-settings-choice", children: [_jsx("input", { type: "checkbox", checked: editor.draft.includes(name), onChange: event => editor.edit(checked(editor.draft, name, event.target.checked)) }), _jsxs("span", { children: [t(name), " ", _jsx("code", { children: name })] })] }, name))] }), _jsx("p", { className: "ops-settings-note", children: t('replacementPool') }), _jsx(FormActions, { ...editor, t: t })] });
}
const names = Object.keys(DISCOVERY_TERMS);
const readDiscovery = (value) => ({ allowed: strings(value.allowedTools), always: strings(value.alwaysLoaded), enabled: value.enabled !== false, limit: String(value.maxResults ?? 3) });
export function DiscoveryForm(props) {
    const { form, t } = props, editor = useEditor(form, readDiscovery, t), draft = editor.draft;
    const limit = Number(draft.limit), valid = Number.isInteger(limit) && limit >= 1 && limit <= 5;
    if (!editor.ready)
        return _jsx(Unavailable, { ...props });
    return _jsxs("form", { className: "ops-settings", onSubmit: event => {
            event.preventDefault();
            if (valid)
                void editor.save([
                    { op: 'set', path: ['enabled'], value: draft.enabled }, { op: 'set', path: ['maxResults'], value: limit },
                    { op: 'set', path: ['allowedTools'], value: draft.allowed }, { op: 'set', path: ['alwaysLoaded'], value: draft.always },
                ]);
        }, children: [_jsxs("label", { className: "ops-settings-choice", children: [_jsx("input", { type: "checkbox", checked: draft.enabled, disabled: editor.busy, onChange: event => editor.edit({ ...draft, enabled: event.target.checked }) }), t('discoverEnabled')] }), _jsx("p", { children: t('discoverHelp') }), _jsxs("label", { className: "ops-settings-field", children: [t('limit'), _jsx("input", { type: "number", min: "1", max: "5", step: "1", value: draft.limit, disabled: editor.busy, "aria-invalid": !valid, onChange: event => editor.edit({ ...draft, limit: event.target.value }) })] }), !valid && _jsx("p", { role: "alert", children: t('invalidLimit') }), _jsx("p", { className: "ops-settings-note", children: t('poolHelp') }), _jsxs("div", { className: "ops-settings-columns", children: [_jsxs("fieldset", { disabled: editor.busy, children: [_jsx("legend", { children: t('allowed') }), names.map(name => _jsxs("label", { className: "ops-settings-choice", children: [_jsx("input", { type: "checkbox", checked: draft.allowed.includes(name), onChange: event => editor.edit({ ...draft, allowed: checked(draft.allowed, name, event.target.checked), always: event.target.checked ? draft.always : draft.always.filter(value => value !== name) }) }), _jsx("code", { children: name })] }, name))] }), _jsxs("fieldset", { disabled: editor.busy, children: [_jsx("legend", { children: t('always') }), names.map(name => _jsxs("label", { className: "ops-settings-choice", children: [_jsx("input", { type: "checkbox", checked: draft.always.includes(name), disabled: !draft.allowed.includes(name), onChange: event => editor.edit({ ...draft, always: checked(draft.always, name, event.target.checked) }) }), _jsx("code", { children: name })] }, name))] })] }), _jsx(FormActions, { ...editor, valid: valid, t: t })] });
}
