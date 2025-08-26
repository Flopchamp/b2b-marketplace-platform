import Redis from 'redis';

// Redis client for caching and session management
class RedisClient {
  private static instance: RedisClient;
  private client: Redis.RedisClientType;
  private isConnected = false;

  private constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis successfully');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Disconnected from Redis');
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Basic cache operations
  public async get(key: string): Promise<string | null> {
    await this.connect();
    return this.client.get(key);
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.connect();
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async del(key: string): Promise<number> {
    await this.connect();
    return this.client.del(key);
  }

  public async exists(key: string): Promise<number> {
    await this.connect();
    return this.client.exists(key);
  }

  // JSON operations for complex objects
  public async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  public async setJSON<T>(key: string, value: T, ttl?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.set(key, jsonString, ttl);
  }

  // Hash operations for user sessions
  public async hGet(key: string, field: string): Promise<string | null> {
    await this.connect();
    return this.client.hGet(key, field);
  }

  public async hSet(key: string, field: string, value: string): Promise<number> {
    await this.connect();
    return this.client.hSet(key, field, value);
  }

  public async hGetAll(key: string): Promise<Record<string, string>> {
    await this.connect();
    return this.client.hGetAll(key);
  }

  public async hDel(key: string, field: string): Promise<number> {
    await this.connect();
    return this.client.hDel(key, field);
  }

  // Set operations for collections
  public async sAdd(key: string, ...members: string[]): Promise<number> {
    await this.connect();
    return this.client.sAdd(key, members);
  }

  public async sMembers(key: string): Promise<string[]> {
    await this.connect();
    return this.client.sMembers(key);
  }

  public async sIsMember(key: string, member: string): Promise<boolean> {
    await this.connect();
    const result = await this.client.sIsMember(key, member);
    return Boolean(result);
  }

  // Pub/Sub for real-time notifications
  public async publish(channel: string, message: string): Promise<number> {
    await this.connect();
    return this.client.publish(channel, message);
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }

  // Utility methods
  public async healthCheck(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  public async flushAll(): Promise<void> {
    await this.connect();
    await this.client.flushAll();
  }
}

export const redisClient = RedisClient.getInstance();

// Cache key constants
export const CACHE_KEYS = {
  USER_SESSION: (userId: string) => `session:user:${userId}`,
  PRODUCT_DETAILS: (productId: string) => `product:${productId}`,
  INVENTORY_COUNT: (productId: string) => `inventory:${productId}`,
  SEARCH_RESULTS: (queryHash: string, page: number) => `search:${queryHash}:${page}`,
  USER_PERMISSIONS: (userId: string) => `permissions:user:${userId}`,
  PRICING_CALCULATIONS: (productId: string, quantity: number) => `pricing:${productId}:${quantity}`,
  RECOMMENDATIONS: (userId: string) => `recommendations:user:${userId}`,
  ORDER_STATUS: (orderId: string) => `order:status:${orderId}`,
  COMPANY_PRODUCTS: (companyId: string) => `company:products:${companyId}`,
  RETAILER_ORDERS: (retailerId: string) => `retailer:orders:${retailerId}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  PRODUCT_DETAILS: 60 * 60, // 1 hour
  INVENTORY: 5 * 60, // 5 minutes
  SEARCH_RESULTS: 30 * 60, // 30 minutes
  PRICING: 15 * 60, // 15 minutes
  RECOMMENDATIONS: 2 * 60 * 60, // 2 hours
  ORDER_STATUS: 10 * 60, // 10 minutes
  USER_PERMISSIONS: 60 * 60, // 1 hour
} as const;
