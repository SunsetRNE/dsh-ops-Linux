# 移植说明（linux-arm64 / DSH 0.2.2）

本仓库是 [T-Auto/dsh-ops](https://github.com/T-Auto/dsh-ops) v0.4.4 的自维护移植版，遵循上游 MIT 许可，版权与归属见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 及上游文档。改动集中在一处目标平台与一个 DSH 版本范围：

| 目标 | 改动 |
| --- | --- |
| platform | 增加 `linux-arm64`（Android / ARM64 Linux），并保留上游四个目标 |
| DSH | 兼容范围放宽到 `>=0.2.0-rc.2 <0.2.2-0 || >=0.2.2-0 <0.2.3-0`（上游为 `<0.2.2-0`） |

## 为什么需要这些改动

只把 `linux-arm64` 加进平台白名单，在 Android 的 proot 类容器里仍不能工作，另外还有 DSH 0.2.2 的版本门槛：

1. **支持矩阵有两处白名单**：`src/ptc/runtime.ts` 的 `PLATFORMS` 与 `src/profile-install.ts` 的 `SUPPORTED_TARGETS`；清单 `dsh-plugin.json` 另有 6 处 `targets`。
2. **raw syscall 被容器错误翻译**：rustix 默认走 linux_raw 后端直发 `svc`。proot 类环境会把带 dirfd 的裸 `renameat`/`renameat2` 按 cwd 解析并返回 ENOENT，cap-std 的所有 rename（原子替换、结果缓存）都会失败；同样的调用经 libc 则正常。因此 aarch64 目标改用 `--cfg rustix_use_libc`。
3. **加载失败 `mprotect PT_LOAD` EACCES**：这类 loader 先把所有段映射成 RW 再 mprotect；RX 与 RW 段虚拟地址相邻时 VMA 会合并，Android SELinux 随后以 execmod 拒绝 RX。链接时用 `-z max-page-size=0x200000` 把两段拉开 2 MiB。
4. **Android SELinux 的两条限制**（平台无关的小改动）：
   - `linkat` 对 app 域一律 EACCES，`write_file` 新建文件与 `move` 会失败。改为在 Linux 上遇 EACCES/EPERM 时回退到 `renameat2(RENAME_NOREPLACE)`：同样不覆盖、保持 inode，只是源的消耗与硬链接路径同步发生；`move` 的源修订校验本就在双锁内、发布之前完成。
   - 每个文件都带 `security.selinux`，app 无权重写（即使值相同），导致每次替换都报元数据警告、`copy` 直接 `METADATA_UNSUPPORTED`。改为新 inode 上已存在且值相同的 xattr 视为已保留，跳过写入且不计入 `xattrs` 列表。
5. **DSH 0.2.2 版本门槛**：上游 `engines.dsh` 为 `>=0.2.0-rc.2 <0.2.2-0`，0.2.2-rc.1 会被宿主判为 `incompatible-version` 并整体停用组合包。实测所用接口（`tools.register/restrict/guard/view/selectExecutor`、`systemPrompt.assemble/section`、`sandboxPolicy`、`subprocess`）在 0.2.2-rc.1 未变，因此只放宽范围。

## 构建

TypeScript 与清单：

```bash
npm ci
npm run build          # src/ -> lib/
node scripts/validate-manifest.mjs
```

linux-arm64 原生 worker（需要 rustc ≥ 1.88，`native/.cargo/config.toml` 已含必要条件）：

```bash
cd native && cargo build --release --locked --bin dsh-ops-worker && cd ..
node bin/native-runtime.mjs stage --platform linux-arm64 --input native/target/release
node bin/native-runtime.mjs check --staged
```

仓库内已附带构建好的 `runtime/linux-arm64/dsh-ops-worker` 及其 `provenance.json`，因此不装 Rust 也能直接使用；源码改动后用上面的命令重新 stage 即可。

## 与上游仓库约定的差异

- 本仓库提交了 `lib/`（`npm run build` 的产物），因此 clone 下来即可直接 `link:`/打包安装，不需要先构建；改 `src/` 后重新执行 `npm run build` 并提交。`scripts/check-file-size.mjs` 相应地把 `lib/` 与 `docs/`、`runtime/` 一起排除在行数闸门之外（生成的 `.d.ts` 会超过上限）。
- `runtime/linux-arm64/` 的 worker 同样入库。

## 测试

```bash
node test/run.mjs                                  # 全部
node test/run.mjs linux- mount authority           # 指定套件
```

在本移植的目标环境（Android proot 容器 + DSH 0.2.2-rc.1）上，`authority`、`file-metadata`、`linux-args`、`linux-protocol`、`linux-shell`、`mount` 全部通过；`linux-paths` 有 1 项不通过，原因是该容器把 `path/` 尾斜杠当作文件打开，与 dsh-ops 无关。依赖 bubblewrap/Landlock 的沙箱用例在本机不可用。

## 已知差异

- `linux-arm64` 只提供 staged 原生运行时，不进入上游的发布矩阵（`RELEASE_TARGETS`），CI 也不产出该目标。
- 上游测试套件写在 DSH 0.2.1 时代：`ToolRuntime.mode`（0.2.2 改为单独挂 `dsh-tool-executor-native` / `-ptc`）与 `tools.presentAs`（已移除）在测试里仍有使用，产品代码未引用。
