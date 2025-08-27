import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Types
export interface User {
  id: string;
  email: string;
  role: 'company' | 'retailer';
  name?: string;
  businessName?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  kycStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'company' | 'retailer';
}

export interface CompanyRegistration {
  name: string;
  email: string;
  password: string;
  phone?: string;
  businessRegistration?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface RetailerRegistration {
  businessName: string;
  contactPerson: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

class PostgreSQLAuthService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    // Test connection on startup
    this.testConnection();
  }

  private async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
    }
  }

  private generateId(): string {
    // PostgreSQL will generate UUID automatically, so we don't need this method
    // But keeping it for compatibility
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string; expiresIn: number } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  async registerCompany(data: CompanyRegistration): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, verification_status, kyc_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role, verification_status, kyc_status, created_at`,
        [data.email, passwordHash, 'company', 'pending', 'pending']
      );

      const user = userResult.rows[0];

      // Insert company details
      await client.query(
        `INSERT INTO companies (user_id, name, business_registration, phone, website)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, data.name, data.businessRegistration, data.phone, data.website]
      );

      // Insert address if provided
      if (data.address) {
        await client.query(
          `INSERT INTO addresses (entity_type, entity_id, street, city, state, zip_code, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            'company',
            user.id,
            data.address.street,
            data.address.city,
            data.address.state,
            data.address.zipCode,
            data.address.country,
          ]
        );
      }

      await client.query('COMMIT');

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: data.name,
        verificationStatus: user.verification_status,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Company registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async registerRetailer(data: RetailerRegistration): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, verification_status, kyc_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role, verification_status, kyc_status, created_at`,
        [data.email, passwordHash, 'retailer', 'pending', 'pending']
      );

      const user = userResult.rows[0];

      // Insert retailer details
      await client.query(
        `INSERT INTO retailers (user_id, business_name, contact_person, phone)
         VALUES ($1, $2, $3, $4)`,
        [user.id, data.businessName, data.contactPerson, data.phone]
      );

      // Insert address if provided
      if (data.address) {
        await client.query(
          `INSERT INTO addresses (entity_type, entity_id, street, city, state, zip_code, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            'retailer',
            user.id,
            data.address.street,
            data.address.city,
            data.address.state,
            data.address.zipCode,
            data.address.country,
          ]
        );
      }

      await client.query('COMMIT');

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        businessName: data.businessName,
        verificationStatus: user.verification_status,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Retailer registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const client = await this.pool.connect();
    
    try {
      // Get user with password
      const userResult = await client.query(
        `SELECT u.id, u.email, u.password_hash, u.role, u.verification_status, u.kyc_status, u.created_at,
                c.name as company_name, r.business_name as retailer_business_name
         FROM users u
         LEFT JOIN companies c ON u.id = c.user_id
         LEFT JOIN retailers r ON u.id = r.user_id
         WHERE u.email = $1 AND u.role = $2 AND u.is_active = true`,
        [credentials.email, credentials.userType]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Create user object
      const userObject: User = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.company_name || undefined,
        businessName: user.retailer_business_name || undefined,
        verificationStatus: user.verification_status,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
      };

      // Generate tokens
      const tokens = this.generateTokens(userObject);

      // Store refresh token in database
      const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshTokenHash, expiresAt]
      );

      return {
        ...tokens,
        user: userObject,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async logout(userId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Revoke refresh token
      await client.query(
        `UPDATE refresh_tokens 
         SET is_revoked = true 
         WHERE user_id = $1 AND is_revoked = false`,
        [userId]
      );
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        userId: string;
        email: string;
        role: string;
      };
      
      const client = await this.pool.connect();
      try {
        const userResult = await client.query(
          `SELECT u.id, u.email, u.role, u.verification_status, u.kyc_status, u.created_at,
                  c.name as company_name, r.business_name as retailer_business_name
           FROM users u
           LEFT JOIN companies c ON u.id = c.user_id
           LEFT JOIN retailers r ON u.id = r.user_id
           WHERE u.id = $1 AND u.is_active = true`,
          [payload.userId]
        );

        if (userResult.rows.length === 0) {
          return null;
        }

        const user = userResult.rows[0];
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.company_name || undefined,
          businessName: user.retailer_business_name || undefined,
          verificationStatus: user.verification_status,
          kycStatus: user.kyc_status,
          createdAt: user.created_at,
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const AuthService = new PostgreSQLAuthService();
