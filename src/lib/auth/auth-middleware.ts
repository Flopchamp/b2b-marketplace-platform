import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface AuthUser {
  id: string;
  email: string;
  role: 'company' | 'retailer';
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'No valid authorization header found'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      
      return {
        success: true,
        user: {
          id: payload.sub || payload.userId,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        }
      };
    } catch (jwtError) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }

    if (roles && !roles.includes(authResult.user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403
      };
    }

    return {
      success: true,
      user: authResult.user
    };
  };
}

export default verifyAuth;
