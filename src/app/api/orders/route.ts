import { NextRequest, NextResponse } from 'next/server';
import OrderService from '@/lib/services/order-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/orders - Get orders for authenticated retailer
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
        { success: false, error: 'Only retailers can view orders' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const orders = await OrderService.getRetailerOrders(authResult.user.id, page, limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: orders.length,
          hasNext: orders.length === limit,
          hasPrev: page > 1
        }
      },
    });
  } catch (error) {
    console.error('Get orders API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get orders' 
      },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
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
        { success: false, error: 'Only retailers can create orders' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!body.shippingAddress || !body.shippingAddress.street || !body.shippingAddress.city) {
      return NextResponse.json(
        { success: false, error: 'Valid shipping address is required' },
        { status: 400 }
      );
    }

    const orderData = {
      retailerId: authResult.user.id,
      items: body.items,
      shippingAddress: body.shippingAddress,
      notes: body.notes
    };

    const order = await OrderService.createOrder(orderData);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create order API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
