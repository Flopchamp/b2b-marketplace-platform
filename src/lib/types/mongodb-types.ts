import { Document, ObjectId } from 'mongodb';

// MongoDB Product Schema interfaces
export interface ProductDocument extends Document {
  _id?: ObjectId;
  companyId: string; // References PostgreSQL companies.id
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
  
  specifications: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    // Dynamic specifications based on category
    [key: string]: unknown;
  };
  
  pricing: {
    basePrice: number;
    currency: string;
    bulkPricing: Array<{
      minQuantity: number;
      discount: number; // percentage or fixed amount
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
    images: string[]; // URLs to image files
    videos: string[];
    documents: string[]; // Spec sheets, certificates
  };
  
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  
  visibility: {
    isActive: boolean;
    visibleTo: string[]; // Specific retailer IDs or 'all'
    regions: string[]; // Geographic limitations
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument extends Document {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // For hierarchical categories
  level: number; // 0 for root, 1 for sub-category, etc.
  isActive: boolean;
  image?: string;
  order: number; // For sorting
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryLogDocument extends Document {
  _id?: ObjectId;
  productId: string; // MongoDB ObjectId as string
  companyId: string; // PostgreSQL reference
  action: 'add' | 'remove' | 'reserve' | 'release' | 'adjust';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  userId?: string; // Who made the change
  orderId?: string; // If related to an order
  createdAt: Date;
}

// Search and analytics interfaces
export interface ProductSearchQuery {
  query?: string;
  categoryId?: string;
  companyId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  region?: string;
  visibleTo?: string; // retailer ID
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'created' | 'popularity' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductAnalytics extends Document {
  _id?: ObjectId;
  productId: string;
  companyId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  
  metrics: {
    views: number;
    searches: number;
    orders: number;
    revenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  
  topRetailers: Array<{
    retailerId: string;
    orders: number;
    revenue: number;
  }>;
  
  topRegions: Array<{
    region: string;
    orders: number;
    revenue: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Validation helpers
export function validateProductDocument(product: Partial<ProductDocument>): string[] {
  const errors: string[] = [];
  
  if (!product.name) errors.push('Name is required');
  if (!product.companyId) errors.push('Company ID is required');
  if (!product.sku) errors.push('SKU is required');
  if (!product.pricing?.basePrice || product.pricing.basePrice <= 0) {
    errors.push('Valid base price is required');
  }
  if (!product.category?.primary) errors.push('Primary category is required');
  if (!product.inventory?.available || product.inventory.available < 0) {
    errors.push('Valid inventory quantity is required');
  }
  
  return errors;
}

// Default values
export function createDefaultProductDocument(companyId: string): Partial<ProductDocument> {
  return {
    companyId,
    category: {
      primary: '',
      secondary: '',
      tags: []
    },
    specifications: {},
    pricing: {
      basePrice: 0,
      currency: 'USD',
      bulkPricing: []
    },
    inventory: {
      available: 0,
      reserved: 0,
      reorderLevel: 10,
      lastUpdated: new Date()
    },
    media: {
      images: [],
      videos: [],
      documents: []
    },
    seo: {
      slug: '',
      keywords: []
    },
    visibility: {
      isActive: true,
      visibleTo: ['all'],
      regions: ['all']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
