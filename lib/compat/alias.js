/** Backward-compatible alias mapping for tool names renamed in 0.4.0.
 *  Old raw names in saved profiles are silently migrated to new names at load time. */
export const RENAMED_TOOLS = Object.freeze({
    read_many: 'read_files',
    edit_many: 'edit_file',
    table_read: 'read_table',
    doc_read: 'read_docx',
    pdf_read: 'read_pdf',
    sdk: 'load_sdk',
    discover: 'discover_tools',
});
/** Map a raw name through the rename table; unknown names pass through unchanged. */
export function migrateRawName(name) {
    return RENAMED_TOOLS[name] ?? name;
}
/** Migrate an array of raw names, deduplicating after rename. */
export function migrateRawNames(names) {
    return [...new Set(names.map(migrateRawName))];
}
