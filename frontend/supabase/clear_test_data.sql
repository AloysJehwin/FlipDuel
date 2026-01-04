-- Clear all test data from FlipDuel database
-- Run this in your Supabase SQL Editor
-- NOTE: Run migration_add_web3_fields.sql FIRST before running this script

-- Delete all trades (cascade will handle this, but being explicit)
DELETE FROM duel_trades;

-- Delete all participants
DELETE FROM duel_participants;

-- Delete all duels
DELETE FROM duels;

-- Delete price oracle snapshots if table exists (only if migration was run)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables
             WHERE table_schema = 'public'
             AND table_name = 'price_oracle_snapshots') THEN
    DELETE FROM price_oracle_snapshots;
  END IF;
END $$;

-- Optionally reset user stats (uncomment if needed)
-- UPDATE user_profiles SET
--   total_duels = 0,
--   duels_won = 0,
--   duels_lost = 0,
--   total_pnl = 0;

-- Success message
SELECT 'All test duels cleared successfully! ✨' AS message;
