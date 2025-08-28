import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service-clean';
import { verifyAuth } from '@/lib/auth/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/products - Search products
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

    const { searchParams } = new URL(request.url);
    
    // For company users, force companyId to be their own company
    let companyId = searchParams.get('companyId') || undefined;
    
    if (authResult.user.role === 'company') {
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

      // Force companyId to be the authenticated user's company
      companyId = user.companyId;
    }
    
    const searchQuery = {
      query: searchParams.get('query') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      companyId: companyId,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : true,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'created' | 'popularity') || 'created',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await ProductService.searchProducts(searchQuery);

    return NextResponse.json({
      success: true,
      data: {
        products: result,
        total: result.length,
        page: searchQuery.page || 1,
        limit: searchQuery.limit || 20
      },
    });
  } catch (error) {
    console.error('Products search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search products' 
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
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

    // Check if user is a company
    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can create products' },
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

    const body = await request.json();
    
    const product = await ProductService.createProduct(user.companyId, body);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create product API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
