#!/bin/bash
# 从 double-entry-generator 构建并复制 WASM 文件到 beanBridge

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BEANBRIDGE_DIR="$(dirname "$SCRIPT_DIR")"
DEG_DIR="$BEANBRIDGE_DIR/../double-entry-generator"

echo "=== 构建 WASM 文件 ==="
cd "$DEG_DIR"
make build-wasm

echo ""
echo "=== 复制 WASM 文件到 beanBridge ==="
cd "$BEANBRIDGE_DIR"
mkdir -p public/wasm
cp "$DEG_DIR/wasm-dist/double-entry-generator.wasm" public/wasm/
cp "$DEG_DIR/wasm-dist/wasm_exec.js" public/wasm/

echo ""
echo "=== 验证文件 ==="
ls -lh public/wasm/

echo ""
echo "✓ WASM 文件已复制到 public/wasm/"
echo ""
echo "请运行以下命令提交文件："
echo "  git add public/wasm/"
echo "  git commit -m 'Add WASM files to repository'"

