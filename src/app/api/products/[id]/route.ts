import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/products/[id] - Get product by ID
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
    const product = await ProductService.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // If user is a company, ensure they can only see their own products
    if (authResult.user.role === 'company') {
      const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: { companyId: true }
      });

      if (!user?.companyId || product.companyId !== user.companyId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to view this product' },
          { status: 403 }
        );
      }
    }

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

    // Check if user is a company
    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can update products' },
        { status: 403 }
      );
    }

    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'User is not associated with a company' },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Check if product exists and belongs to the company
    const existingProduct = await ProductService.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.companyId !== user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this product' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const product = await ProductService.updateProduct(
      id,
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

    // Check if user is a company
    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can delete products' },
        { status: 403 }
      );
    }

    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'User is not associated with a company' },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Check if product exists and belongs to the company
    const existingProduct = await ProductService.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.companyId !== user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this product' },
        { status: 403 }
      );
    }

    const product = await ProductService.deleteProduct(
      id
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
