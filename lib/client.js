window.__ModuleLoader__.load({id:"dsh-ops",factory:(require)=>{
const modules={"settings/runtime-contract.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUNTIME_REMOTE = exports.RUNTIME_DESCRIPTORS = exports.parseSource = exports.parseAction = exports.RUNTIME_ACTIONS = void 0;
exports.RUNTIME_ACTIONS = ['install-bash', 'remove-bash', 'upgrade-pwsh'];
const codec = (name, parse) => ({
    mode: 'strict', typeSymbol: `dsh-ops#${name}`, create: () => ({ parse }),
});
function enumValue(value, choices) {
    if (typeof value !== 'string' || !choices.includes(value))
        throw new Error(`Expected one of: ${choices.join(', ')}`);
    return value;
}
const parseAction = (value) => enumValue(value, exports.RUNTIME_ACTIONS);
exports.parseAction = parseAction;
const parseSource = (value) => enumValue(value, ['managed', 'git']);
exports.parseSource = parseSource;
function planId(value) {
    if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value))
        throw new Error('Expected a current runtime plan identifier');
    return value;
}
const jsonResult = codec('RuntimeResult', value => value);
function method(name, parameter, cancellable = false) {
    return { id: `dsh-ops#opsSettings/${name}`, service: 'opsSettings', namespace: 'opsSettings', method: name,
        invocation: { kind: 'direct' }, result: jsonResult,
        parameters: parameter ? [{ name: parameter.wire, wire: parameter.wire, source: 'json', codec: parameter.codec }] : [],
        ...(cancellable ? { cancellation: { parameter: 'signal' } } : {}),
    };
}
exports.RUNTIME_DESCRIPTORS = Object.freeze([
    method('snapshot'), method('plan', { wire: 'action', codec: codec('RuntimeAction', exports.parseAction) }),
    method('select', { wire: 'source', codec: codec('BashSource', exports.parseSource) }),
    method('execute', { wire: 'id', codec: codec('RuntimePlanId', planId) }, true),
]);
exports.RUNTIME_REMOTE = Object.freeze({ package: 'dsh-ops', descriptors: exports.RUNTIME_DESCRIPTORS });

}},
"client/locales.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zh = exports.en = void 0;
exports.en = {
    replacements: 'Choose which official tools OPS replaces.', discovery: 'Choose discoverable and always-loaded capabilities.', shell: 'Manage Bash and the standard host PowerShell installation.',
    modeMinimal: 'Preset enhancement: adds OPS tools to Minimal sessions and replaces the official Windows shell.', modeStandard: 'Preset enhancement: replaces the official read, glob and grep tools and the Windows shell for Standard sessions.',
    modePtc: 'Preset enhancement: publishes the PTC SDK for PTC sessions and replaces the official Windows shell.', modeCordis: 'Preset enhancement: replaces the official read, glob and grep tools and the Windows shell for Cordis sessions.',
    unavailable: 'Enable this row with the built-in switch to edit its settings. A writable host profile is required.', loading: 'Loading host settings…',
    save: 'Save changes', reset: 'Reset to saved', saved: 'Saved. The host reloaded this row.', rejected: 'The host refused this save. Reset to the latest saved values and review your changes.', saving: 'Saving…',
    replacementsHelp: 'Selected tools use OPS argument and output contracts. Read is bounded UTF-8; search excludes hidden files and links. Leave a tool unchecked to keep the official workflow.',
    read: 'Read files', glob: 'Find file paths', grep: 'Search file contents', replacementPool: 'Keep inspect_local_file for read, or glob/grep for search, always loaded in Discovery or activate them before selecting a replacement. read_files is not the read counterpart.',
    discoverEnabled: 'Enable on-demand discovery', discoverHelp: 'Always-loaded choices remain available when discovery is off. Permissions still apply to every call.',
    allowed: 'Allowed capabilities', always: 'Always loaded', limit: 'Maximum tools per discovery call', invalidLimit: 'Choose a whole number from 1 to 5.',
    poolHelp: 'Removing a capability from the allowed pool also removes it from the always-loaded selection.',
    publishBash: 'Enable Bash for authorized sessions', bashPath: 'Bash executable override', bashHint: 'Use an absolute path. Clear the override to inherit the configured default.',
    refresh: 'Refresh runtime status', managed: 'Use managed Bash', git: 'Use Git Bash', selectionHint: 'Review the selected path, then save the shell settings.',
    runtime: 'Runtime management', runtimeHelp: 'Installations do not change your saved executor choice. Stop Bash jobs before removing a managed installation.',
    previewInstall: 'Review Bash installation', previewRemove: 'Review Bash removal', previewPwsh: 'Review PowerShell upgrade',
    install: 'Install managed Bash', remove: 'Remove managed Bash', upgrade: 'Install or upgrade PowerShell',
    preview: 'Review this action', cancel: 'Cancel running action', dismiss: 'Close preview', busy: 'Working…',
    pwshHelp: 'This updates the standard PowerShell 7 installation through WinGet. Restart DSH afterwards. Review a custom host pwshPath separately; Windows PowerShell 5.1 is preserved.',
    unknownEffect: 'Changes may have occurred. Inspect the installation before trying again.', noRuntime: 'Runtime controls require an enabled mode row and the host runtime services.',
    exitCode: 'Exit code', managedCount: 'Managed installations', gitCount: 'Git Bash installations', error: 'The operation failed.',
};
exports.zh = {
    replacements: '选择由 OPS 替换的官方工具。', discovery: '选择可发现及始终加载的能力。', shell: '管理 Bash 和标准宿主 PowerShell 安装。',
    modeMinimal: '模式增强：为 Minimal 会话提供 OPS 工具并替换官方 Windows shell。', modeStandard: '模式增强：为 Standard 会话替换官方 read、glob、grep 与 Windows shell。',
    modePtc: '模式增强：为 PTC 会话提供 PTC SDK 并替换官方 Windows shell。', modeCordis: '模式增强：为 Cordis 会话替换官方 read、glob、grep 与 Windows shell。',
    unavailable: '请先用内置开关启用此行。编辑设置需要可写的宿主配置。', loading: '正在加载宿主设置…',
    save: '保存更改', reset: '恢复已保存值', saved: '已保存，宿主已重新加载此行。', rejected: '宿主拒绝了此次保存。请恢复最新已保存值后重新检查更改。', saving: '正在保存…',
    replacementsHelp: '所选工具改用 OPS 参数和输出契约。读取仅支持有界 UTF-8；搜索不包含隐藏文件和链接。取消勾选即可保留官方流程。',
    read: '读取文件', glob: '查找文件路径', grep: '搜索文件内容', replacementPool: '请在发现设置中始终加载 read 对应的 inspect_local_file 或搜索对应的 glob/grep，或在选择替换前激活它们。read_files 不对应 read。',
    discoverEnabled: '启用按需发现', discoverHelp: '关闭发现后，始终加载项仍然可用。每次调用仍受权限约束。',
    allowed: '允许的能力', always: '始终加载', limit: '每次发现最多选择的工具数', invalidLimit: '请输入 1 到 5 的整数。',
    poolHelp: '从允许池移除能力时，也会将其从始终加载项中移除。',
    publishBash: '为获得授权的会话启用 Bash', bashPath: 'Bash 执行器路径覆盖', bashHint: '请使用绝对路径。清空覆盖值以继承配置默认值。',
    refresh: '刷新运行时状态', managed: '使用受管理的 Bash', git: '使用 Git Bash', selectionHint: '请检查所选路径，然后保存 shell 设置。',
    runtime: '运行时管理', runtimeHelp: '安装不会更改已保存的执行器选择。删除受管理的安装前，请先停止 Bash 作业。',
    previewInstall: '预览 Bash 安装', previewRemove: '预览 Bash 删除', previewPwsh: '预览 PowerShell 升级',
    install: '安装受管理的 Bash', remove: '删除受管理的 Bash', upgrade: '安装或升级 PowerShell',
    preview: '检查本次操作', cancel: '取消正在执行的操作', dismiss: '关闭预览', busy: '正在处理…',
    pwshHelp: '通过 WinGet 更新标准 PowerShell 7 安装，完成后需重启 DSH。宿主自定义 pwshPath 需要单独检查；Windows PowerShell 5.1 将保留。',
    unknownEffect: '可能已经发生更改。再次尝试前，请检查安装状态。', noRuntime: '运行时控制需要启用模式行并提供宿主运行时服务。',
    exitCode: '退出码', managedCount: '受管理的安装', gitCount: 'Git Bash 安装', error: '操作失败。',
};

}},
"capabilities/discovery.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCOVERY_OUTPUT = exports.DISCOVERY_DESCRIPTION = exports.DISCOVERY_PARAMETERS = exports.DISCOVERY_TERMS = void 0;
/** Reviewed, currently implemented advanced operations. Future formats are absent. */
exports.DISCOVERY_TERMS = Object.freeze({
    read_pdf: 'pdf portable document pages text extraction font',
    read_docx: 'docx word document paragraphs body text tables zip xml unicode',
    read_table: 'table csv tsv delimiter quoted records columns rows encoding utf16',
    inspect_local_file: 'read inspect single file text hex binary bounded line windows',
    result: 'result reference page release stored output continuation',
    glob: 'glob find search file paths patterns',
    grep: 'grep search content regex matching text count summary',
    replace: 'batch literal text replacement across files',
    write_file: 'write create overwrite full file content atomic revision cas',
    edit_file: 'edit patch unique text atomic revision cas',
    diff: 'diff preview compare proposed file content',
    stat: 'stat metadata revision hash bytes size line count',
    copy: 'copy duplicate file no clobber revision',
    move: 'move rename file no clobber revision',
    remove: 'remove delete unlink file revision',
});
exports.DISCOVERY_PARAMETERS = {
    type: 'object', additionalProperties: false, required: ['query'],
    properties: {
        query: { type: 'string', description: 'Capability or select:ops_name; 1-512 characters.' },
        max_results: { type: 'integer', default: 3, description: '1-5; default 3, capped by config.' },
    },
};
exports.DISCOVERY_DESCRIPTION = 'Select allowed OPS capabilities for the next model step in this scope; no file action.';
exports.DISCOVERY_OUTPUT = {
    type: 'object', properties: {
        status: { type: 'string' }, activated: { type: 'array', items: { type: 'string' } },
        alreadyActive: { type: 'array', items: { type: 'string' } }, message: { type: 'string' },
        error: { type: 'object' },
    },
};

}},
"capabilities/replacements.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFICIAL_REPLACEMENT_NAMES = exports.RAW_OFFICIAL_REPLACEMENTS = void 0;
/** Reviewed replacement choices, shared with the browser without importing host code. */
exports.RAW_OFFICIAL_REPLACEMENTS = Object.freeze({
    read: 'inspect_local_file', glob: 'glob', grep: 'grep',
});
exports.OFFICIAL_REPLACEMENT_NAMES = Object.freeze(Object.keys(exports.RAW_OFFICIAL_REPLACEMENTS));

}},
"client/forms.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checked = exports.errorText = exports.strings = void 0;
exports.useEditor = useEditor;
exports.Unavailable = Unavailable;
exports.FormActions = FormActions;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const strings = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
exports.strings = strings;
const errorText = (value) => value instanceof Error ? value.message : String(value);
exports.errorText = errorText;
const checked = (values, key, enabled) => enabled ? [...new Set([...values, key])] : values.filter(value => value !== key);
exports.checked = checked;
function useEditor(form, read, t) {
    const [draft, setDraft] = (0, react_1.useState)(() => read(form?.state.value ?? {}));
    const [revision, setRevision] = (0, react_1.useState)(form?.state.revision);
    const [dirty, setDirty] = (0, react_1.useState)(false), [busy, setBusy] = (0, react_1.useState)(false), [message, setMessage] = (0, react_1.useState)('');
    const ready = form?.state.status === 'ready' && form.state.writable && form.state.mode === 'host';
    (0, react_1.useEffect)(() => {
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
            setMessage((0, exports.errorText)(error));
        }
        finally {
            setBusy(false);
        }
    };
    return { draft, edit, dirty, busy, ready, message, reset, save };
}
function Unavailable({ form, t }) {
    return (0, jsx_runtime_1.jsx)("p", { role: "status", children: t(form?.state.status === 'loading' ? 'loading' : 'unavailable') });
}
function FormActions({ busy, dirty, valid = true, reset, message, t }) {
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", className: "ops-settings-primary", disabled: busy || !dirty || !valid, children: t(busy ? 'saving' : 'save') }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: reset, disabled: busy, children: t('reset') })] }), message && (0, jsx_runtime_1.jsx)("p", { role: "status", children: message })] });
}

}},
"client/selections.js":{imports:{"../capabilities/discovery.js":"capabilities/discovery.js","../capabilities/replacements.js":"capabilities/replacements.js","./forms.js":"client/forms.js"},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplacementForm = ReplacementForm;
exports.DiscoveryForm = DiscoveryForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const discovery_js_1 = require("../capabilities/discovery.js");
const replacements_js_1 = require("../capabilities/replacements.js");
const forms_js_1 = require("./forms.js");
const readReplacement = (value) => (0, forms_js_1.strings)(value.replaceTools);
function ReplacementForm(props) {
    const { form, t } = props, editor = (0, forms_js_1.useEditor)(form, readReplacement, t);
    if (!editor.ready)
        return (0, jsx_runtime_1.jsx)(forms_js_1.Unavailable, { ...props });
    return (0, jsx_runtime_1.jsxs)("form", { className: "ops-settings", onSubmit: event => { event.preventDefault(); void editor.save([{ op: 'set', path: ['replaceTools'], value: editor.draft }]); }, children: [(0, jsx_runtime_1.jsx)("p", { children: t('replacementsHelp') }), (0, jsx_runtime_1.jsxs)("fieldset", { disabled: editor.busy, children: [(0, jsx_runtime_1.jsx)("legend", { children: t('replacements') }), replacements_js_1.OFFICIAL_REPLACEMENT_NAMES.map(name => (0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-choice", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: editor.draft.includes(name), onChange: event => editor.edit((0, forms_js_1.checked)(editor.draft, name, event.target.checked)) }), (0, jsx_runtime_1.jsxs)("span", { children: [t(name), " ", (0, jsx_runtime_1.jsx)("code", { children: name })] })] }, name))] }), (0, jsx_runtime_1.jsx)("p", { className: "ops-settings-note", children: t('replacementPool') }), (0, jsx_runtime_1.jsx)(forms_js_1.FormActions, { ...editor, t: t })] });
}
const names = Object.keys(discovery_js_1.DISCOVERY_TERMS);
const readDiscovery = (value) => ({ allowed: (0, forms_js_1.strings)(value.allowedTools), always: (0, forms_js_1.strings)(value.alwaysLoaded), enabled: value.enabled !== false, limit: String(value.maxResults ?? 3) });
function DiscoveryForm(props) {
    const { form, t } = props, editor = (0, forms_js_1.useEditor)(form, readDiscovery, t), draft = editor.draft;
    const limit = Number(draft.limit), valid = Number.isInteger(limit) && limit >= 1 && limit <= 5;
    if (!editor.ready)
        return (0, jsx_runtime_1.jsx)(forms_js_1.Unavailable, { ...props });
    return (0, jsx_runtime_1.jsxs)("form", { className: "ops-settings", onSubmit: event => {
            event.preventDefault();
            if (valid)
                void editor.save([
                    { op: 'set', path: ['enabled'], value: draft.enabled }, { op: 'set', path: ['maxResults'], value: limit },
                    { op: 'set', path: ['allowedTools'], value: draft.allowed }, { op: 'set', path: ['alwaysLoaded'], value: draft.always },
                ]);
        }, children: [(0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-choice", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft.enabled, disabled: editor.busy, onChange: event => editor.edit({ ...draft, enabled: event.target.checked }) }), t('discoverEnabled')] }), (0, jsx_runtime_1.jsx)("p", { children: t('discoverHelp') }), (0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-field", children: [t('limit'), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "5", step: "1", value: draft.limit, disabled: editor.busy, "aria-invalid": !valid, onChange: event => editor.edit({ ...draft, limit: event.target.value }) })] }), !valid && (0, jsx_runtime_1.jsx)("p", { role: "alert", children: t('invalidLimit') }), (0, jsx_runtime_1.jsx)("p", { className: "ops-settings-note", children: t('poolHelp') }), (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-columns", children: [(0, jsx_runtime_1.jsxs)("fieldset", { disabled: editor.busy, children: [(0, jsx_runtime_1.jsx)("legend", { children: t('allowed') }), names.map(name => (0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-choice", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft.allowed.includes(name), onChange: event => editor.edit({ ...draft, allowed: (0, forms_js_1.checked)(draft.allowed, name, event.target.checked), always: event.target.checked ? draft.always : draft.always.filter(value => value !== name) }) }), (0, jsx_runtime_1.jsx)("code", { children: name })] }, name))] }), (0, jsx_runtime_1.jsxs)("fieldset", { disabled: editor.busy, children: [(0, jsx_runtime_1.jsx)("legend", { children: t('always') }), names.map(name => (0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-choice", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft.always.includes(name), disabled: !draft.allowed.includes(name), onChange: event => editor.edit({ ...draft, always: (0, forms_js_1.checked)(draft.always, name, event.target.checked) }) }), (0, jsx_runtime_1.jsx)("code", { children: name })] }, name))] })] }), (0, jsx_runtime_1.jsx)(forms_js_1.FormActions, { ...editor, valid: valid, t: t })] });
}

}},
"client/runtime-panel.js":{imports:{"./forms.js":"client/forms.js"},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimePanel = RuntimePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const forms_js_1 = require("./forms.js");
const executeLabel = { 'install-bash': 'install', 'remove-bash': 'remove', 'upgrade-pwsh': 'upgrade' };
function RuntimePanel({ api, t, onSelect, editable }) {
    const [snapshot, setSnapshot] = (0, react_1.useState)(), [plan, setPlan] = (0, react_1.useState)();
    const [result, setResult] = (0, react_1.useState)(), [message, setMessage] = (0, react_1.useState)(''), [busy, setBusy] = (0, react_1.useState)(false);
    const cancellation = (0, react_1.useRef)(), mounted = (0, react_1.useRef)(true), refreshEpoch = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => { mounted.current = true; void refresh(); return () => { mounted.current = false; cancellation.current?.abort(); }; }, [api]);
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
                setMessage((0, forms_js_1.errorText)(error));
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
                setMessage((0, forms_js_1.errorText)(error));
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
                setMessage((0, forms_js_1.errorText)(error));
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
                setResult({ status: controller.signal.aborted ? 'cancelled' : 'failed', effectState: 'unknown', message: (0, forms_js_1.errorText)(error) });
        }
        finally {
            cancellation.current = undefined;
            if (mounted.current) {
                setPlan(undefined);
                setBusy(false);
            }
        }
    }
    return (0, jsx_runtime_1.jsxs)("section", { className: "ops-settings ops-settings-runtime", "aria-label": t('runtime'), children: [(0, jsx_runtime_1.jsx)("h3", { children: t('runtime') }), (0, jsx_runtime_1.jsx)("p", { children: t('runtimeHelp') }), !snapshot && (0, jsx_runtime_1.jsx)("p", { role: "status", children: t('noRuntime') }), snapshot && (0, jsx_runtime_1.jsxs)("p", { children: [t('managedCount'), ": ", snapshot.managed.filter(entry => entry.owned).length, "; ", t('gitCount'), ": ", snapshot.git.length] }), (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy, onClick: () => void refresh(), children: t('refresh') }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy || !editable || !snapshot?.managed.some(entry => entry.owned), onClick: () => void select('managed'), children: t('managed') }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy || !editable || !snapshot?.git.length, onClick: () => void select('git'), children: t('git') })] }), (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy || !snapshot || snapshot.platform !== 'win32', onClick: () => void preview('install-bash'), children: t('previewInstall') }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy || !snapshot?.managed.some(entry => entry.owned), onClick: () => void preview('remove-bash'), children: t('previewRemove') })] }), (0, jsx_runtime_1.jsx)("p", { children: t('pwshHelp') }), (0, jsx_runtime_1.jsx)("div", { className: "ops-settings-actions", children: (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy || !snapshot?.powerShell.supported, onClick: () => void preview('upgrade-pwsh'), children: t('previewPwsh') }) }), snapshot?.powerShell.unavailable && (0, jsx_runtime_1.jsx)("p", { className: "ops-settings-note", children: snapshot.powerShell.unavailable }), plan && (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-preview", role: "region", "aria-label": t('preview'), children: [(0, jsx_runtime_1.jsx)("h3", { children: t(executeLabel[plan.action]) }), (0, jsx_runtime_1.jsx)("ul", { children: plan.details.map((line, index) => (0, jsx_runtime_1.jsx)("li", { children: line }, index)) }), plan.reason && (0, jsx_runtime_1.jsx)("p", { role: "status", children: plan.reason }), (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "ops-settings-primary", disabled: !plan.available || busy, onClick: () => void execute(), children: t(executeLabel[plan.action]) }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: busy, onClick: () => setPlan(undefined), children: t('dismiss') })] })] }), busy && (0, jsx_runtime_1.jsx)("p", { role: "status", children: t('busy') }), busy && cancellation.current && (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => cancellation.current?.abort(), children: t('cancel') }), result && (0, jsx_runtime_1.jsxs)("div", { role: "status", children: [(0, jsx_runtime_1.jsx)("p", { children: result.message }), result.exitCode !== undefined && (0, jsx_runtime_1.jsxs)("p", { children: [t('exitCode'), ": ", result.exitCode ?? '—'] }), result.effectState === 'unknown' && (0, jsx_runtime_1.jsx)("p", { children: t('unknownEffect') })] }), message && (0, jsx_runtime_1.jsx)("p", { role: "status", children: message })] });
}

}},
"client/shell-form.js":{imports:{"./forms.js":"client/forms.js","./runtime-panel.js":"client/runtime-panel.js"},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellForm = ShellForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const forms_js_1 = require("./forms.js");
const runtime_panel_js_1 = require("./runtime-panel.js");
const readShell = (value) => ({ path: typeof value.bashPath === 'string' ? value.bashPath : '', enabled: value.publishBashTool !== false });
function ShellForm(props) {
    const { form, t, api } = props, editor = (0, forms_js_1.useEditor)(form, readShell, t);
    return (0, jsx_runtime_1.jsxs)("div", { className: "ops-settings", children: [editor.ready ? (0, jsx_runtime_1.jsxs)("form", { className: "ops-settings", onSubmit: event => {
                    event.preventDefault();
                    void editor.save([
                        editor.draft.path.trim() ? { op: 'set', path: ['bashPath'], value: editor.draft.path } : { op: 'unset', path: ['bashPath'] },
                        { op: 'set', path: ['publishBashTool'], value: editor.draft.enabled },
                    ]);
                }, children: [(0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-choice", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: editor.draft.enabled, disabled: editor.busy, onChange: event => editor.edit({ ...editor.draft, enabled: event.target.checked }) }), t('publishBash')] }), (0, jsx_runtime_1.jsxs)("label", { className: "ops-settings-field", children: [t('bashPath'), (0, jsx_runtime_1.jsx)("input", { type: "text", value: editor.draft.path, disabled: editor.busy, onChange: event => editor.edit({ ...editor.draft, path: event.target.value }) })] }), (0, jsx_runtime_1.jsx)("p", { className: "ops-settings-note", children: t('bashHint') }), (0, jsx_runtime_1.jsx)(forms_js_1.FormActions, { ...editor, t: t })] }) : (0, jsx_runtime_1.jsx)(forms_js_1.Unavailable, { ...props }), (0, jsx_runtime_1.jsx)(runtime_panel_js_1.RuntimePanel, { api: api, t: t, editable: editor.ready && !editor.busy, onSelect: path => editor.edit({ ...editor.draft, path }) })] });
}

}},
"client/styles.js":{imports:{},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS_CSS = void 0;
/** Host token palette and native controls; all styles stay inside this plugin's forms. */
exports.SETTINGS_CSS = `
.ops-settings { color:var(--dsw-alias-label-primary,inherit); font:inherit; max-width:48rem; display:grid; gap:16px; }
.ops-settings p { margin:0; line-height:1.55; max-width:76ch; overflow-wrap:anywhere; }
.ops-settings h3 { font-size:1rem; margin:0; font-weight:600; }
.ops-settings fieldset { margin:0; padding:0; border:0; min-width:0; }
.ops-settings legend { font-weight:600; margin-bottom:10px; padding:0; }
.ops-settings-choice { display:flex; align-items:center; gap:10px; min-height:36px; cursor:pointer; }
.ops-settings-choice input { width:16px; height:16px; accent-color:var(--dsw-alias-button-primary-fill,#356be8); }
.ops-settings-choice code { overflow-wrap:anywhere; }
.ops-settings-columns { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
.ops-settings-field { display:grid; gap:8px; }
.ops-settings input[type=text], .ops-settings input[type=number] { box-sizing:border-box; max-width:100%; border:1px solid var(--dsw-alias-border-l3,#888); background:transparent; color:inherit; border-radius:var(--dsw-radius-sm,8px); padding:8px 10px; font:inherit; }
.ops-settings input[type=number] { width:7rem; }
.ops-settings button { font:inherit; color:inherit; background:transparent; padding:8px 14px; border:1px solid var(--dsw-alias-border-l3,#888); border-radius:var(--dsw-radius-md,12px); cursor:pointer; min-height:36px; }
.ops-settings button:hover:not(:disabled) { background:var(--dsw-alias-interactive-bg-hover,#8882); }
.ops-settings button.ops-settings-primary { background:var(--dsw-alias-button-primary-fill,#356be8); color:var(--dsw-alias-label-primary-foreground,#fff); border-color:transparent; }
.ops-settings :is(button,input):focus-visible { outline:2px solid var(--dsw-alias-button-primary-fill,#356be8); outline-offset:3px; }
.ops-settings :disabled { opacity:.5; cursor:not-allowed; }
.ops-settings-actions { display:flex; flex-wrap:wrap; gap:10px; }
.ops-settings-note { color:var(--dsw-alias-label-secondary,inherit); }
.ops-settings-runtime { border-top:1px solid var(--dsw-alias-border-l3,#888); padding-top:20px; margin-top:8px; }
.ops-settings-preview { border:1px solid var(--dsw-alias-border-l3,#888); border-radius:var(--dsw-radius-md,12px); padding:16px; display:grid; gap:12px; }
.ops-settings-preview ul { margin:0; padding-left:20px; line-height:1.55; overflow-wrap:anywhere; }
@media(max-width:440px) { .ops-settings-columns { grid-template-columns:1fr; gap:20px; } }
`;

}},
"client/index.js":{imports:{"../settings/runtime-contract.js":"settings/runtime-contract.js","./locales.js":"client/locales.js","./selections.js":"client/selections.js","./shell-form.js":"client/shell-form.js","./styles.js":"client/styles.js"},run(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = exports.name = void 0;
exports.apply = apply;
const jsx_runtime_1 = require("react/jsx-runtime");
const runtime_contract_js_1 = require("../settings/runtime-contract.js");
const locales_js_1 = require("./locales.js");
const selections_js_1 = require("./selections.js");
const shell_form_js_1 = require("./shell-form.js");
const styles_js_1 = require("./styles.js");
exports.name = 'dsh-ops-settings';
exports.inject = ['slots', 'locale', 'remote'];
async function apply(ctx) {
    ctx.effect(() => ctx.locale.register('dshOps', { en: locales_js_1.en, zh: locales_js_1.zh }), 'dsh-ops: settings dictionaries');
    await ctx.remote.$mount(runtime_contract_js_1.RUNTIME_REMOTE);
    ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.dshOpsSettings = 'true';
        style.textContent = styles_js_1.SETTINGS_CSS;
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
            yield ctx.slots.register({ name: 'plugins.row.config', key: `dsh-ops#${row}`, locale: 'dshOps' }, (props) => props.view === 'summary' ? (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.t(summary) }) : (0, jsx_runtime_1.jsx)(shell_form_js_1.ShellForm, { ...props, api: ctx.remote.opsSettings }));
        }
        yield ctx.slots.register({ name: 'plugins.row.config', key: 'dsh-ops#dsh-ops-discovery', locale: 'dshOps' }, (props) => props.view === 'summary' ? (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.t('discovery') }) : (0, jsx_runtime_1.jsx)(selections_js_1.DiscoveryForm, { ...props }));
    });
}

}}};
const cache=Object.create(null);
function load(id){if(cache[id])return cache[id].exports;const entry=modules[id];if(!entry)throw new Error("Unknown OPS browser module: "+id);const module={exports:{}};cache[id]=module;entry.run(module,module.exports,request=>Object.hasOwn(entry.imports,request)?load(entry.imports[request]):require(request));return module.exports;}
return load("client/index.js");
}});
