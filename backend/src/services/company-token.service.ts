import { query } from '../db/pool.js';
import crypto from 'crypto';

export interface CompanyTokenInfo {
  id: number;
  companyId: number;
  name: string;
  tokenPrefix: string;
  plaintextToken: string;
  expiresAt: string;
  isActive: boolean;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  createdAt: string;
  isExpired: boolean;
  daysRemaining: number;
}

export class CompanyTokenService {
  /**
   * Hashes a raw token with SHA-256 for secure database storage and lookups.
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  /**
   * Generates a new dedicated Company API Token.
   * Format: tal_live_cmp<companyId>_<48 hex chars>
   */
  static async generateToken(
    companyId: number,
    userId: number,
    name: string = 'TallyPrime Connector Token',
    expiryDays: number = 365
  ): Promise<CompanyTokenInfo> {
    const randomHex = crypto.randomBytes(24).toString('hex');
    const rawToken = `tal_live_cmp${companyId}_${randomHex}`;
    const tokenHash = this.hashToken(rawToken);
    const tokenPrefix = `tal_live_cmp${companyId}_${randomHex.substring(0, 4)}...${randomHex.slice(-4)}`;

    const validDays = Math.max(1, Math.min(365, Number(expiryDays) || 365));
    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // Deactivate any pre-existing active tokens for this company
    await query(
      `UPDATE company_api_tokens 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE company_id = $1 AND is_active = true`,
      [companyId]
    );

    // Insert new active token
    const res = await query(
      `INSERT INTO company_api_tokens (
         company_id, created_by_user_id, name, token_prefix, token_hash,
         plaintext_token, expires_at, is_active, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [companyId, userId, name, tokenPrefix, tokenHash, rawToken, expiresAt]
    );

    const row = res.rows[0];
    const msRemaining = new Date(row.expires_at).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      tokenPrefix: row.token_prefix,
      plaintextToken: row.plaintext_token,
      expiresAt: row.expires_at.toISOString(),
      isActive: row.is_active,
      lastUsedAt: row.last_used_at ? row.last_used_at.toISOString() : null,
      lastUsedIp: row.last_used_ip,
      createdAt: row.created_at.toISOString(),
      isExpired: false,
      daysRemaining,
    };
  }

  /**
   * Retrieves the current active token for a company.
   * If none exists, automatically generates a fresh 1-year token.
   */
  static async getActiveToken(companyId: number, userId: number = 0): Promise<CompanyTokenInfo> {
    const res = await query(
      `SELECT * FROM company_api_tokens 
       WHERE company_id = $1 AND is_active = true 
       ORDER BY id DESC LIMIT 1`,
      [companyId]
    );

    if (res.rows.length === 0) {
      // Auto-generate initial token for this company
      return this.generateToken(companyId, userId, 'TallyPrime Connector Token', 365);
    }

    const row = res.rows[0];
    const expDate = new Date(row.expires_at);
    const msRemaining = expDate.getTime() - Date.now();
    const isExpired = msRemaining <= 0;
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      tokenPrefix: row.token_prefix,
      plaintextToken: row.plaintext_token,
      expiresAt: expDate.toISOString(),
      isActive: row.is_active && !isExpired,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at).toISOString() : null,
      lastUsedIp: row.last_used_ip,
      createdAt: new Date(row.created_at).toISOString(),
      isExpired,
      daysRemaining,
    };
  }

  /**
   * Revokes an existing token.
   */
  static async revokeToken(companyId: number, tokenId?: number): Promise<boolean> {
    if (tokenId) {
      const res = await query(
        `UPDATE company_api_tokens 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE company_id = $1 AND id = $2`,
        [companyId, tokenId]
      );
      return (res.rowCount || 0) > 0;
    } else {
      const res = await query(
        `UPDATE company_api_tokens 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE company_id = $1 AND is_active = true`,
        [companyId]
      );
      return (res.rowCount || 0) > 0;
    }
  }

  /**
   * Verifies an incoming API token in sub-millisecond time.
   * If valid, updates last_used_at and returns company metadata.
   */
  static async verifyToken(
    rawToken: string,
    clientIp?: string
  ): Promise<{ isValid: boolean; companyId?: number; tokenId?: number; reason?: string }> {
    if (!rawToken || typeof rawToken !== 'string') {
      return { isValid: false, reason: 'MISSING_TOKEN' };
    }

    const clean = rawToken.trim();
    const hash = this.hashToken(clean);

    const res = await query(
      `SELECT id, company_id, expires_at, is_active 
       FROM company_api_tokens 
       WHERE token_hash = $1 LIMIT 1`,
      [hash]
    );

    if (res.rows.length === 0) {
      return { isValid: false, reason: 'TOKEN_NOT_FOUND' };
    }

    const row = res.rows[0];

    if (!row.is_active) {
      return { isValid: false, reason: 'TOKEN_REVOKED' };
    }

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      return { isValid: false, reason: 'TOKEN_EXPIRED' };
    }

    // Touch last used timestamp asynchronously
    query(
      `UPDATE company_api_tokens 
       SET last_used_at = CURRENT_TIMESTAMP, last_used_ip = $1 
       WHERE id = $2`,
      [clientIp || null, row.id]
    ).catch(() => {});

    return {
      isValid: true,
      companyId: Number(row.company_id),
      tokenId: Number(row.id),
    };
  }
}
