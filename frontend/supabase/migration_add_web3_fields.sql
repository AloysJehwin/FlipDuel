-- Migration: Add Web3 transaction fields to FlipDuel database
-- Run this in your Supabase SQL Editor

-- =============================================
-- ADD WEB3 TRANSACTION FIELDS TO DUELS TABLE
-- =============================================

-- Add blockchain transaction fields
ALTER TABLE duels ADD COLUMN IF NOT EXISTS blockchain_id INTEGER;
ALTER TABLE duels ADD COLUMN IF NOT EXISTS create_tx_hash TEXT;
ALTER TABLE duels ADD COLUMN IF NOT EXISTS create_tx_status TEXT CHECK (create_tx_status IN ('pending', 'success', 'failed'));
ALTER TABLE duels ADD COLUMN IF NOT EXISTS start_tx_hash TEXT;
ALTER TABLE duels ADD COLUMN IF NOT EXISTS close_tx_hash TEXT;
ALTER TABLE duels ADD COLUMN IF NOT EXISTS contract_address TEXT DEFAULT 'hash-40c213483d6402a2f5cf39d510c909b5e8597ee539e8f766d9c2d11cf8e88795';

-- Add indexes for transaction lookups
CREATE INDEX IF NOT EXISTS idx_duels_blockchain_id ON duels(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_duels_create_tx_hash ON duels(create_tx_hash);

-- =============================================
-- ADD WEB3 TRANSACTION FIELDS TO PARTICIPANTS TABLE
-- =============================================

-- Add join transaction hash
ALTER TABLE duel_participants ADD COLUMN IF NOT EXISTS join_tx_hash TEXT;
ALTER TABLE duel_participants ADD COLUMN IF NOT EXISTS join_tx_status TEXT CHECK (join_tx_status IN ('pending', 'success', 'failed'));
ALTER TABLE duel_participants ADD COLUMN IF NOT EXISTS claim_tx_hash TEXT;
ALTER TABLE duel_participants ADD COLUMN IF NOT EXISTS claim_tx_status TEXT CHECK (claim_tx_status IN ('pending', 'success', 'failed'));
ALTER TABLE duel_participants ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- ADD WEB3 TRANSACTION FIELDS TO TRADES TABLE
-- =============================================

-- Add blockchain transaction hash for each trade
ALTER TABLE duel_trades ADD COLUMN IF NOT EXISTS tx_hash TEXT;
ALTER TABLE duel_trades ADD COLUMN IF NOT EXISTS tx_status TEXT CHECK (tx_status IN ('pending', 'success', 'failed'));
ALTER TABLE duel_trades ADD COLUMN IF NOT EXISTS gas_fee DECIMAL(20, 8);

-- Add index for transaction lookups
CREATE INDEX IF NOT EXISTS idx_trades_tx_hash ON duel_trades(tx_hash);

-- =============================================
-- ADD NEW TABLE FOR PRICE ORACLE DATA
-- =============================================

CREATE TABLE IF NOT EXISTS price_oracle_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'casper_price_oracle'
);

-- Enable RLS
ALTER TABLE price_oracle_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Price snapshots are viewable by everyone"
  ON price_oracle_snapshots FOR SELECT
  USING (true);

CREATE POLICY "System can insert price snapshots"
  ON price_oracle_snapshots FOR INSERT
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_snapshots_duel ON price_oracle_snapshots(duel_id);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_timestamp ON price_oracle_snapshots(timestamp DESC);

-- Success message
SELECT 'Web3 fields migration completed successfully! 🎉' AS message;
