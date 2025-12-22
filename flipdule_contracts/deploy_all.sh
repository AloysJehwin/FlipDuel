#!/bin/bash

# Deployment script for all FlipDule contracts on Casper Network
# Place your secret_key.pem file in this directory before running

set -e  # Exit on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHAIN_NAME="casper-test"
NODE_ADDRESS="https://node.testnet.casper.network/rpc"  # Official Casper Testnet RPC
PAYMENT_AMOUNT="200000000000"  # 200 CSPR in motes

# Contract files
PRICE_ORACLE_WASM="wasm/FlipDuelPriceOracle.wasm"
TRADING_ENGINE_WASM="wasm/FlipDuelTradingEngine.wasm"
DUEL_MANAGER_WASM="wasm/FlipDuelManager.wasm"

echo -e "${BLUE}=== FlipDule Contracts Deployment ===${NC}\n"

# Check for secret key
if [ ! -f "secret_key.pem" ]; then
    echo -e "${RED}Error: secret_key.pem not found!${NC}"
    echo ""
    echo "Please place your secret_key.pem file in the flipdule_contracts directory"
    echo ""
    echo "If you don't have a key, create one with:"
    echo -e "${GREEN}casper-client keygen ~/casper-keys/${NC}"
    echo "Then copy it here:"
    echo -e "${GREEN}cp ~/casper-keys/secret_key.pem ./secret_key.pem${NC}"
    echo ""
    exit 1
fi

# Check if WASM files exist
if [ ! -f "$PRICE_ORACLE_WASM" ] || [ ! -f "$TRADING_ENGINE_WASM" ] || [ ! -f "$DUEL_MANAGER_WASM" ]; then
    echo -e "${RED}Error: WASM files not found!${NC}"
    echo "Please run ./build_all.sh first"
    exit 1
fi

echo -e "${GREEN}Found all contract WASM files:${NC}"
echo "  ✓ $PRICE_ORACLE_WASM"
echo "  ✓ $TRADING_ENGINE_WASM"
echo "  ✓ $DUEL_MANAGER_WASM"
echo ""

# Function to deploy a contract
deploy_contract() {
    local name=$1
    local wasm_file=$2

    echo -e "${YELLOW}Deploying $name...${NC}"

    casper-client put-deploy \
        --node-address "$NODE_ADDRESS" \
        --chain-name "$CHAIN_NAME" \
        --secret-key "secret_key.pem" \
        --payment-amount "$PAYMENT_AMOUNT" \
        --session-path "$wasm_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name deployment transaction submitted${NC}\n"
    else
        echo -e "${RED}❌ $name deployment failed${NC}\n"
        return 1
    fi
}

# Deploy all contracts
echo -e "${BLUE}Starting deployment to Casper Testnet...${NC}\n"

deploy_contract "FlipDuelPriceOracle" "$PRICE_ORACLE_WASM"
PRICE_ORACLE_DEPLOYED=$?

sleep 2

deploy_contract "FlipDuelTradingEngine" "$TRADING_ENGINE_WASM"
TRADING_ENGINE_DEPLOYED=$?

sleep 2

deploy_contract "FlipDuelManager" "$DUEL_MANAGER_WASM"
DUEL_MANAGER_DEPLOYED=$?

echo -e "${BLUE}=== Deployment Summary ===${NC}\n"

if [ $PRICE_ORACLE_DEPLOYED -eq 0 ] && [ $TRADING_ENGINE_DEPLOYED -eq 0 ] && [ $DUEL_MANAGER_DEPLOYED -eq 0 ]; then
    echo -e "${GREEN}✅ All contracts deployed successfully!${NC}\n"
    echo "Next steps:"
    echo "1. Save all deploy hashes from the output above"
    echo "2. Wait 1-2 minutes for confirmation"
    echo "3. Check status with:"
    echo -e "   ${GREEN}casper-client get-deploy --node-address $NODE_ADDRESS <deploy-hash>${NC}"
    echo ""
    echo "4. Get contract addresses:"
    echo -e "   ${GREEN}casper-client get-account-info \\
      --node-address $NODE_ADDRESS \\
      --public-key <your-public-key.pem>${NC}"
    echo ""
else
    echo -e "${RED}Some deployments failed. Check the errors above.${NC}"
    exit 1
fi
