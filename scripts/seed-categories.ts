import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and components',
    icon: '📱',
    children: [
      {
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        icon: '📱',
      },
      {
        name: 'Computers',
        description: 'Laptops, desktops, and components',
        icon: '💻',
      },
      {
        name: 'Audio & Video',
        description: 'Sound systems, headphones, cameras',
        icon: '🎧',
      },
    ]
  },
  {
    name: 'Fashion & Apparel',
    description: 'Clothing, shoes, and accessories',
    icon: '👔',
    children: [
      {
        name: 'Men\'s Clothing',
        description: 'Clothing for men',
        icon: '👔',
      },
      {
        name: 'Women\'s Clothing',
        description: 'Clothing for women',
        icon: '👗',
      },
      {
        name: 'Shoes',
        description: 'Footwear for all',
        icon: '👞',
      },
    ]
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    icon: '🏠',
    children: [
      {
        name: 'Furniture',
        description: 'Home and office furniture',
        icon: '🪑',
      },
      {
        name: 'Garden Tools',
        description: 'Tools and equipment for gardening',
        icon: '🌱',
      },
      {
        name: 'Kitchen Appliances',
        description: 'Appliances for the kitchen',
        icon: '🍳',
      },
    ]
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    icon: '⚽',
    children: [
      {
        name: 'Fitness Equipment',
        description: 'Exercise and fitness gear',
        icon: '🏋️',
      },
      {
        name: 'Outdoor Gear',
        description: 'Camping and hiking equipment',
        icon: '🏕️',
      },
      {
        name: 'Team Sports',
        description: 'Equipment for team sports',
        icon: '⚽',
      },
    ]
  },
  {
    name: 'Beauty & Health',
    description: 'Health and beauty products',
    icon: '💄',
    children: [
      {
        name: 'Skincare',
        description: 'Skincare products and treatments',
        icon: '🧴',
      },
      {
        name: 'Cosmetics',
        description: 'Makeup and beauty products',
        icon: '💄',
      },
      {
        name: 'Health Supplements',
        description: 'Vitamins and supplements',
        icon: '💊',
      },
    ]
  },
  {
    name: 'Automotive',
    description: 'Car parts and accessories',
    icon: '🚗',
    children: [
      {
        name: 'Car Parts',
        description: 'Replacement parts for vehicles',
        icon: '🔧',
      },
      {
        name: 'Accessories',
        description: 'Car accessories and add-ons',
        icon: '🚗',
      },
      {
        name: 'Tools',
        description: 'Automotive tools and equipment',
        icon: '🛠️',
      },
    ]
  },
];

async function seedCategories() {
  try {
    console.log('Seeding categories...');

    for (const category of categories) {
      console.log(`Creating category: ${category.name}`);
      
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name }
      });

      if (existingCategory) {
        console.log(`Category ${category.name} already exists, skipping...`);
        continue;
      }

      // Create parent category
      const parentCategory = await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          icon: category.icon,
        }
      });

      console.log(`Created parent category: ${parentCategory.name}`);

      // Create child categories
      if (category.children) {
        for (const child of category.children) {
          console.log(`Creating child category: ${child.name}`);
          
          const childCategory = await prisma.category.create({
            data: {
              name: child.name,
              description: child.description,
              icon: child.icon,
              parentId: parentCategory.id,
            }
          });

          console.log(`Created child category: ${childCategory.name}`);
        }
      }
    }

    console.log('Categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

async function main() {
  await seedCategories();
  await prisma.$disconnect();
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedCategories;
