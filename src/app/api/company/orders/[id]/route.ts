import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Company role required.' },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.companyId) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get the order with its items and products
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if any of the products in the order belong to this company
    const hasCompanyProducts = order.items.some(
      (item: any) => item.product.companyId === user.companyId
    );

    if (!hasCompanyProducts) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this order' },
        { status: 403 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: status.toUpperCase() as any, // Convert to enum
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
