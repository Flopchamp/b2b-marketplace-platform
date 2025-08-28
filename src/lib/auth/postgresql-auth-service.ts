import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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
  constructor() {
    // Test connection on startup
    this.testConnection();
  }

  private async testConnection() {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL connected successfully via Prisma');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
    }
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
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create company and user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create company first
        const company = await tx.company.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            website: data.website,
            registrationNo: data.businessRegistration,
            status: 'PENDING_VERIFICATION'
          }
        });

        // Create user and link to company
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: passwordHash,
            name: data.name,
            role: 'COMPANY_ADMIN',
            status: 'PENDING_VERIFICATION',
            companyId: company.id
          }
        });

        return { user, company };
      });

      // Return user data
      return {
        id: result.user.id,
        email: result.user.email,
        role: 'company',
        name: result.user.name || undefined,
        businessName: result.company.name,
        verificationStatus: 'pending',
        createdAt: result.user.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error in registerCompany:', error);
      throw error;
    }
  }

  async registerRetailer(data: RetailerRegistration): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create retailer and user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create retailer first
        const retailer = await tx.retailer.create({
          data: {
            businessName: data.businessName,
            contactPerson: data.contactPerson,
            email: data.email,
            phone: data.phone,
            status: 'PENDING_VERIFICATION'
          }
        });

        // Create user and link to retailer
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: passwordHash,
            name: data.contactPerson,
            role: 'RETAILER_ADMIN',
            status: 'PENDING_VERIFICATION',
            retailerId: retailer.id
          }
        });

        return { user, retailer };
      });

      // Return user data
      return {
        id: result.user.id,
        email: result.user.email,
        role: 'retailer',
        name: result.user.name || undefined,
        businessName: result.retailer.businessName,
        verificationStatus: 'pending',
        kycStatus: 'pending',
        createdAt: result.user.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error in registerRetailer:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      // Get user with related data
      const user = await prisma.user.findUnique({
        where: { 
          email: credentials.email,
          status: { not: 'SUSPENDED' }
        },
        include: {
          company: true,
          retailer: true
        }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password || '');
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Check user type matches credentials
      const isCompanyUser = user.role === 'COMPANY_ADMIN' || user.role === 'COMPANY_USER';
      const isRetailerUser = user.role === 'RETAILER_ADMIN' || user.role === 'RETAILER_USER';
      
      if (credentials.userType === 'company' && !isCompanyUser) {
        throw new Error('Invalid user type for company login');
      }
      
      if (credentials.userType === 'retailer' && !isRetailerUser) {
        throw new Error('Invalid user type for retailer login');
      }

      // Create user object
      const userObject: User = {
        id: user.id,
        email: user.email,
        role: credentials.userType,
        name: user.name || user.company?.name || undefined,
        businessName: user.company?.name || user.retailer?.businessName || undefined,
        verificationStatus: user.status === 'PENDING_VERIFICATION' ? 'pending' : 
                           user.status === 'ACTIVE' ? 'verified' : 'rejected',
        createdAt: user.createdAt.toISOString(),
      };

      // Generate tokens
      const tokens = this.generateTokens(userObject);

      return {
        ...tokens,
        user: userObject,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // For now, we don't have a refresh_tokens table in our schema
      // This would be a place to revoke tokens if we implement refresh token storage
      console.log(`User ${userId} logged out successfully`);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        userId: string;
        email: string;
        role: string;
      };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { 
          id: payload.userId,
          status: 'ACTIVE'
        },
        include: {
          company: true,
          retailer: true
        }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: payload.role as 'company' | 'retailer',
        name: user.name || user.company?.name || undefined,
        businessName: user.company?.name || user.retailer?.businessName || undefined,
        verificationStatus: user.status === 'PENDING_VERIFICATION' ? 'pending' : 
                           user.status === 'ACTIVE' ? 'verified' : 'rejected',
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const AuthService = new PostgreSQLAuthService();
