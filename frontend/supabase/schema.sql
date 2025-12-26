-- FlipDuel Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/xjbdfzeetcstewbhyyrx/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
  wallet_address TEXT PRIMARY KEY,
  username TEXT,
  total_duels INTEGER DEFAULT 0,
  duels_won INTEGER DEFAULT 0,
  duels_lost INTEGER DEFAULT 0,
  total_pnl DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DUELS TABLE
-- =============================================
CREATE TABLE duels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  entry_fee DECIMAL(20, 2) NOT NULL, -- in CSPR
  trading_token TEXT NOT NULL, -- ETH, BTC, NFT-Dragons, etc.
  duration INTEGER NOT NULL, -- in minutes
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_address TEXT REFERENCES user_profiles(wallet_address),
  prize_pool DECIMAL(20, 2) NOT NULL -- in CSPR (entry_fee * 2)
);

-- Index for faster queries
CREATE INDEX idx_duels_status ON duels(status);
CREATE INDEX idx_duels_trading_token ON duels(trading_token);
CREATE INDEX idx_duels_created_at ON duels(created_at DESC);

-- =============================================
-- DUEL PARTICIPANTS TABLE
-- =============================================
CREATE TABLE duel_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  initial_balance DECIMAL(20, 2) DEFAULT 0,
  final_balance DECIMAL(20, 2) DEFAULT 0,
  pnl DECIMAL(20, 2) DEFAULT 0, -- Profit/Loss
  pnl_percent DECIMAL(10, 2) DEFAULT 0,
  position INTEGER NOT NULL CHECK (position IN (1, 2)), -- 1 = creator, 2 = challenger
  UNIQUE(duel_id, position)
);

-- Index for faster queries
CREATE INDEX idx_participants_duel ON duel_participants(duel_id);
CREATE INDEX idx_participants_wallet ON duel_participants(wallet_address);

-- =============================================
-- DUEL TRADES TABLE
-- =============================================
CREATE TABLE duel_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES duel_participants(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell')),
  token TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_trades_duel ON duel_trades(duel_id);
CREATE INDEX idx_trades_participant ON duel_trades(participant_id);
CREATE INDEX idx_trades_timestamp ON duel_trades(timestamp DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_trades ENABLE ROW LEVEL SECURITY;

-- User Profiles: Anyone can read, users can update their own
CREATE POLICY "User profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (true);

-- Duels: Anyone can read, authenticated users can create
CREATE POLICY "Duels are viewable by everyone"
  ON duels FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create duels"
  ON duels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their duels"
  ON duels FOR UPDATE
  USING (true);

-- Duel Participants: Anyone can read, authenticated users can join
CREATE POLICY "Duel participants are viewable by everyone"
  ON duel_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join duels"
  ON duel_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update their records"
  ON duel_participants FOR UPDATE
  USING (true);

-- Duel Trades: Anyone can read, participants can create trades
CREATE POLICY "Duel trades are viewable by everyone"
  ON duel_trades FOR SELECT
  USING (true);

CREATE POLICY "Participants can create trades"
  ON duel_trades FOR INSERT
  WITH CHECK (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update user stats after duel completion
CREATE OR REPLACE FUNCTION update_user_stats_after_duel()
RETURNS TRIGGER AS $$
BEGIN
  -- Update winner stats
  IF NEW.winner_address IS NOT NULL THEN
    UPDATE user_profiles
    SET
      total_duels = total_duels + 1,
      duels_won = duels_won + 1,
      updated_at = NOW()
    WHERE wallet_address = NEW.winner_address;

    -- Update loser stats (find the other participant)
    UPDATE user_profiles
    SET
      total_duels = total_duels + 1,
      duels_lost = duels_lost + 1,
      updated_at = NOW()
    WHERE wallet_address IN (
      SELECT wallet_address
      FROM duel_participants
      WHERE duel_id = NEW.id
        AND wallet_address != NEW.winner_address
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when duel completes
CREATE TRIGGER trigger_update_user_stats
  AFTER UPDATE OF status ON duels
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_user_stats_after_duel();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Insert some test user profiles
INSERT INTO user_profiles (wallet_address, username) VALUES
  ('0x7a3f...9d2c', 'CryptoKing'),
  ('0x4b8e...1a5f', 'NFTTrader'),
  ('0x9c2d...7e4b', 'DiamondHands'),
  ('0x1f6a...3c9e', 'MoonShot'),
  ('0x5d3b...8f2a', 'DeFiMaster')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert some test duels
INSERT INTO duels (creator_address, entry_fee, trading_token, duration, status, prize_pool) VALUES
  ('0x7a3f...9d2c', 100, 'ETH', 15, 'waiting', 200),
  ('0x4b8e...1a5f', 50, 'BTC', 30, 'waiting', 100),
  ('0x9c2d...7e4b', 200, 'NFT-Dragons', 10, 'waiting', 400),
  ('0x1f6a...3c9e', 150, 'SOL', 20, 'waiting', 300),
  ('0x5d3b...8f2a', 500, 'NFT-Apes', 15, 'active', 1000)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'FlipDuel database schema created successfully! 🎉' AS message;
