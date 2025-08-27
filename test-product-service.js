import ProductService from './src/lib/services/product-service-clean.js';

async function testProductService() {
  console.log('🧪 Testing Hybrid Product Service...\n');

  try {
    // Test 1: Create a test product
    console.log('1. Creating a test product...');
    
    const testProduct = {
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      shortDescription: 'Premium wireless headphones',
      sku: 'PWH-001',
      barcode: '1234567890123',
      basePrice: 299.99,
      minOrderQty: 1,
      maxOrderQty: 100,
      stockQuantity: 50,
      lowStockAlert: 5,
      images: ['https://example.com/headphones.jpg'],
      videos: [],
      documents: [],
      weight: 0.5,
      dimensions: {
        length: 20,
        width: 15,
        height: 8
      },
      specifications: {
        batteryLife: '30 hours',
        wireless: true,
        noiseCancellation: true
      },
      metaTitle: 'Premium Wireless Headphones - Best Audio Quality',
      metaDescription: 'Experience the best audio quality with our premium wireless headphones',
      categoryId: '1', // Electronics category
      tags: ['electronics', 'audio', 'wireless', 'premium'],
      regions: ['US', 'CA'],
      visibleTo: ['all']
    };

    // We'll use a test company ID
    const companyId = 'test-company-id';
    
    const createdProduct = await ProductService.createProduct(companyId, testProduct);
    console.log('✅ Product created successfully:', {
      id: createdProduct._id,
      name: createdProduct.name,
      sku: createdProduct.sku,
      price: createdProduct.pricing.basePrice
    });

    const productId = createdProduct._id?.toString();
    if (!productId) {
      throw new Error('Product ID not found');
    }

    // Test 2: Get product by ID
    console.log('\n2. Getting product by ID...');
    const retrievedProduct = await ProductService.getProductById(productId);
    console.log('✅ Product retrieved:', {
      id: retrievedProduct?._id,
      name: retrievedProduct?.name,
      stock: retrievedProduct?.inventory.available
    });

    // Test 3: Search products
    console.log('\n3. Searching products...');
    const searchResults = await ProductService.searchProducts({
      query: 'wireless',
      page: 1,
      limit: 10
    });
    console.log('✅ Search results:', {
      count: searchResults.length,
      products: searchResults.map(p => ({ name: p.name, sku: p.sku }))
    });

    // Test 4: Calculate bulk pricing
    console.log('\n4. Calculating bulk pricing...');
    const pricing = await ProductService.calculateBulkPricing(productId, 5);
    console.log('✅ Bulk pricing calculated:', {
      quantity: pricing.quantity,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice
    });

    // Test 5: Update inventory
    console.log('\n5. Updating inventory...');
    const updatedProduct = await ProductService.updateInventory(productId, 45);
    console.log('✅ Inventory updated:', {
      newStock: updatedProduct.inventory.available,
      lastUpdated: updatedProduct.inventory.lastUpdated
    });

    // Test 6: Get recommendations
    console.log('\n6. Getting recommendations...');
    const recommendations = await ProductService.getRecommendations();
    console.log('✅ Recommendations:', {
      count: recommendations.length,
      products: recommendations.slice(0, 3).map(p => ({ name: p.name, sku: p.sku }))
    });

    // Test 7: Update product
    console.log('\n7. Updating product...');
    const productUpdate = await ProductService.updateProduct(productId, {
      name: 'Premium Wireless Headphones Pro',
      basePrice: 349.99
    });
    console.log('✅ Product updated:', {
      name: productUpdate.name,
      price: productUpdate.pricing.basePrice
    });

    console.log('\n🎉 All tests passed! Hybrid Product Service is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testProductService().catch(console.error);
