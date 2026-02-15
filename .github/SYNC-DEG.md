# DEG 同步分支说明

自动从 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 同步 WASM 与示例配置时，**只使用一个固定分支**，不再按时间戳创建多个分支。

## 固定分支

- **分支名**：`chore/sync-deg-wasm-examples`
- **用途**：仅用于存放「从 DEG 同步 wasm + example」的提交
- **对比**：在 GitHub 上对比该分支与 `main` 即可看到「上游 DEG 带来的变更」

## 工作流

1. 定时或手动触发 [sync-deg-updates.yml](.github/workflows/sync-deg-updates.yml)
2. 若有变更则提交并推送到 **同一分支** `chore/sync-deg-wasm-examples`
3. 若该分支已有 PR（base: main），新提交会自动出现在该 PR 中
4. 需要合并时，在对应 PR 里合并即可

## 清理旧的 auto-sync 分支

若之前生成了大量 `auto-sync-deg-20260115-*` 等分支，可在本地或 GitHub 删除：

```bash
# 列出远程 auto-sync 分支
git branch -r | grep 'origin/auto-sync-deg'

# 逐个删除（或到 GitHub → Branches 里批量删除）
git push origin --delete auto-sync-deg-20260115-125906
# ...
```

在 GitHub：**Branches** → 搜索 `auto-sync-deg` → 对不需要的分支点删除即可。

## 命名说明

- `chore/`：与功能无关的维护类变更
- `sync-deg-wasm-examples`：明确是「同步 DEG 的 wasm 和 example」，一眼能看出用途和变更范围。
