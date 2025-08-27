import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/recommendations - Get product recommendations for retailer
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a retailer
    if (authResult.user.role !== 'retailer') {
      return NextResponse.json(
        { success: false, error: 'Only retailers can get recommendations' },
        { status: 403 }
      );
    }

    const recommendations = await ProductService.getRecommendations();

    return NextResponse.json({
      success: true,
      data: recommendations,
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
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
