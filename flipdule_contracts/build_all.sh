#!/bin/bash

# Build script for all FlipDule contracts
# This script builds all three contracts: PriceOracle, TradingEngine, and DuelManager

set -e  # Exit on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FlipDule Contracts Build Script ===${NC}\n"

# Ensure .cargo directory exists
if [ ! -d ".cargo" ]; then
    echo -e "${YELLOW}Creating .cargo directory...${NC}"
    mkdir -p .cargo
    cat > .cargo/config.toml << 'EOF'
[unstable]
build-std = ["core", "alloc"]
build-std-features = ["panic_immediate_abort"]
EOF
fi

# Set the correct Rust toolchain
export PATH="/Users/I578432/.rustup/toolchains/nightly-2025-01-01-aarch64-apple-darwin/bin:$PATH"

echo -e "${GREEN}Building all FlipDule contracts...${NC}\n"

# Build all contracts
cargo odra build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build successful!${NC}\n"
    echo "Generated WASM files:"
    ls -lh wasm/*.wasm 2>/dev/null || echo "No WASM files found"
    echo ""
else
    echo -e "\n${RED}❌ Build failed${NC}"
    exit 1
fi
