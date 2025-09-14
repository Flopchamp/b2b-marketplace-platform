import { MongoClient, Db, Collection, Document } from 'mongodb';

// MongoDB connection for product catalog and flexible data
class MongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient;
  private db: Db | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
  }

  public static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  public async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.db) {
      return;
    }

    // If already connecting, wait for the existing connection
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start connecting
    this.isConnecting = true;
    this.connectionPromise = this._connect();
    
    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async _connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DATABASE || 'b2b_marketplace');
      console.log('Connected to MongoDB successfully');
      
      // Initialize indexes
      await this.initializeIndexes();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.db = null;
      throw error;
    }
  }

  public async getDb(): Promise<Db> {
    if (!this.db) {
      await this.connect();
    }
    
    if (!this.db) {
      throw new Error('MongoDB connection failed');
    }
    
    return this.db;
  }

  public async getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(name);
  }

  private async initializeIndexes(): Promise<void> {
    try {
      const productsCollection = await this.getCollection('products');
      
      // Drop existing text index if it conflicts
      try {
        await productsCollection.dropIndex('name_text_description_text_seo.keywords_text');
      } catch {
        // Index might not exist, continue
      }
      
      // Text search index for product search
      await productsCollection.createIndex({
        name: 'text',
        description: 'text',
        'category.tags': 'text'
      }, {
        weights: {
          name: 10,
          description: 5,
          'category.tags': 1
        }
      });

      // Compound index for company and category filtering
      await productsCollection.createIndex({
        companyId: 1,
        'category.primary': 1,
        'visibility.isActive': 1
      });

      // Price range index
      await productsCollection.createIndex({
        'pricing.basePrice': 1
      });

      // Inventory index
      await productsCollection.createIndex({
        'inventory.available': 1,
        'visibility.isActive': 1
      });

      // Geographic index for region-based filtering
      await productsCollection.createIndex({
        'visibility.regions': 1
      });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.warn('Failed to create MongoDB indexes (continuing anyway):', error);
      // Don't throw error, continue with app startup
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}

export const mongoClient = MongoDBClient.getInstance();

// Product interface for TypeScript
export interface Product {
  _id?: string;
  companyId: string;
  name: string;
  description: string;
  category: {
    primary: string;
    secondary: string;
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
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  visibility: {
    isActive: boolean;
    visibleTo: string[]; // 'all' or specific retailer IDs
    regions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Initialize MongoDB on module load
if (process.env.NODE_ENV !== 'test') {
  mongoClient.connect().catch(console.error);
}
