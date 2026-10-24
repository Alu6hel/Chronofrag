#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALU_DIR="$(dirname "$DIR")/../alu-language"
ALU_CXX="$ALU_DIR/cpp_frontend/build/alu_cxx"

echo "=== Compiling Chronofrag Alu Core with Z3 Proof-Checking ==="
"$ALU_CXX" --std-path "$ALU_DIR" "$DIR/chrono_core.alu"

echo "=== Executing Verification Test Suite ==="
"$DIR/chrono_core.exe"

echo "=== Emitting C ABI & Shared Object for Android / Engine Integration ==="
clang -shared -fPIC -O3 -o "$DIR/libchrono_core.so" "$DIR/chrono_core.alu.ll"

echo "=== Alu Core Build Complete ==="
ls -lh "$DIR/chrono_core.exe" "$DIR/libchrono_core.so"
