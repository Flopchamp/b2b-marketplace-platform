import { NextRequest, NextResponse } from 'next/server';
import { AuthService, LoginCredentials } from '@/lib/auth/postgresql-auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType } = body;

    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required.' },
        { status: 400 }
      );
    }

    if (!['company', 'retailer'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type. Must be either "company" or "retailer".' },
        { status: 400 }
      );
    }

    const credentials: LoginCredentials = {
      email,
      password,
      userType,
    };

    const authResult = await AuthService.login(credentials);

    // Set HTTP-only cookie for the refresh token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      accessToken: authResult.accessToken,
      user: authResult.user,
      expiresIn: authResult.expiresIn,
    }, { status: 200 });

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);

    if (error instanceof Error) {
      if (error.message === 'Invalid credentials' || error.message === 'Login failed') {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
