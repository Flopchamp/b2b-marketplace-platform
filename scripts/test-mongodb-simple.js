const { MongoClient } = require('mongodb');

async function testMongoDB() {
  console.log('🔄 Testing MongoDB connection...');
  
  try {
    // Test connection to local MongoDB
    const uri = 'mongodb://localhost:27017/b2b_marketplace';
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database access
    const db = client.db();
    
    // Test ping
    await db.admin().ping();
    console.log('📡 MongoDB ping successful');
    
    // Test collection access
    const products = db.collection('products');
    const count = await products.countDocuments();
    console.log('📊 Current product count:', count);
    
    // Test insert
    const testDoc = {
      name: 'Test Product',
      sku: 'TEST-001',
      createdAt: new Date()
    };
    
    const result = await products.insertOne(testDoc);
    console.log('✅ Test document inserted with ID:', result.insertedId);
    
    // Test find
    const found = await products.findOne({ _id: result.insertedId });
    console.log('🔍 Found document:', found ? 'Success' : 'Failed');
    
    // Clean up
    await products.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
    
    console.log('\n🎉 MongoDB connection test successful!');
    console.log('✅ Your MongoDB instance is working correctly');
    console.log('📋 Ready to implement hybrid PostgreSQL + MongoDB architecture');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 MongoDB appears to be not running. Please:');
      console.log('1. Start MongoDB service');
      console.log('2. Or start MongoDB manually: mongod');
      console.log('3. Make sure MongoDB is running on localhost:27017');
    }
  }
}

testMongoDB();
