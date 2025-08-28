import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Types and Interfaces
export interface ProductData {
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  basePrice: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  stockQuantity: number;
  lowStockAlert?: number;
  images?: string[];
  videos?: string[];
  documents?: string[];
  weight?: number;
  dimensions?: string;
  specifications?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  categoryId: string;
}

export interface SearchQuery {
  query?: string;
  categoryId?: string;
  companyId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'created' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface PriceBreakdown {
  basePrice: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
}

// Validation Schemas
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  basePrice: z.number().positive('Price must be positive'),
  minOrderQty: z.number().int().positive().default(1),
  maxOrderQty: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  lowStockAlert: z.number().int().positive().default(10),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
});

// Helper function to calculate average rating
function calculateAverageRating(reviews: Array<{ rating: number }>): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export class ProductService {
  // Create a new product
  static async createProduct(companyId: string, productData: ProductData) {
    try {
      // Validate input data
      const validatedData = productSchema.parse(productData);

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Check if SKU is unique
      const existingSku = await prisma.product.findUnique({
        where: { sku: validatedData.sku }
      });

      if (existingSku) {
        throw new Error('SKU already exists');
      }

      // Generate slug from product name
      const slug = this.generateSlug(validatedData.name);

      // Create product
      const product = await prisma.product.create({
        data: {
          ...validatedData,
          slug,
          companyId,
          specifications: validatedData.specifications || {},
        },
        include: {
          company: true,
          category: true,
        }
      });

      // Create initial price history record
      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: validatedData.basePrice,
          reason: 'Initial price',
        }
      });

      return product;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  // Update product inventory
  static async updateInventory(productId: string, quantity: number, _reason?: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const newQuantity = product.stockQuantity + quantity;

      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          status: newQuantity === 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
        },
        include: {
          company: true,
          category: true,
        }
      });

      // Check for low stock alert
      if (newQuantity <= product.lowStockAlert && newQuantity > 0) {
        // TODO: Send low stock notification
        console.log(`Low stock alert for product ${product.name}: ${newQuantity} remaining`);
      }

      return updatedProduct;
    } catch (error) {
      console.error('Update inventory error:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(searchQuery: SearchQuery) {
    try {
      const {
        query,
        categoryId,
        companyId,
        minPrice,
        maxPrice,
        inStock = true,
        page = 1,
        limit = 20,
        sortBy = 'created',
        sortOrder = 'desc'
      } = searchQuery;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        status: 'ACTIVE',
      };

      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (companyId) {
        where.companyId = companyId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.basePrice = {};
        if (minPrice !== undefined) {
          where.basePrice.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.basePrice.lte = maxPrice;
        }
      }

      if (inStock) {
        where.stockQuantity = { gt: 0 };
      }

      // Build order by clause
      let orderBy: any = {};
      switch (sortBy) {
        case 'name':
          orderBy.name = sortOrder;
          break;
        case 'price':
          orderBy.basePrice = sortOrder;
          break;
        case 'created':
          orderBy.createdAt = sortOrder;
          break;
        case 'popularity':
          // TODO: Implement popularity sorting based on analytics
          orderBy.createdAt = sortOrder;
          break;
        default:
          orderBy.createdAt = sortOrder;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                isVerified: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
              }
            },
            reviews: {
              select: {
                rating: true,
              }
            },
            _count: {
              select: {
                reviews: true,
                orderItems: true,
              }
            }
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where })
      ]);

      // Calculate average ratings and format response
      const formattedProducts = products.map((product: any) => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        reviews: undefined,
        _count: undefined,
      }));

      return {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      };
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  // Get product recommendations for a retailer
  static async getRecommendations(retailerId: string, limit: number = 10) {
    try {
      // Get retailer's order history to understand preferences
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            retailerId: retailerId,
          }
        },
        include: {
          product: {
            include: {
              category: true,
            }
          }
        },
        take: 50, // Analyze last 50 orders
        orderBy: {
          order: {
            createdAt: 'desc'
          }
        }
      });

      // Extract category preferences
      const categoryFrequency: Record<string, number> = {};
      orderItems.forEach(item => {
        const categoryId = item.product.categoryId;
        categoryFrequency[categoryId] = (categoryFrequency[categoryId] || 0) + 1;
      });

      // Get top categories
      const topCategories = Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([categoryId]) => categoryId);

      if (topCategories.length === 0) {
        // If no order history, return popular products
        return this.getPopularProducts(limit);
      }

      // Get products from preferred categories that haven't been ordered
      const orderedProductIds = orderItems.map(item => item.product.id);

      const recommendations = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          stockQuantity: { gt: 0 },
          categoryId: { in: topCategories },
          id: { notIn: orderedProductIds },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              isVerified: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
      });

      return recommendations.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        reviews: undefined,
        _count: undefined,
      }));
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }

  // Calculate bulk pricing
  static async calculateBulkPricing(productId: string, quantity: number): Promise<PriceBreakdown> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          promotions: {
            include: {
              promotion: {
                where: {
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                }
              }
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (quantity < product.minOrderQty) {
        throw new Error(`Minimum order quantity is ${product.minOrderQty}`);
      }

      if (product.maxOrderQty && quantity > product.maxOrderQty) {
        throw new Error(`Maximum order quantity is ${product.maxOrderQty}`);
      }

      if (quantity > product.stockQuantity) {
        throw new Error('Insufficient stock');
      }

      let unitPrice = product.basePrice;
      let discount: PriceBreakdown['discount'] | undefined;

      // Apply bulk discount based on quantity
      if (quantity >= 100) {
        discount = {
          type: 'percentage',
          value: 10,
          amount: (product.basePrice * quantity * 0.1),
        };
        unitPrice = product.basePrice * 0.9;
      } else if (quantity >= 50) {
        discount = {
          type: 'percentage',
          value: 5,
          amount: (product.basePrice * quantity * 0.05),
        };
        unitPrice = product.basePrice * 0.95;
      }

      // Check for active promotions
      for (const productPromotion of product.promotions) {
        const promotion = productPromotion.promotion;
        
        if (promotion.type === 'PERCENTAGE_DISCOUNT') {
          const promotionDiscount = product.basePrice * quantity * (promotion.value / 100);
          if (!discount || promotionDiscount > discount.amount) {
            discount = {
              type: 'percentage',
              value: promotion.value,
              amount: promotionDiscount,
            };
            unitPrice = product.basePrice * (1 - promotion.value / 100);
          }
        } else if (promotion.type === 'FIXED_AMOUNT_DISCOUNT') {
          if (!discount || promotion.value > discount.amount) {
            discount = {
              type: 'fixed',
              value: promotion.value,
              amount: promotion.value,
            };
            unitPrice = Math.max(0, product.basePrice - (promotion.value / quantity));
          }
        }
      }

      const totalPrice = unitPrice * quantity;

      return {
        basePrice: product.basePrice,
        quantity,
        unitPrice,
        totalPrice,
        discount,
      };
    } catch (error) {
      console.error('Calculate bulk pricing error:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              isVerified: true,
              description: true,
            }
          },
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          priceHistory: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        averageRating,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        _count: undefined,
      };
    } catch (error) {
      console.error('Get product by ID error:', error);
      throw error;
    }
  }

  // Get popular products
  static async getPopularProducts(limit: number = 10) {
    try {
      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          stockQuantity: { gt: 0 },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              isVerified: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            }
          }
        },
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        take: limit,
      });

      return products.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        reviews: undefined,
        _count: undefined,
      }));
    } catch (error) {
      console.error('Get popular products error:', error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(productId: string, companyId: string, updateData: Partial<ProductData>) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.companyId !== companyId) {
        throw new Error('Unauthorized: You can only update your own products');
      }

      // If price is being updated, record it in price history
      if (updateData.basePrice && updateData.basePrice !== product.basePrice) {
        await prisma.priceHistory.create({
          data: {
            productId: product.id,
            price: updateData.basePrice,
            reason: 'Price update',
          }
        });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          ...updateData,
          specifications: updateData.specifications || product.specifications,
        },
        include: {
          company: true,
          category: true,
        }
      });

      return updatedProduct;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string, companyId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          orderItems: {
            include: {
              order: {
                select: {
                  status: true,
                }
              }
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.companyId !== companyId) {
        throw new Error('Unauthorized: You can only delete your own products');
      }

      // Check if product has active orders
      const activeOrders = product.orderItems.some(item => 
        ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(item.order.status)
      );

      if (activeOrders) {
        throw new Error('Cannot delete product with active orders');
      }

      // Soft delete by marking as discontinued
      const deletedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          status: 'DISCONTINUED',
        }
      });

      return deletedProduct;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  // Get products by company
  static async getProductsByCompany(companyId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            companyId,
            status: { not: 'DISCONTINUED' },
          },
          include: {
            category: true,
            reviews: {
              select: {
                rating: true,
              }
            },
            _count: {
              select: {
                reviews: true,
                orderItems: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit,
        }),
        prisma.product.count({
          where: {
            companyId,
            status: { not: 'DISCONTINUED' },
          }
        })
      ]);

      const formattedProducts = products.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        reviews: undefined,
        _count: undefined,
      }));

      return {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      };
    } catch (error) {
      console.error('Get products by company error:', error);
      throw error;
    }
  }

  // Helper method to generate slug from product name
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export default ProductService;
