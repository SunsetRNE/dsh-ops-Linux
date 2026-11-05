import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { errorText } from './forms.js';
const executeLabel = { 'install-bash': 'install', 'remove-bash': 'remove', 'upgrade-pwsh': 'upgrade' };
export function RuntimePanel({ api, t, onSelect, editable }) {
    const [snapshot, setSnapshot] = useState(), [plan, setPlan] = useState();
    const [result, setResult] = useState(), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
    const cancellation = useRef(), mounted = useRef(true), refreshEpoch = useRef(0);
    useEffect(() => { mounted.current = true; void refresh(); return () => { mounted.current = false; cancellation.current?.abort(); }; }, [api]);
    async function refresh(clearMessage = true) {
        const epoch = ++refreshEpoch.current;
        try {
            const response = await api.snapshot();
            if (!mounted.current || epoch !== refreshEpoch.current)
                return;
            if (response.ok) {
                setSnapshot(response.value);
                if (clearMessage)
                    setMessage('');
            }
            else {
                setSnapshot(undefined);
                setMessage(response.error.message);
            }
        }
        catch (error) {
            if (mounted.current && epoch === refreshEpoch.current)
                setMessage(errorText(error));
        }
    }
    async function preview(action) {
        setBusy(true);
        setMessage('');
        setResult(undefined);
        setPlan(undefined);
        try {
            const response = await api.plan(action);
            if (!mounted.current)
                return;
            if (response.ok)
                setPlan(response.value);
            else
                setMessage(response.error.message);
        }
        catch (error) {
            if (mounted.current)
                setMessage(errorText(error));
        }
        finally {
            if (mounted.current)
                setBusy(false);
        }
    }
    async function select(source) {
        setBusy(true);
        setMessage('');
        try {
            const response = await api.select(source);
            if (!mounted.current)
                return;
            if (response.ok) {
                onSelect(response.value.bashPath);
                setMessage(`${t('selectionHint')} ${response.value.restriction}`);
            }
            else
                setMessage(response.error.message);
        }
        catch (error) {
            if (mounted.current)
                setMessage(errorText(error));
        }
        finally {
            if (mounted.current)
                setBusy(false);
        }
    }
    async function execute() {
        if (!plan?.available || busy)
            return;
        const controller = new AbortController();
        cancellation.current = controller;
        setBusy(true);
        setMessage('');
        try {
            const response = await api.execute(plan.id, controller.signal);
            if (!mounted.current)
                return;
            if (response.ok)
                setResult(response.value);
            else
                setResult({ status: controller.signal.aborted ? 'cancelled' : 'failed', effectState: 'unknown', message: response.error.message });
            setPlan(undefined);
            await refresh(false);
        }
        catch (error) {
            if (mounted.current)
                setResult({ status: controller.signal.aborted ? 'cancelled' : 'failed', effectState: 'unknown', message: errorText(error) });
        }
        finally {
            cancellation.current = undefined;
            if (mounted.current) {
                setPlan(undefined);
                setBusy(false);
            }
        }
    }
    return _jsxs("section", { className: "ops-settings ops-settings-runtime", "aria-label": t('runtime'), children: [_jsx("h3", { children: t('runtime') }), _jsx("p", { children: t('runtimeHelp') }), !snapshot && _jsx("p", { role: "status", children: t('noRuntime') }), snapshot && _jsxs("p", { children: [t('managedCount'), ": ", snapshot.managed.filter(entry => entry.owned).length, "; ", t('gitCount'), ": ", snapshot.git.length] }), _jsxs("div", { className: "ops-settings-actions", children: [_jsx("button", { type: "button", disabled: busy, onClick: () => void refresh(), children: t('refresh') }), _jsx("button", { type: "button", disabled: busy || !editable || !snapshot?.managed.some(entry => entry.owned), onClick: () => void select('managed'), children: t('managed') }), _jsx("button", { type: "button", disabled: busy || !editable || !snapshot?.git.length, onClick: () => void select('git'), children: t('git') })] }), _jsxs("div", { className: "ops-settings-actions", children: [_jsx("button", { type: "button", disabled: busy || !snapshot || snapshot.platform !== 'win32', onClick: () => void preview('install-bash'), children: t('previewInstall') }), _jsx("button", { type: "button", disabled: busy || !snapshot?.managed.some(entry => entry.owned), onClick: () => void preview('remove-bash'), children: t('previewRemove') })] }), _jsx("p", { children: t('pwshHelp') }), _jsx("div", { className: "ops-settings-actions", children: _jsx("button", { type: "button", disabled: busy || !snapshot?.powerShell.supported, onClick: () => void preview('upgrade-pwsh'), children: t('previewPwsh') }) }), snapshot?.powerShell.unavailable && _jsx("p", { className: "ops-settings-note", children: snapshot.powerShell.unavailable }), plan && _jsxs("div", { className: "ops-settings-preview", role: "region", "aria-label": t('preview'), children: [_jsx("h3", { children: t(executeLabel[plan.action]) }), _jsx("ul", { children: plan.details.map((line, index) => _jsx("li", { children: line }, index)) }), plan.reason && _jsx("p", { role: "status", children: plan.reason }), _jsxs("div", { className: "ops-settings-actions", children: [_jsx("button", { type: "button", className: "ops-settings-primary", disabled: !plan.available || busy, onClick: () => void execute(), children: t(executeLabel[plan.action]) }), _jsx("button", { type: "button", disabled: busy, onClick: () => setPlan(undefined), children: t('dismiss') })] })] }), busy && _jsx("p", { role: "status", children: t('busy') }), busy && cancellation.current && _jsx("button", { type: "button", onClick: () => cancellation.current?.abort(), children: t('cancel') }), result && _jsxs("div", { role: "status", children: [_jsx("p", { children: result.message }), result.exitCode !== undefined && _jsxs("p", { children: [t('exitCode'), ": ", result.exitCode ?? '—'] }), result.effectState === 'unknown' && _jsx("p", { children: t('unknownEffect') })] }), message && _jsx("p", { role: "status", children: message })] });
}
