
CREATE TABLE premade_bans (
    id SERIAL PRIMARY KEY,
    shield_id TEXT,
    moderator_provider_id BIGINT,
    moderator_game_id BIGINT,
    target_game_name TEXT,
    target_account_id TEXT,
    
)
