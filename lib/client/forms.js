import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const strings = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
export const errorText = (value) => value instanceof Error ? value.message : String(value);
export const checked = (values, key, enabled) => enabled ? [...new Set([...values, key])] : values.filter(value => value !== key);
export function useEditor(form, read, t) {
    const [draft, setDraft] = useState(() => read(form?.state.value ?? {}));
    const [revision, setRevision] = useState(form?.state.revision);
    const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
    const ready = form?.state.status === 'ready' && form.state.writable && form.state.mode === 'host';
    useEffect(() => {
        if (!dirty) {
            setDraft(read(form?.state.value ?? {}));
            setRevision(form?.state.revision);
        }
    }, [form?.state.revision, form?.state.status, read, dirty]);
    const edit = (value) => { setDraft(value); setDirty(true); setMessage(''); };
    const reset = () => { setDraft(read(form?.state.value ?? {})); setRevision(form?.state.revision); setDirty(false); setMessage(''); };
    const save = async (operations) => {
        if (!form || !ready || busy || revision === undefined)
            return;
        setBusy(true);
        setMessage('');
        try {
            const accepted = await form.mutate(operations, revision);
            setMessage(t(accepted ? 'saved' : 'rejected'));
            if (accepted)
                setDirty(false);
        }
        catch (error) {
            setMessage(errorText(error));
        }
        finally {
            setBusy(false);
        }
    };
    return { draft, edit, dirty, busy, ready, message, reset, save };
}
export function Unavailable({ form, t }) {
    return _jsx("p", { role: "status", children: t(form?.state.status === 'loading' ? 'loading' : 'unavailable') });
}
export function FormActions({ busy, dirty, valid = true, reset, message, t }) {
    return _jsxs(_Fragment, { children: [_jsxs("div", { className: "ops-settings-actions", children: [_jsx("button", { type: "submit", className: "ops-settings-primary", disabled: busy || !dirty || !valid, children: t(busy ? 'saving' : 'save') }), _jsx("button", { type: "button", onClick: reset, disabled: busy, children: t('reset') })] }), message && _jsx("p", { role: "status", children: message })] });
}
