import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ObjectId, MongoClient, Db } from 'mongodb';

const prisma = new PrismaClient();

// MongoDB Connection
const mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017/b2b_marketplace');
let mongodb: Db | null = null;

// Initialize MongoDB connection
async function initMongoDB() {
  if (!mongodb) {
    await mongoClient.connect();
    mongodb = mongoClient.db();
    console.log('✅ MongoDB connected for Product Service');
  }
  return mongodb;
}

// Product Types
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
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  specifications?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  categoryId: string;
  tags?: string[];
  regions?: string[];
  visibleTo?: string[];
}

export interface SearchQuery {
  query?: string;
  categoryId?: string;
  companyId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  region?: string;
  visibleTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'relevance';
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

// MongoDB Product Document Interface
export interface ProductDocument {
  _id?: ObjectId;
  companyId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  category: {
    primary: string;
    secondary?: string;
    tags: string[];
  };
  specifications: Record<string, unknown>;
  pricing: {
    basePrice: number;
    currency: string;
    bulkPricing: Array<{
      minQuantity: number;
      discount: number;
      discountType: 'percentage' | 'fixed';
    }>;
  };
  inventory: {
    available: number;
    reserved: number;
    reorderLevel: number;
    lastUpdated: Date;
  };
  media: {
    images: string[];
    videos: string[];
    documents: string[];
  };
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  visibility: {
    isActive: boolean;
    visibleTo: string[];
    regions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Validation Schemas
const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  basePrice: z.number().positive('Price must be positive'),
  minOrderQty: z.number().int().positive().default(1),
  maxOrderQty: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  lowStockAlert: z.number().int().min(0).default(10),
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  documents: z.array(z.string().url()).default([]),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  specifications: z.record(z.string(), z.unknown()).default({}),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  regions: z.array(z.string()).default(['all']),
  visibleTo: z.array(z.string()).default(['all'])
});

class ProductServiceHybrid {
  private async getDB() {
    return await initMongoDB();
  }

  private async getProductsCollection() {
    const db = await this.getDB();
    return db.collection('products');
  }

  async createProduct(companyId: string, productData: ProductData): Promise<ProductDocument> {
    try {
      // Validate input
      const validatedData = ProductCreateSchema.parse(productData);
      
      // Verify company exists in PostgreSQL
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      
      if (!company) {
        throw new Error('Company not found');
      }

      // Verify category exists in PostgreSQL
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      });
      
      if (!category) {
        throw new Error('Category not found');
      }

      // Create product document for MongoDB
      const productDoc: ProductDocument = {
        companyId,
        name: validatedData.name,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        sku: validatedData.sku,
        barcode: validatedData.barcode,
        
        category: {
          primary: category.name,
          secondary: category.parentId ? 'subcategory' : undefined,
          tags: validatedData.tags || []
        },
        
        specifications: {
          weight: validatedData.weight,
          dimensions: validatedData.dimensions,
          ...validatedData.specifications
        },
        
        pricing: {
          basePrice: validatedData.basePrice,
          currency: 'USD',
          bulkPricing: []
        },
        
        inventory: {
          available: validatedData.stockQuantity,
          reserved: 0,
          reorderLevel: validatedData.lowStockAlert || 10,
          lastUpdated: new Date()
        },
        
        media: {
          images: validatedData.images || [],
          videos: validatedData.videos || [],
          documents: validatedData.documents || []
        },
        
        seo: {
          slug: this.generateSlug(validatedData.name, validatedData.sku),
          metaTitle: validatedData.metaTitle,
          metaDescription: validatedData.metaDescription,
          keywords: validatedData.tags || []
        },
        
        visibility: {
          isActive: true,
          visibleTo: validatedData.visibleTo || ['all'],
          regions: validatedData.regions || ['all']
        },
        
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert into MongoDB
      const products = await this.getProductsCollection();
      const result = await products.insertOne(productDoc);
      
      const createdProduct = await products.findOne({ _id: result.insertedId });
      return createdProduct as ProductDocument;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async searchProducts(query: SearchQuery): Promise<ProductDocument[]> {
    try {
      const products = await this.getProductsCollection();
      
      // Build MongoDB query
      const mongoQuery: Record<string, unknown> = {
        'visibility.isActive': true
      };

      // Company filter
      if (query.companyId) {
        mongoQuery.companyId = query.companyId;
      }

      // Category filter
      if (query.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: query.categoryId }
        });
        if (category) {
          mongoQuery['category.primary'] = category.name;
        }
      }

