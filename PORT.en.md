# Port notes (linux-arm64 / DSH 0.2.2)

This repository is a self-maintained port of [T-Auto/dsh-ops](https://github.com/T-Auto/dsh-ops) v0.4.4, distributed under the upstream MIT license; see [LICENSE](LICENSE), [NOTICE](NOTICE) and the upstream docs for attribution. The changes add one target platform and widen one DSH range:

| Target | Change |
| --- | --- |
| platform | Adds `linux-arm64` (Android / ARM64 Linux); the four upstream targets stay |
| DSH | Widens the range to `>=0.2.0-rc.2 <0.2.2-0 || >=0.2.2-0 <0.2.3-0` (upstream: `<0.2.2-0`) |

## Why the changes are needed

Adding `linux-arm64` to the support matrix alone does not work inside an Android proot-style container, and DSH 0.2.2 adds a version gate of its own:

1. **The support matrix lives in two places**: `PLATFORMS` in `src/ptc/runtime.ts` and `SUPPORTED_TARGETS` in `src/profile-install.ts`; the `dsh-plugin.json` manifest carries six more `targets` arrays.
2. **Raw syscalls are mistranslated by the container**: rustix defaults to its linux_raw backend and issues `svc` directly. A proot-style translator resolves dirfd-relative raw `renameat`/`renameat2` against the cwd and answers ENOENT, so every cap-std rename (atomic replace, result cache) fails; the same calls through libc work. The arm64 target therefore uses `--cfg rustix_use_libc`.
3. **Loading fails with `mprotect PT_LOAD` EACCES**: such loaders map every segment RW and mprotect afterwards; when the RX and RW segments are adjacent in memory the VMAs merge and Android SELinux then denies the RX mapping (execmod). Linking with `-z max-page-size=0x200000` keeps the two segments 2 MiB apart.
4. **Two Android SELinux limits** (small platform-independent changes):
   - `linkat` always fails with EACCES for app domains, so creating files with `write_file` and `move` break. On Linux an EACCES/EPERM link failure now falls back to `renameat2(RENAME_NOREPLACE)`: still no-clobber and same-inode, but the source is consumed at publish time; `move` already validates the source revision under both locks before publishing.
   - Every file carries `security.selinux` and the app domain may not rewrite it even with an identical value, so every replace reported a metadata warning and `copy` failed with `METADATA_UNSUPPORTED`. An xattr the new inode already carries with the same value is now treated as preserved: not rewritten, and not listed in `xattrs`.
5. **DSH 0.2.2 gate**: upstream declares `engines.dsh: >=0.2.0-rc.2 <0.2.2-0`, so 0.2.2-rc.1 is reported as `incompatible-version` and the whole bundle is disabled. Every interface in use (`tools.register/restrict/guard/view/selectExecutor`, `systemPrompt.assemble/section`, `sandboxPolicy`, `subprocess`) is unchanged in 0.2.2-rc.1, so only the range was widened.

## Building

TypeScript and the manifest:

```bash
npm ci
npm run build          # src/ -> lib/
node scripts/validate-manifest.mjs
```

The linux-arm64 native worker (needs rustc ≥ 1.88; `native/.cargo/config.toml` carries the required flags):

```bash
cd native && cargo build --release --locked --bin dsh-ops-worker && cd ..
node bin/native-runtime.mjs stage --platform linux-arm64 --input native/target/release
node bin/native-runtime.mjs check --staged
```

The repository ships the built `runtime/linux-arm64/dsh-ops-worker` with its `provenance.json`, so no Rust toolchain is needed to use it; re-run the commands above after changing the Rust sources.

## Differences from upstream conventions

- This fork commits `lib/` (the `npm run build` output), so a clone is installable with `link:` or a tarball without building first; after editing `src/`, run `npm run build` and commit the result. `scripts/check-file-size.mjs` therefore skips `lib/` alongside `docs/` and `runtime/`, since generated declarations exceed the limit.
- The staged `runtime/linux-arm64/` worker is committed too.

## Testing

```bash
node test/run.mjs                                  # everything
node test/run.mjs linux- mount authority           # selected suites
```

On the target environment of this port (Android proot container, DSH 0.2.2-rc.1), `authority`, `file-metadata`, `linux-args`, `linux-protocol`, `linux-shell` and `mount` all pass. `linux-paths` has one failing check because that container opens `path/` (trailing separator) as a file; this is unrelated to dsh-ops. The sandbox suites that need bubblewrap or Landlock cannot run on this host.

## Known differences

- `linux-arm64` is a staged runtime only: it is not part of the upstream release matrix (`RELEASE_TARGETS`) and CI does not produce it.
- The upstream suites predate DSH 0.2.2: they still use `ToolRuntime.mode` (replaced by mounting `dsh-tool-executor-native` / `-ptc`) and `tools.presentAs` (removed). Product code references neither.
