import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// PUT /api/products/[id]/inventory - Update product inventory
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user is a company
    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can update inventory' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a number' },
        { status: 400 }
      );
    }

    const product = await ProductService.updateInventory(
      params.id,
      quantity
    );

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Inventory updated successfully',
    });

  } catch (error) {
    console.error('Update inventory API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message === 'Insufficient stock') {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
