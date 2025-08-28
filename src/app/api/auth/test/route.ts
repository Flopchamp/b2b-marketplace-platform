import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/auth/test - Test authentication endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth test: Checking authentication...');
    
    // Check if authorization header exists
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth test: Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const authResult = await verifyAuth(request);
    console.log('🔍 Auth test: Auth result:', authResult);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Authentication failed',
          debug: {
            hasAuthHeader: !!authHeader,
            authHeaderFormat: authHeader ? 'Bearer token present' : 'No Bearer token'
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role,
        name: authResult.user.name
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
