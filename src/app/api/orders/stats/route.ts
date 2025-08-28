import { NextRequest, NextResponse } from 'next/server';
import OrderService from '@/lib/services/order-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/orders/stats - Get order statistics for authenticated retailer
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
        { success: false, error: 'Only retailers can view order statistics' },
        { status: 403 }
      );
    }

    const stats = await OrderService.getOrderStats(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get order stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get order statistics' 
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
