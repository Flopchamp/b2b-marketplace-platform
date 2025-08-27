// Test MongoDB connection and basic operations
import { mongodb, getProductsCollection, createProductIndexes } from '../src/lib/database/mongodb';

async function testMongoDB() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    // Connect to MongoDB
    await mongodb.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test ping
    const isAlive = await mongodb.ping();
    console.log('📡 MongoDB ping result:', isAlive);
    
    // Create indexes
    await createProductIndexes();
    console.log('📇 Product indexes created');
    
    // Test collection access
    const products = getProductsCollection();
    const count = await products.countDocuments();
    console.log('📊 Current product count:', count);
    
    // Test basic insert
    const testProduct = {
      companyId: 'test-company-123',
      name: 'Test Product',
      sku: 'TEST-001',
      category: {
        primary: 'Electronics',
        secondary: 'Smartphones',
        tags: ['mobile', 'communication']
      },
      specifications: {
        weight: 200,
        dimensions: {
          length: 150,
          width: 75,
          height: 8
        }
      },
      pricing: {
        basePrice: 299.99,
        currency: 'USD',
        bulkPricing: []
      },
      inventory: {
        available: 100,
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
        slug: 'test-product-test-001',
        keywords: ['smartphone', 'mobile']
      },
      visibility: {
        isActive: true,
        visibleTo: ['all'],
        regions: ['all']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await products.insertOne(testProduct);
    console.log('✅ Test product inserted with ID:', insertResult.insertedId);
    
    // Test find
    const foundProduct = await products.findOne({ _id: insertResult.insertedId });
    console.log('🔍 Found product:', foundProduct ? 'Success' : 'Failed');
    
    // Clean up test data
    await products.deleteOne({ _id: insertResult.insertedId });
    console.log('🧹 Test product cleaned up');
    
    // Disconnect
    await mongodb.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    console.log('\n🎉 MongoDB test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMongoDB().catch(console.error);
