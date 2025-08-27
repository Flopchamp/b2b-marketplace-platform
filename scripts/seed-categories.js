const { PrismaClient } = require('@prisma/client');

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
];

async function seedCategories() {
  try {
    console.log('Seeding categories...');

    for (const category of categories) {
      console.log(`Creating category: ${category.name}`);
      
      const slug = category.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug: slug }
      });

      if (existingCategory) {
        console.log(`Category ${category.name} already exists, skipping...`);
        continue;
      }

      // Create parent category
      const parentCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: slug,
          description: category.description,
          level: 0,
          order: categories.indexOf(category),
        }
      });

      console.log(`Created parent category: ${parentCategory.name}`);

      // Create child categories
      if (category.children) {
        for (const child of category.children) {
          console.log(`Creating child category: ${child.name}`);
          
          const childSlug = child.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          
          const childCategory = await prisma.category.create({
            data: {
              name: child.name,
              slug: childSlug,
              description: child.description,
              parentId: parentCategory.id,
              level: 1,
              order: category.children.indexOf(child),
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
