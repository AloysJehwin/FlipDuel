# FlipDule Contracts - Deployment Guide

This guide will help you build and deploy all three FlipDule smart contracts to Casper Testnet.

## Contracts Included

1. **FlipDuelPriceOracle** - Manages NFT price feeds for trading duels
2. **FlipDuelTradingEngine** - Handles NFT trading simulation and portfolio management
3. **FlipDuelManager** - Manages competitive NFT trading duels

## Prerequisites

- Rust toolchain (nightly-2025-01-01) - Already configured
- Casper client - Already installed
- Testnet CSPR tokens for gas fees
- Wallet with secret key (PEM file)

## Step 1: Add Your Wallet

Place your `secret_key.pem` file in this directory (`flipdule_contracts/`):

```bash
cp /path/to/your/secret_key.pem ./secret_key.pem
```

**If you don't have a key:**
```bash
casper-client keygen ~/casper-keys/
cp ~/casper-keys/secret_key.pem ./secret_key.pem
```

## Step 2: Get Testnet CSPR

1. Go to https://testnet.cspr.live/
2. Use your public key from `~/casper-keys/public_key.pem`
3. Request testnet tokens from the faucet
4. Wait for confirmation (usually instant)

## Step 3: Build All Contracts

```bash
chmod +x build_all.sh
./build_all.sh
```

This will generate three WASM files in the `wasm/` directory:
- `FlipDuelPriceOracle.wasm`
- `FlipDuelTradingEngine.wasm`
- `FlipDuelManager.wasm`

## Step 4: Deploy All Contracts

```bash
chmod +x deploy_all.sh
./deploy_all.sh
```

This will:
1. Deploy PriceOracle contract
2. Deploy TradingEngine contract
3. Deploy DuelManager contract
4. Display deployment hashes for each

## Step 5: Verify Deployment

Save all three deploy hashes from the output, then check status:

```bash
casper-client get-deploy \
  --node-address http://16.162.124.124:7777 \
  <deploy-hash>
```

Wait for `"execution_results"` to show `"Success"`.

## Step 6: Get Contract Addresses

```bash
casper-client get-account-info \
  --node-address http://16.162.124.124:7777 \
  --public-key ~/casper-keys/public_key.pem
```

Look for the named keys in the output to find your contract hashes.

## Troubleshooting

### Build Fails
- Ensure `.cargo/config.toml` exists
- Run `./build_all.sh` which creates it automatically

### Deployment Fails
- Check you have enough testnet CSPR (need ~600 CSPR total for all 3 contracts)
- Verify `secret_key.pem` is in the correct location
- Ensure your account is funded on testnet

### Check Balance
```bash
casper-client get-balance \
  --node-address http://16.162.124.124:7777 \
  --public-key ~/casper-keys/public_key.pem
```

## Network Information

- **Testnet RPC**: http://16.162.124.124:7777
- **Chain Name**: casper-test
- **Explorer**: https://testnet.cspr.live/

## Contract Initialization

After deployment, you'll need to call initialization functions with appropriate parameters. Check the individual contract source files for init parameters.

## Support

For issues, check:
- [Casper Documentation](https://docs.casper.network/)
- [Odra Framework](https://odra.dev/)
