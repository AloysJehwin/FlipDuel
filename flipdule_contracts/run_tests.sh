#!/bin/bash

# FlipDuel Local Testing Script
# Tests all contracts using Odra's mock environment (no network needed)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         FlipDuel Local Testing (No Network)               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Running Odra tests...${NC}"
echo ""

export PATH="/Users/I578432/.rustup/toolchains/nightly-2025-01-01-aarch64-apple-darwin/bin:$PATH"

cargo test --lib -- --nocapture

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Your contracts work perfectly in Odra's test environment!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Note: Deployment to Casper 2.0 testnet requires Odra 2.5+${NC}"
echo "For now, contracts are fully functional and tested locally."
echo ""
