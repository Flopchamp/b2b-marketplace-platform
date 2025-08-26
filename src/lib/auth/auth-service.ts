import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { postgresClient } from '../db/postgresql';
import { redisClient, CACHE_KEYS, CACHE_TTL } from '../db/redis';

// Types
export interface User {
  id: string;
  email: string;
  role: 'company' | 'retailer';
  name?: string;
  businessName?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  kycStatus?: 'pending' | 'verified' | 'rejected';
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

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  // Company registration
  static async registerCompany(data: CompanyRegistration): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await postgresClient.query(
        'SELECT id FROM companies WHERE email = $1 UNION SELECT id FROM retailers WHERE email = $1',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Insert company
      const result = await postgresClient.query(
        `INSERT INTO companies (name, email, password_hash, phone, business_registration, website, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, verification_status`,
        [
          data.name,
          data.email,
          passwordHash,
          data.phone,
          data.businessRegistration,
          data.website,
          data.address ? JSON.stringify(data.address) : null,
        ]
      );

      const company = result.rows[0];
      return {
        id: company.id,
        email: company.email,
        role: 'company',
        name: company.name,
        verificationStatus: company.verification_status,
      };
    } catch (error) {
      console.error('Company registration error:', error);
      throw new Error('Failed to register company');
    }
  }

  // Retailer registration
  static async registerRetailer(data: RetailerRegistration): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await postgresClient.query(
        'SELECT id FROM companies WHERE email = $1 UNION SELECT id FROM retailers WHERE email = $1',
        [data.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Insert retailer
      const result = await postgresClient.query(
        `INSERT INTO retailers (business_name, contact_person, email, password_hash, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, business_name, contact_person, email, kyc_status`,
        [
          data.businessName,
          data.contactPerson,
          data.email,
          passwordHash,
          data.phone,
          data.address ? JSON.stringify(data.address) : null,
        ]
      );

      const retailer = result.rows[0];
      return {
        id: retailer.id,
        email: retailer.email,
        role: 'retailer',
        name: retailer.contact_person,
        businessName: retailer.business_name,
        kycStatus: retailer.kyc_status,
      };
    } catch (error) {
      console.error('Retailer registration error:', error);
      throw new Error('Failed to register retailer');
    }
  }

  // User login
  static async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      let user: User | null = null;
      let passwordHash: string;

      if (credentials.userType === 'company') {
        const result = await postgresClient.query(
          'SELECT id, name, email, password_hash, verification_status FROM companies WHERE email = $1',
          [credentials.email]
        );

        if (result.rows.length === 0) {
          throw new Error('Invalid credentials');
        }

        const company = result.rows[0];
        passwordHash = company.password_hash;
        user = {
          id: company.id,
          email: company.email,
          role: 'company',
          name: company.name,
          verificationStatus: company.verification_status,
        };
      } else {
        const result = await postgresClient.query(
          'SELECT id, business_name, contact_person, email, password_hash, kyc_status FROM retailers WHERE email = $1',
          [credentials.email]
        );

        if (result.rows.length === 0) {
          throw new Error('Invalid credentials');
        }

        const retailer = result.rows[0];
        passwordHash = retailer.password_hash;
        user = {
          id: retailer.id,
          email: retailer.email,
          role: 'retailer',
          name: retailer.contact_person,
          businessName: retailer.business_name,
          kycStatus: retailer.kyc_status,
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store session in Redis
      await this.storeSession(user.id, tokens);

      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  // Generate JWT tokens
  private static async generateTokens(user: User): Promise<AuthToken> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    } as jwt.SignOptions);
    
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: JWT_REFRESH_EXPIRES_IN 
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  // Store session in Redis
  private static async storeSession(userId: string, tokens: AuthToken): Promise<void> {
    const sessionKey = CACHE_KEYS.USER_SESSION(userId);
    const sessionData = {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
      createdAt: new Date().toISOString(),
    };

    await redisClient.setJSON(sessionKey, sessionData, CACHE_TTL.SESSION);
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      
      if (!decoded.sub) {
        return null;
      }

      // Check if session exists in Redis
      const sessionKey = CACHE_KEYS.USER_SESSION(decoded.sub);
      const session = await redisClient.getJSON<{ user: User }>(sessionKey);

      if (!session) {
        return null;
      }

      return session.user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
      
      if (!decoded.sub) {
        throw new Error('Invalid refresh token');
      }

      // Get user from session
      const sessionKey = CACHE_KEYS.USER_SESSION(decoded.sub);
      const session = await redisClient.getJSON<{ user: User; refreshToken: string }>(sessionKey);

      if (!session || session.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user);

      // Update session
      await this.storeSession(session.user.id, tokens);

      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  }

  // Logout
  static async logout(userId: string): Promise<void> {
    try {
      const sessionKey = CACHE_KEYS.USER_SESSION(userId);
      await redisClient.del(sessionKey);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  // Get user by ID
  static async getUserById(userId: string, role: 'company' | 'retailer'): Promise<User | null> {
    try {
      let result;
      
      if (role === 'company') {
        result = await postgresClient.query(
          'SELECT id, name, email, verification_status FROM companies WHERE id = $1',
          [userId]
        );

        if (result.rows.length === 0) return null;

        const company = result.rows[0];
        return {
          id: company.id,
          email: company.email,
          role: 'company',
          name: company.name,
          verificationStatus: company.verification_status,
        };
      } else {
        result = await postgresClient.query(
          'SELECT id, business_name, contact_person, email, kyc_status FROM retailers WHERE id = $1',
          [userId]
        );

        if (result.rows.length === 0) return null;

        const retailer = result.rows[0];
        return {
          id: retailer.id,
          email: retailer.email,
          role: 'retailer',
          name: retailer.contact_person,
          businessName: retailer.business_name,
          kycStatus: retailer.kyc_status,
        };
      }
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
