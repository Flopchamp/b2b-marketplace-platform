import { MongoClient, Db, Collection, Document } from 'mongodb';

class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017/b2b_marketplace';
      
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db();
      
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  public getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  public async ping(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const mongodb = MongoDB.getInstance();

// Product-specific collections
export const getProductsCollection = () => mongodb.getCollection('products');
export const getCategoriesCollection = () => mongodb.getCollection('categories');
export const getInventoryCollection = () => mongodb.getCollection('inventory');

// Indexes for optimal performance
export async function createProductIndexes() {
  const products = getProductsCollection();
  
  // Text search index
  await products.createIndex({
    name: 'text',
    description: 'text',
    'category.tags': 'text'
  }, { name: 'product_text_search' });

  // Company and category index
  await products.createIndex(
    { companyId: 1, 'category.primary': 1 },
    { name: 'company_category_index' }
  );

  // Price range index
  await products.createIndex(
    { 'pricing.basePrice': 1 },
    { name: 'price_range_index' }
  );

  // Inventory status index
  await products.createIndex(
    { 'inventory.available': 1, 'visibility.isActive': 1 },
    { name: 'inventory_status_index' }
  );

  // Compound index for common queries
  await products.createIndex(
    { 
      'visibility.isActive': 1,
      'category.primary': 1,
      'pricing.basePrice': 1,
      createdAt: -1
    },
    { name: 'search_optimization_index' }
  );

  console.log('✅ Product indexes created successfully');
}
