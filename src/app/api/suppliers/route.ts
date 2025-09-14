import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { mongoClient } from '@/lib/db/mongodb';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
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

    if (decoded.role !== 'retailer') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Retailer role required.' },
        { status: 403 }
      );
    }

    // Ensure MongoDB is connected
    try {
      await mongoClient.connect();
    } catch (connectError) {
      console.log('MongoDB already connected or connection failed:', connectError);
    }

    const db = await mongoClient.getDb();
    
    // Fetch all companies/suppliers with their aggregated data
    const suppliers = await db.collection('companies').aggregate([
      {
        $match: {
          isActive: true,
          verificationStatus: { $in: ['verified', 'pending'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'companyId',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'companyId',
          as: 'users'
        }
      },
      {
        $addFields: {
          productsCount: { $size: '$products' },
          businessEmail: { $arrayElemAt: ['$users.email', 0] },
          isVerified: { $eq: ['$verificationStatus', 'verified'] },
          // Mock data for demonstration - in a real app, these would come from reviews/orders
          rating: { $literal: 4.5 },
          totalReviews: { $literal: 23 }
        }
      },
      {
        $project: {
          _id: 1,
          companyName: 1,
          businessEmail: 1,
          website: 1,
          phone: 1,
          address: 1,
          description: 1,
          industries: 1,
          certifications: 1,
          rating: 1,
          totalReviews: 1,
          productsCount: 1,
          joinedDate: '$createdAt',
          isVerified: 1,
          logo: 1
        }
      },
      {
        $sort: { isVerified: -1, rating: -1, productsCount: -1 }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: suppliers
    });

  } catch (error) {
    console.error('Suppliers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
