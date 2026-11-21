-- Talliffy Multi-Company API Tokens for Tally TDL Integration
CREATE TABLE IF NOT EXISTS company_api_tokens (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(cmpid) ON DELETE CASCADE,
    created_by_user_id BIGINT REFERENCES users(userid) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'TallyPrime Connector Token',
    token_prefix VARCHAR(40) NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    plaintext_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_used_ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_api_tokens_company ON company_api_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_company_api_tokens_hash ON company_api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_company_api_tokens_active ON company_api_tokens(is_active);
