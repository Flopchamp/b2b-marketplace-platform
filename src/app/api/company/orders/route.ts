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

export async function GET(req: NextRequest) {
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

    // For now, return empty results as we implement this step by step
    const emptyResult = {
      orders: [],
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: emptyResult
    });

  } catch (error) {
    console.error('Company orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