      // Price range filter
      if (query.minPrice || query.maxPrice) {
        const priceFilter: Record<string, number> = {};
        if (query.minPrice) priceFilter.$gte = query.minPrice;
        if (query.maxPrice) priceFilter.$lte = query.maxPrice;
        mongoQuery['pricing.basePrice'] = priceFilter;
      }

      // Stock filter
      if (query.inStock) {
        mongoQuery['inventory.available'] = { $gt: 0 };
      }

      // Text search
      if (query.query) {
        mongoQuery.$text = { $search: query.query };
      }

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Sort options
      let sortOptions: Record<string, unknown> = { createdAt: -1 };
      if (query.sortBy) {
        switch (query.sortBy) {
          case 'name':
            sortOptions = { name: query.sortOrder === 'desc' ? -1 : 1 };
            break;
          case 'price':
            sortOptions = { 'pricing.basePrice': query.sortOrder === 'desc' ? -1 : 1 };
            break;
          case 'created':
            sortOptions = { createdAt: query.sortOrder === 'desc' ? -1 : 1 };
            break;
          case 'relevance':
            if (query.query) {
              sortOptions = { score: { $meta: 'textScore' } };
            }
            break;
        }
      }

      // Execute query
      const results = await products
        .find(mongoQuery)
        .sort(sortOptions as Record<string, 1 | -1 | { $meta: string }>)
        .skip(skip)
        .limit(limit)
        .toArray();

      return results as ProductDocument[];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    try {
      const products = await this.getProductsCollection();
      const product = await products.findOne({ _id: new ObjectId(id) });
      return product as ProductDocument | null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  async updateInventory(productId: string, quantity: number): Promise<ProductDocument> {
    try {
      const products = await this.getProductsCollection();
      
      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        {
          $set: {
            'inventory.available': quantity,
            'inventory.lastUpdated': new Date(),
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Product not found');
      }

      return result as ProductDocument;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  async calculateBulkPricing(productId: string, quantity: number): Promise<PriceBreakdown> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const basePrice = product.pricing.basePrice;
      let unitPrice = basePrice;
      let discount = undefined;

      // Find applicable bulk pricing
      const applicableBulkPricing = product.pricing.bulkPricing
        .filter(bp => quantity >= bp.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];

      if (applicableBulkPricing) {
        const discountAmount = applicableBulkPricing.discountType === 'percentage'
          ? (basePrice * applicableBulkPricing.discount) / 100
          : applicableBulkPricing.discount;

        unitPrice = basePrice - discountAmount;
        discount = {
          type: applicableBulkPricing.discountType,
          value: applicableBulkPricing.discount,
          amount: discountAmount
        };
      }

      return {
        basePrice,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        discount
      };
    } catch (error) {
      console.error('Error calculating bulk pricing:', error);
      throw error;
    }
  }

  async getRecommendations(): Promise<ProductDocument[]> {
    try {
      const products = await this.getProductsCollection();

      // Simple recommendation: return latest active products
      const recommendations = await products.find({
        'visibility.isActive': true,
        'inventory.available': { $gt: 0 }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

      return recommendations as ProductDocument[];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  private generateSlug(name: string, sku: string): string {
    const nameSlug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `${nameSlug}-${sku.toLowerCase()}`;
  }

  async updateProduct(productId: string, updateData: Partial<ProductData>): Promise<ProductDocument> {
    try {
      const products = await this.getProductsCollection();
      
      const updateDoc: Record<string, unknown> = {
        updatedAt: new Date()
      };

      // Map the update data to MongoDB document structure
      if (updateData.name) updateDoc.name = updateData.name;
      if (updateData.description) updateDoc.description = updateData.description;
      if (updateData.basePrice) updateDoc['pricing.basePrice'] = updateData.basePrice;
      if (updateData.stockQuantity !== undefined) {
        updateDoc['inventory.available'] = updateData.stockQuantity;
        updateDoc['inventory.lastUpdated'] = new Date();
      }

      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Product not found');
      }

      return result as ProductDocument;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const products = await this.getProductsCollection();
      
      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { 
          $set: { 
            'visibility.isActive': false,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return !!result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

const productServiceHybrid = new ProductServiceHybrid();
export default productServiceHybrid;
