import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory store for development (will be replaced by real databases)
const users = new Map();
const sessions = new Map();

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

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key';
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '7d';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class DevAuthService {
  // Company registration
  static async registerCompany(data: CompanyRegistration): Promise<User> {
    try {
      // Check if email already exists
      for (const [, userData] of users) {
        if (userData.email === data.email) {
          throw new Error('Email already registered');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user
      const userId = generateId();
      const user: User & { passwordHash: string } = {
        id: userId,
        email: data.email,
        role: 'company',
        name: data.name,
        verificationStatus: 'pending',
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.set(userId, user);

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      console.error('Company registration error:', error);
      throw error;
    }
  }

  // Retailer registration
  static async registerRetailer(data: RetailerRegistration): Promise<User> {
    try {
      // Check if email already exists
      for (const [, userData] of users) {
        if (userData.email === data.email) {
          throw new Error('Email already registered');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user
      const userId = generateId();
      const user: User & { passwordHash: string } = {
        id: userId,
        email: data.email,
        role: 'retailer',
        name: data.contactPerson,
        businessName: data.businessName,
        kycStatus: 'pending',
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.set(userId, user);

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      console.error('Retailer registration error:', error);
      throw error;
    }
  }

  // User login
  static async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      let userData: (User & { passwordHash: string }) | undefined;

      // Find user by email and role
      for (const [, user] of users) {
        if (user.email === credentials.email && user.role === credentials.userType) {
          userData = user;
          break;
        }
      }

      if (!userData) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, userData.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Remove password from user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...user } = userData;

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Store session
      sessions.set(user.id, {
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        createdAt: new Date().toISOString(),
      });

      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      
      if (!decoded.sub) {
        return null;
      }

      // Check if session exists
      const session = sessions.get(decoded.sub);
      if (!session) {
        return null;
      }

      return session.user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Logout
  static async logout(userId: string): Promise<void> {
    sessions.delete(userId);
  }

  // Get all users (for debugging)
  static getAllUsers(): Array<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Array.from(users.values()).map(({ passwordHash: _, ...user }) => user);
  }
}
