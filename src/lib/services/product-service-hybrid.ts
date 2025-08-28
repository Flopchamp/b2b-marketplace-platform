import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { mongodb, getProductsCollection, createProductIndexes } from '../database/mongodb';
import { 
  ProductDocument, 
  validateProductDocument
} from '../types/mongodb-types';

const prisma = new PrismaClient();

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

const SearchQuerySchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  companyId: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  region: z.string().optional(),
  visibleTo: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'price', 'created', 'popularity', 'relevance']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

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

class ProductService {
  constructor() {
    this.initializeDatabases();
  }

  private async initializeDatabases() {
    try {
      await mongodb.connect();
      await createProductIndexes();
      console.log('✅ Product Service initialized with hybrid databases');
    } catch (error) {
      console.error('❌ Failed to initialize Product Service:', error);
    }
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

      // Validate the document
      const validationErrors = validateProductDocument(productDoc);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Insert into MongoDB
      const products = getProductsCollection();
      const result = await products.insertOne(productDoc);
      
      const createdProduct = await products.findOne<ProductDocument>({ _id: result.insertedId });
      if (!createdProduct) {
        throw new Error('Failed to retrieve created product');
      }

      return createdProduct as ProductDocument;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async searchProducts(query: SearchQuery): Promise<ProductDocument[]> {
    try {
      const validatedQuery = SearchQuerySchema.parse(query);
      const products = getProductsCollection();
      
      // Build MongoDB query
      const mongoQuery: Record<string, unknown> = {
        'visibility.isActive': true
      };

      // Company filter
      if (validatedQuery.companyId) {
        mongoQuery.companyId = validatedQuery.companyId;
      }

      // Category filter
      if (validatedQuery.categoryId) {
        // Get category name from PostgreSQL
        const category = await prisma.category.findUnique({
          where: { id: validatedQuery.categoryId }
        });
        if (category) {
          mongoQuery['category.primary'] = category.name;
        }
      }

      // Price range filter
      if (validatedQuery.minPrice || validatedQuery.maxPrice) {
        const priceFilter: Record<string, number> = {};
        if (validatedQuery.minPrice) {
          priceFilter.$gte = validatedQuery.minPrice;
        }
        if (validatedQuery.maxPrice) {
          priceFilter.$lte = validatedQuery.maxPrice;
        }
        mongoQuery['pricing.basePrice'] = priceFilter;
      }

      // Stock filter
      if (validatedQuery.inStock) {
        mongoQuery['inventory.available'] = { $gt: 0 };
      }

      // Region filter
      if (validatedQuery.region) {
        mongoQuery['visibility.regions'] = { $in: [validatedQuery.region, 'all'] };
      }

      // Visibility filter
      if (validatedQuery.visibleTo) {
        mongoQuery['visibility.visibleTo'] = { $in: [validatedQuery.visibleTo, 'all'] };
      }

      // Tags filter
      if (validatedQuery.tags && validatedQuery.tags.length > 0) {
        mongoQuery['category.tags'] = { $in: validatedQuery.tags };
      }

      // Text search
      if (validatedQuery.query) {
        mongoQuery.$text = { $search: validatedQuery.query };
      }

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      switch (validatedQuery.sortBy) {
        case 'name':
          sortOptions.name = validatedQuery.sortOrder === 'asc' ? 1 : -1;
          break;
        case 'price':
          sortOptions['pricing.basePrice'] = validatedQuery.sortOrder === 'asc' ? 1 : -1;
          break;
        case 'created':
          sortOptions.createdAt = validatedQuery.sortOrder === 'asc' ? 1 : -1;
          break;
        case 'relevance':
          if (validatedQuery.query) {
            // For text search, use textScore
            const cursor = products.find(mongoQuery, { score: { $meta: 'textScore' } })
              .sort({ score: { $meta: 'textScore' } })
              .skip(skip)
              .limit(validatedQuery.limit);
            return await cursor.toArray() as ProductDocument[];
          } else {
            sortOptions.createdAt = -1;
          }
          break;
        default:
          sortOptions.createdAt = -1;
      }

      // Calculate pagination
      const skip = (validatedQuery.page - 1) * validatedQuery.limit;

      // Execute query
      const cursor = products.find(mongoQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(validatedQuery.limit);

      const results = await cursor.toArray();
      return results;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductDocument | null> {
    try {
      const products = getProductsCollection();
      const product = await products.findOne({ _id: new ObjectId(id) });
      return product;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  async updateInventory(productId: string, quantity: number): Promise<ProductDocument> {
    try {
      const products = getProductsCollection();
      
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

      return result;
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

  async getRecommendations(retailerId: string): Promise<ProductDocument[]> {
    try {
      // Get retailer's order history from PostgreSQL
      const retailer = await prisma.retailer.findUnique({
        where: { id: retailerId },
        include: {
          orders: {
            include: {
              items: true
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!retailer) {
        throw new Error('Retailer not found');
      }

      // Extract product IDs from order history
      const purchasedProductIds = retailer.orders
        .flatMap(order => order.items.map(item => item.productId))
        .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

      const products = getProductsCollection();

      // If no purchase history, return trending products
      if (purchasedProductIds.length === 0) {
        return await products.find({
          'visibility.isActive': true,
          'inventory.available': { $gt: 0 }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      }

      // Get categories of purchased products
      const purchasedProducts = await products.find({
        _id: { $in: purchasedProductIds.map(id => new ObjectId(id)) }
      }).toArray();

      const categories = [...new Set(purchasedProducts.map(p => p.category.primary))];

      // Find similar products in same categories, excluding already purchased
      const recommendations = await products.find({
        'visibility.isActive': true,
        'inventory.available': { $gt: 0 },
        'category.primary': { $in: categories },
        _id: { $nin: purchasedProductIds.map(id => new ObjectId(id)) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

      return recommendations;
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
      const products = getProductsCollection();
      
      const updateDoc: any = {
        updatedAt: new Date()
      };

      // Map the update data to MongoDB document structure
      if (updateData.name) updateDoc.name = updateData.name;
      if (updateData.description) updateDoc.description = updateData.description;
      if (updateData.shortDescription) updateDoc.shortDescription = updateData.shortDescription;
      if (updateData.sku) updateDoc.sku = updateData.sku;
      if (updateData.barcode) updateDoc.barcode = updateData.barcode;
      if (updateData.basePrice) updateDoc['pricing.basePrice'] = updateData.basePrice;
      if (updateData.stockQuantity !== undefined) {
        updateDoc['inventory.available'] = updateData.stockQuantity;
        updateDoc['inventory.lastUpdated'] = new Date();
      }
      if (updateData.images) updateDoc['media.images'] = updateData.images;
      if (updateData.videos) updateDoc['media.videos'] = updateData.videos;
      if (updateData.documents) updateDoc['media.documents'] = updateData.documents;
      if (updateData.specifications) updateDoc.specifications = updateData.specifications;
      if (updateData.metaTitle) updateDoc['seo.metaTitle'] = updateData.metaTitle;
      if (updateData.metaDescription) updateDoc['seo.metaDescription'] = updateData.metaDescription;

      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Product not found');
      }

      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const products = getProductsCollection();
      
      // Soft delete by setting isActive to false
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

export default ProductService;
