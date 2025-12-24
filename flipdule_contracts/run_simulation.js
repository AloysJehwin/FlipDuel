#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const NODE = "https://node.testnet.casper.network/rpc";
const CHAIN = "casper-test";
const PAYMENT = "5000000000";
const ENTRY = "10000000000";
const TOLERANCE = "5";

const ORACLE_HASH = "012d314536f0869cc092118f803026bd1fede02554e89614a2432ffd2f8a06c4";
const ENGINE_HASH = "365d058d996b4f41cc82c293763059a7353f41a06b0c2d2f008d08df0bf80899";
const MANAGER_HASH = "45644e6e5c962c9bf388770ff84246b4b3f6e4c04d6984f1ba153ab66a5dee21";

const USER1 = "user1_secret_key.pem";
const USER2 = "user2_secret_key.pem";
const ADMIN = "secret_key.pem";

// Error log file
const LOG_FILE = "simulation_errors.log";
const SUCCESS_LOG = "simulation_success.log";

// Clear old logs
fs.writeFileSync(LOG_FILE, `FlipDuel Simulation Error Log - ${new Date().toISOString()}\n${'='.repeat(60)}\n\n`);
fs.writeFileSync(SUCCESS_LOG, `FlipDuel Simulation Success Log - ${new Date().toISOString()}\n${'='.repeat(60)}\n\n`);

function logError(step, error) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR in ${step}:\n${error}\n${'='.repeat(60)}\n\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.error(`\x1b[31m❌ ERROR in ${step}\x1b[0m`);
    console.error(error);
}

