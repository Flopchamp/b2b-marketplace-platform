// Mock authentication service for testing without databases
import { User, AuthToken, LoginCredentials, CompanyRegistration, RetailerRegistration } from './auth-service';

interface MockUser extends User {
  passwordHash: string;
  phone?: string;
  businessRegistration?: string;
  website?: string;
  address?: unknown;
}

interface MockSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  createdAt: string;
}

// In-memory storage for testing
const mockUsers: Map<string, MockUser> = new Map();
const mockSessions: Map<string, MockSession> = new Map();

export class MockAuthService {
  // Company registration
  static async registerCompany(data: CompanyRegistration): Promise<User> {
    // Check if email already exists
    const existingUser = Array.from(mockUsers.values()).find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const userId = `company_${Date.now()}`;
    const user: User = {
      id: userId,
      email: data.email,
      role: 'company',
      name: data.name,
      verificationStatus: 'pending',
    };

    // Store user with password hash simulation
    mockUsers.set(userId, {
      ...user,
      passwordHash: `hashed_${data.password}`, // Mock hash
      ...data,
    });

    return user;
  }

  // Retailer registration
  static async registerRetailer(data: RetailerRegistration): Promise<User> {
    // Check if email already exists
    const existingUser = Array.from(mockUsers.values()).find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const userId = `retailer_${Date.now()}`;
    const user: User = {
      id: userId,
      email: data.email,
      role: 'retailer',
      name: data.contactPerson,
      businessName: data.businessName,
      kycStatus: 'pending',
    };

    // Store user with password hash simulation
    mockUsers.set(userId, {
      ...user,
      passwordHash: `hashed_${data.password}`, // Mock hash
      ...data,
    });

    return user;
  }

  // User login
  static async login(credentials: LoginCredentials): Promise<AuthToken> {
    // Find user by email and type
    const user = Array.from(mockUsers.values()).find(
      u => u.email === credentials.email && u.role === credentials.userType
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Mock password verification
    const expectedHash = `hashed_${credentials.password}`;
    if (user.passwordHash !== expectedHash) {
      throw new Error('Invalid credentials');
    }

    // Generate mock tokens
    const accessToken = `mock_access_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;

    const authToken: AuthToken = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        verificationStatus: user.verificationStatus,
        kycStatus: user.kycStatus,
      },
      expiresIn: 3600,
    };

    // Store session
    mockSessions.set(user.id, {
      userId: user.id,
      accessToken,
      refreshToken,
      user: authToken.user,
      createdAt: new Date().toISOString(),
    });

    return authToken;
  }

  // Verify token
  static async verifyToken(token: string): Promise<User | null> {
    // Extract user ID from mock token
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) return null;

    const userId = tokenParts[2];
    const session = mockSessions.get(userId);

    if (!session || session.accessToken !== token) {
      return null;
    }

    return session.user;
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    // Find session by refresh token
    const session = Array.from(mockSessions.values()).find(
      s => s.refreshToken === refreshToken
    );

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = `mock_access_${session.userId}_${Date.now()}`;
    const newRefreshToken = `mock_refresh_${session.userId}_${Date.now()}`;

    const authToken: AuthToken = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: session.user,
      expiresIn: 3600,
    };

    // Update session
    mockSessions.set(session.userId, {
      ...session,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return authToken;
  }

  // Logout
  static async logout(userId: string): Promise<void> {
    mockSessions.delete(userId);
  }

  // Get user by ID
  static async getUserById(userId: string, role: 'company' | 'retailer'): Promise<User | null> {
    const userData = mockUsers.get(userId);
    if (!userData || userData.role !== role) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      businessName: userData.businessName,
      verificationStatus: userData.verificationStatus,
      kycStatus: userData.kycStatus,
    };
  }

  // Helper method to get all users (for debugging)
  static getAllUsers() {
    return Array.from(mockUsers.values()).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      businessName: user.businessName,
    }));
  }

  // Helper method to get all sessions (for debugging)
  static getAllSessions() {
    return Array.from(mockSessions.values());
  }
}
