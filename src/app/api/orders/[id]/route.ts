import { NextRequest, NextResponse } from 'next/server';
import OrderService from '@/lib/services/order-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/orders/[id] - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this order
    if (authResult.user.role === 'retailer' && order.retailerId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order API error:', error);
    
    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status provided' },
        { status: 400 }
      );
    }

    // Get existing order to check ownership
    const existingOrder = await OrderService.getOrderById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization - retailers can only cancel their own orders
    if (authResult.user.role === 'retailer') {
      if (existingOrder.retailerId !== authResult.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to modify this order' },
          { status: 403 }
        );
      }
      // Retailers can only cancel orders
      if (body.status !== 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Retailers can only cancel orders' },
          { status: 403 }
        );
      }
    }

    const order = await OrderService.updateOrderStatus(id, body.status);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });

  } catch (error) {
    console.error('Update order API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
