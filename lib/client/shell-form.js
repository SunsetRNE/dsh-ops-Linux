import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormActions, Unavailable, useEditor } from './forms.js';
import { RuntimePanel } from './runtime-panel.js';
const readShell = (value) => ({ path: typeof value.bashPath === 'string' ? value.bashPath : '', enabled: value.publishBashTool !== false });
export function ShellForm(props) {
    const { form, t, api } = props, editor = useEditor(form, readShell, t);
    return _jsxs("div", { className: "ops-settings", children: [editor.ready ? _jsxs("form", { className: "ops-settings", onSubmit: event => {
                    event.preventDefault();
                    void editor.save([
                        editor.draft.path.trim() ? { op: 'set', path: ['bashPath'], value: editor.draft.path } : { op: 'unset', path: ['bashPath'] },
                        { op: 'set', path: ['publishBashTool'], value: editor.draft.enabled },
                    ]);
                }, children: [_jsxs("label", { className: "ops-settings-choice", children: [_jsx("input", { type: "checkbox", checked: editor.draft.enabled, disabled: editor.busy, onChange: event => editor.edit({ ...editor.draft, enabled: event.target.checked }) }), t('publishBash')] }), _jsxs("label", { className: "ops-settings-field", children: [t('bashPath'), _jsx("input", { type: "text", value: editor.draft.path, disabled: editor.busy, onChange: event => editor.edit({ ...editor.draft, path: event.target.value }) })] }), _jsx("p", { className: "ops-settings-note", children: t('bashHint') }), _jsx(FormActions, { ...editor, t: t })] }) : _jsx(Unavailable, { ...props }), _jsx(RuntimePanel, { api: api, t: t, editable: editor.ready && !editor.busy, onSelect: path => editor.edit({ ...editor.draft, path }) })] });
}
