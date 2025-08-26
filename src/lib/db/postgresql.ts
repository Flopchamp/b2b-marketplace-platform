import { Pool, PoolClient, QueryResult } from 'pg';

// PostgreSQL connection for user management, orders, and transactional data
class PostgreSQLClient {
  private static instance: PostgreSQLClient;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public static getInstance(): PostgreSQLClient {
    if (!PostgreSQLClient.instance) {
      PostgreSQLClient.instance = new PostgreSQLClient();
    }
    return PostgreSQLClient.instance;
  }

  public async query(text: string, params?: unknown[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const postgresClient = PostgreSQLClient.getInstance();

// Database initialization and migrations
export async function initializeDatabase() {
  try {
    // Create enums
    await postgresClient.query(`
      DO $$ BEGIN
        CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await postgresClient.query(`
      DO $$ BEGIN
        CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await postgresClient.query(`
      DO $$ BEGIN
        CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create companies table
    await postgresClient.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        business_registration VARCHAR(100),
        website VARCHAR(255),
        address JSONB,
        verification_status verification_status_enum DEFAULT 'pending',
        verification_documents JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create retailers table
    await postgresClient.query(`
      CREATE TABLE IF NOT EXISTS retailers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address JSONB,
        kyc_status kyc_status_enum DEFAULT 'pending',
        kyc_documents JSONB DEFAULT '[]',
        credit_score INTEGER DEFAULT 0,
        credit_limit DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create orders table
    await postgresClient.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        retailer_id UUID REFERENCES retailers(id),
        company_id UUID REFERENCES companies(id),
        status order_status_enum DEFAULT 'pending',
        total_amount DECIMAL(12,2),
        currency VARCHAR(3) DEFAULT 'USD',
        delivery_address JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create order_items table
    await postgresClient.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL, -- MongoDB reference
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(12,2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await postgresClient.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_retailer_status 
      ON orders(retailer_id, status) WHERE status != 'delivered';
    `);

    await postgresClient.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_company_date 
      ON orders(company_id, created_at DESC);
    `);

    await postgresClient.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
      ON order_items(order_id);
    `);

    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error);
    throw error;
  }
}
