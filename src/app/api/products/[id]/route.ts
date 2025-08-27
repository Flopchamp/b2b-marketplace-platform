import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service';
import { verifyAuth } from '@/lib/auth/auth-middleware';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await ProductService.getProductById(params.id);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product API error:', error);
    
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
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
        { success: false, error: 'Only companies can update products' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const product = await ProductService.updateProduct(
      params.id,
      authResult.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });

  } catch (error) {
    console.error('Update product API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
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
        { success: false, error: 'Only companies can delete products' },
        { status: 403 }
      );
    }

    const product = await ProductService.deleteProduct(
      params.id,
      authResult.user.id
    );

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Delete product API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('Cannot delete product')) {
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
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
