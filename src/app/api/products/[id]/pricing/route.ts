import { NextRequest, NextResponse } from 'next/server';
import ProductService from '@/lib/services/product-service-clean';

// GET /api/products/[id]/pricing?quantity=X - Calculate bulk pricing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const quantityParam = searchParams.get('quantity');

    if (!quantityParam) {
      return NextResponse.json(
        { success: false, error: 'Quantity parameter is required' },
        { status: 400 }
      );
    }

    const quantity = parseInt(quantityParam);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    const priceBreakdown = await ProductService.calculateBulkPricing(
      params.id,
      quantity
    );

    return NextResponse.json({
      success: true,
      data: priceBreakdown,
    });

  } catch (error) {
    console.error('Calculate pricing API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Minimum order quantity') || 
          error.message.includes('Maximum order quantity') ||
          error.message.includes('Insufficient stock')) {
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
      { success: false, error: 'Failed to calculate pricing' },
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