function logSuccess(step, output) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] SUCCESS: ${step}\n${output}\n${'='.repeat(60)}\n\n`;
    fs.appendFileSync(SUCCESS_LOG, logEntry);
    console.log(`\x1b[32m✅ ${step}\x1b[0m`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeCommand(step, command) {
    console.log(`\x1b[33m⏳ ${step}...\x1b[0m`);
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        logSuccess(step, output);

        // Extract transaction hash from output
        const hashMatch = output.match(/transaction_hash[\":\s]+([a-f0-9]{64})/i) ||
                         output.match(/deploy_hash[\":\s]+([a-f0-9]{64})/i);

        if (hashMatch) {
            const txHash = hashMatch[1];
            console.log(`\x1b[36m📝 Transaction Hash: ${txHash}\x1b[0m`);
            return txHash;
        }

        return output;
    } catch (error) {
        logError(step, error.stderr || error.message);
        throw error;
    }
}

async function checkTransactionError(txHash, step) {
    if (!txHash) return;

    console.log(`\x1b[36m🔍 Checking transaction status...\x1b[0m`);
    try {
        const cmd = `casper-client get-transaction --node-address "${NODE}" ${txHash} 2>&1`;
        const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });

        // Check for error_message in the output
        const errorMatch = result.match(/error_message[\":\s]+([^\n\"]+)/i);
        if (errorMatch) {
            const errorMsg = errorMatch[1].replace(/["',]/g, '').trim();
            console.error(`\x1b[31m❌ Transaction Error: ${errorMsg}\x1b[0m`);
            logError(`${step} - Transaction Error`, errorMsg);
            fs.appendFileSync(LOG_FILE, `Full Transaction Output:\n${result}\n${'='.repeat(60)}\n\n`);

            // STOP execution on error
            throw new Error(`Transaction failed: ${errorMsg}`);
        } else {
            console.log(`\x1b[32m✓ Transaction executed successfully\x1b[0m`);
        }

        // Also log the full transaction details to success log
        fs.appendFileSync(SUCCESS_LOG, `Transaction Details for ${step}:\n${result}\n${'='.repeat(60)}\n\n`);
    } catch (error) {
        if (error.message && error.message.includes('Transaction failed')) {
            throw error; // Re-throw if it's our error
        }
        // Transaction might not be available yet
        console.log(`\x1b[33m⚠️  Could not check transaction status (may need more time)\x1b[0m`);
    }
}

async function main() {
    console.log('\x1b[34m' + '='.repeat(60) + '\x1b[0m');
    console.log('\x1b[34m  FlipDuel Complete Flow Simulation\x1b[0m');
    console.log('\x1b[34m' + '='.repeat(60) + '\x1b[0m\n');

    try {
        // Step 1: Wire contracts together
        console.log('\x1b[36m\n📋 Step 1: Wiring contracts together...\x1b[0m\n');

        let txHash = await executeCommand(
            "Set Oracle in Engine",
            `casper-client put-deploy --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${ADMIN}" --payment-amount "${PAYMENT}" --session-package-hash "${ENGINE_HASH}" --session-entry-point "set_price_oracle" --session-arg "price_oracle_addr:key='hash-${ORACLE_HASH}'"`
        );
        await sleep(15000);
        await checkTransactionError(txHash, "Set Oracle in Engine");
        await sleep(15000);

        txHash = await executeCommand(
            "Set Manager in Engine",
            `casper-client put-deploy --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${ADMIN}" --payment-amount "${PAYMENT}" --session-package-hash "${ENGINE_HASH}" --session-entry-point "set_duel_manager" --session-arg "duel_manager_addr:key='hash-${MANAGER_HASH}'"`
        );
        await sleep(15000);
        await checkTransactionError(txHash, "Set Manager in Engine");
        await sleep(15000);

        txHash = await executeCommand(
            "Set Engine in Manager",
            `casper-client put-deploy --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${ADMIN}" --payment-amount "${PAYMENT}" --session-package-hash "${MANAGER_HASH}" --session-entry-point "set_trading_engine" --session-arg "trading_engine_addr:key='hash-${ENGINE_HASH}'"`
        );
        await sleep(15000);
        await checkTransactionError(txHash, "Set Engine in Manager");
        await sleep(15000);

        // Step 2: Set NFT prices
        console.log('\x1b[36m\n📋 Step 2: Setting NFT prices...\x1b[0m\n');

        txHash = await executeCommand(
            "Set NFT1 price to 5 CSPR",
            `casper-client put-deploy --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${ADMIN}" --payment-amount "${PAYMENT}" --session-package-hash "${ORACLE_HASH}" --session-entry-point "update_price" --session-arg "nft_id:string='NFT1'" --session-arg "price:u512='5000000000'" --session-arg "source:string='manual'"`
        );
        await sleep(15000);
        await checkTransactionError(txHash, "Set NFT1 price");
        await sleep(15000);

        // Step 3: User 1 creates duel
        console.log('\x1b[36m\n📋 Step 3: User 1 creating duel (10 CSPR entry)...\x1b[0m\n');

        txHash = await executeCommand(
            "User 1 creates duel",
            `casper-client put-transaction invocable-entity --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${USER1}" --payment-amount "${PAYMENT}" --transferred-value "${ENTRY}" --entity-address "package-${MANAGER_HASH}" --session-entry-point "create_duel" --session-arg "duration_seconds:u64='600'" --session-arg "nft_collection:string='NFT_COLLECTION_1'" --session-arg "max_participants:u8='2'" --gas-price-tolerance "${TOLERANCE}" --standard-payment true`
        );
        await sleep(20000);
        await checkTransactionError(txHash, "User 1 creates duel");
        await sleep(25000);

        // Step 4: User 2 joins duel
        console.log('\x1b[36m\n📋 Step 4: User 2 joining duel (10 CSPR entry)...\x1b[0m\n');

        txHash = await executeCommand(
            "User 2 joins duel",
            `casper-client put-transaction invocable-entity --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${USER2}" --payment-amount "${PAYMENT}" --transferred-value "${ENTRY}" --entity-address "package-${MANAGER_HASH}" --session-entry-point "join_duel" --session-arg "duel_id:u64='1'" --gas-price-tolerance "${TOLERANCE}" --standard-payment true`
        );
        console.log('\x1b[32m💰 Prize Pool: 20 CSPR (duel auto-started)\x1b[0m');
        await sleep(20000);
        await checkTransactionError(txHash, "User 2 joins duel");
        await sleep(25000);

        // Step 5: Close duel
        console.log('\x1b[36m\n📋 Step 5: Closing duel...\x1b[0m\n');

        txHash = await executeCommand(
            "Close duel",
            `casper-client put-transaction invocable-entity --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${ADMIN}" --payment-amount "${PAYMENT}" --entity-address "package-${MANAGER_HASH}" --session-entry-point "close_duel" --session-arg "duel_id:u64='1'" --gas-price-tolerance "${TOLERANCE}" --standard-payment true`
        );
        await sleep(20000);
        await checkTransactionError(txHash, "Close duel");
        await sleep(25000);

        // Step 6: User 1 claims rewards
        console.log('\x1b[36m\n📋 Step 6: User 1 claiming prize...\x1b[0m\n');

        txHash = await executeCommand(
            "User 1 claims 20 CSPR prize",
            `casper-client put-transaction invocable-entity --node-address "${NODE}" --chain-name "${CHAIN}" --secret-key "${USER1}" --payment-amount "${PAYMENT}" --entity-address "package-${MANAGER_HASH}" --session-entry-point "claim_rewards" --session-arg "duel_id:u64='1'" --gas-price-tolerance "${TOLERANCE}" --standard-payment true`
        );
        await sleep(20000);
        await checkTransactionError(txHash, "User 1 claims prize");
        await sleep(10000);

        // Success
        console.log('\n\x1b[34m' + '='.repeat(60) + '\x1b[0m');
        console.log('\x1b[32m🎉 User 1 WINS! Receives 20 CSPR Prize! 🎉\x1b[0m');
        console.log('\x1b[34m' + '='.repeat(60) + '\x1b[0m\n');

        console.log(`\x1b[36m📄 Success log saved to: ${SUCCESS_LOG}\x1b[0m`);
        console.log(`\x1b[36m📄 Error log saved to: ${LOG_FILE}\x1b[0m`);

    } catch (error) {
        console.error('\n\x1b[31m❌ Simulation failed. Check error log for details.\x1b[0m');
        console.error(`\x1b[36m📄 Error log: ${LOG_FILE}\x1b[0m\n`);
        process.exit(1);
    }
}

main();
