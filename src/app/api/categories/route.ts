import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { connectToMongoDB } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth/auth-middleware';

const prisma = new PrismaClient();

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const parentId = searchParams.get('parentId');

    // Try MongoDB first (for product catalog)
    try {
      const { db } = await connectToMongoDB();
      
      // Get categories with product counts from MongoDB
      const categories = await db.collection('categories').aggregate([
        {
          $match: { isActive: true }
        },
        {
          $lookup: {
            from: 'products',
            let: { categoryId: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$isActive', true] },
                      { $gt: ['$stock', 0] }
                    ]
                  }
                }
              }
            ],
            as: 'products'
          }
        },
        {
          $project: {
            id: { $toString: '$_id' },
            name: 1,
            slug: 1,
            description: 1,
            image: 1,
            count: { $size: '$products' },
            level: 1,
            parentId: 1
          }
        },
        {
          $sort: { order: 1, name: 1 }
        }
      ]).toArray();

      return NextResponse.json({
        success: true,
        categories
      });

    } catch (mongoError) {
      console.log('MongoDB not available, falling back to PostgreSQL');
      
      // Fallback to PostgreSQL categories
      const where: { parentId?: string | null } = {};
      
      if (parentId === 'null' || parentId === '') {
        where.parentId = null; // Root categories
      } else if (parentId) {
        where.parentId = parentId;
      }

      const categories = await prisma.category.findMany({
        where,
        include: {
          children: includeChildren,
          _count: {
            select: {
              children: true,
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Transform to match MongoDB format
      const transformedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        count: 0, // TODO: Calculate product count from PostgreSQL
        level: cat.level,
        parentId: cat.parentId
      }));

      return NextResponse.json({
        success: true,
        categories: transformedCategories
      });
    }

  } catch (error) {
    console.error('Categories API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json();
    const { name, description, icon, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        parentId: parentId || null,
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create category API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
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
