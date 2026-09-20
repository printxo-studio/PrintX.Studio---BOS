const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRODUCTS = [
  {
    sku: 'PRX-AERO-01',
    name: 'Voron Aerodynamic Stealthburner Cowl',
    category: 'Functional & Engineering',
    productType: 'STANDARD',
    slug: 'voron-aerodynamic-stealthburner-cowl',
    description: 'High-temperature ASA/ABS aerodynamic toolhead cowl optimized for CoreXY 3D printers with high-flow dual 5015 part cooling duct geometry.',
    sellingPrice: 1299,
    productionCost: 350,
    stockQuantity: 45,
    isPublished: true,
    materialName: 'ABS / ASA',
    dimensions: '110 x 85 x 92 mm',
    colorOptions: ['Matte Black', 'Studio Crimson', 'Signal White'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800', altText: 'Voron Stealthburner Front' }
    ],
    standardPrintTimeHours: 5.5,
    standardFilamentGrams: 140,
  },
  {
    sku: 'PRX-ROBO-02',
    name: 'Cycloidal Gearbox Precision Drive Housing',
    category: 'Mechanical Assemblies',
    productType: 'STANDARD',
    slug: 'cycloidal-gearbox-precision-drive-housing',
    description: 'Zero-backlash 11:1 reduction cycloidal gearbox housing engineered for robotic arm joints and high-torque rotary positioners.',
    sellingPrice: 2499,
    productionCost: 650,
    stockQuantity: 28,
    isPublished: true,
    materialName: 'Carbon Fiber Nylon (PA-CF)',
    dimensions: '95 x 95 x 65 mm',
    colorOptions: ['Anthracite Black'],
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800', altText: 'Gearbox Housing Exploded View' }
    ],
    standardPrintTimeHours: 8.0,
    standardFilamentGrams: 220,
  },
  {
    sku: 'PRX-MECH-03',
    name: 'Dual Linear Rail CoreXY Carriage Assembly',
    category: 'Functional & Engineering',
    productType: 'STANDARD',
    slug: 'dual-linear-rail-corexy-carriage-assembly',
    description: 'Lightweight structural MGN12H linear guide carriage mount with integrated belt tensioners for high-speed 500mm/s acceleration.',
    sellingPrice: 1850,
    productionCost: 450,
    stockQuantity: 35,
    isPublished: true,
    materialName: 'PETG-CF',
    dimensions: '140 x 70 x 45 mm',
    colorOptions: ['Studio Crimson', 'Stealth Black'],
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800', altText: 'CoreXY Carriage Mount' }
    ],
    standardPrintTimeHours: 6.0,
    standardFilamentGrams: 160,
  },
  {
    sku: 'PRX-LIFT-04',
    name: 'Heavy-Duty Filament Spool Drybox Carousel',
    category: 'Studio Equipment',
    productType: 'STANDARD',
    slug: 'heavy-duty-filament-spool-drybox-carousel',
    description: 'Ball-bearing supported 3-axis smooth unrolling carousel designed for 1kg and 3kg hygroscopic filament spools in continuous print farms.',
    sellingPrice: 1450,
    productionCost: 380,
    stockQuantity: 60,
    isPublished: true,
    materialName: 'PLA+ Heavy Duty',
    dimensions: '220 x 220 x 110 mm',
    colorOptions: ['Matte Black', 'Silver Grey', 'Signal Orange'],
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800', altText: 'Spool Carousel' }
    ],
    standardPrintTimeHours: 11.0,
    standardFilamentGrams: 320,
  },
  {
    sku: 'PRX-DRON-05',
    name: 'Carbon Fiber FPV Quadcopter 5-Inch Unibody',
    category: 'Aerospace & Drones',
    productType: 'STANDARD',
    slug: 'carbon-fiber-fpv-quadcopter-5-inch-unibody',
    description: 'High-impact TPU and continuous carbon-filled co-polymer aerodynamic canopy and arm brace for freestyle 5-inch racing drones.',
    sellingPrice: 2199,
    productionCost: 550,
    stockQuantity: 20,
    isPublished: true,
    materialName: 'Carbon Fiber Co-Polymer',
    dimensions: '210 x 210 x 40 mm',
    colorOptions: ['Stealth Black', 'Crimson Flare'],
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800', altText: 'Quadcopter Frame' }
    ],
    standardPrintTimeHours: 7.5,
    standardFilamentGrams: 180,
  },
  {
    sku: 'PRX-DESK-06',
    name: 'Parametric Hexagonal Planter Hub & Hydro Basin',
    category: 'Aesthetic & Architectural',
    productType: 'STANDARD',
    slug: 'parametric-hexagonal-planter-hub',
    description: 'Mathematically generated Voronoi lattice self-watering succulent planter with concealed overflow reservoir and magnetic dock.',
    sellingPrice: 899,
    productionCost: 210,
    stockQuantity: 50,
    isPublished: true,
    materialName: 'Matte PLA / Recycled Terrazzo',
    dimensions: '130 x 130 x 115 mm',
    colorOptions: ['Slate Grey', 'Bone White', 'Terracotta Red'],
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800', altText: 'Hexagonal Planter' }
    ],
    standardPrintTimeHours: 9.0,
    standardFilamentGrams: 260,
  }
];

async function main() {
  console.log('Seeding published products to PostgreSQL...');
  for (const item of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { sku: item.sku } });
    if (existing) {
      await prisma.product.update({
        where: { sku: item.sku },
        data: {
          name: item.name,
          category: item.category,
          slug: item.slug,
          description: item.description,
          sellingPrice: item.sellingPrice,
          productionCost: item.productionCost,
          stockQuantity: item.stockQuantity,
          isPublished: item.isPublished,
          materialName: item.materialName,
          dimensions: item.dimensions,
          colorOptions: item.colorOptions,
          imageUrl: item.imageUrl,
          images: item.images,
        }
      });
      console.log(`Updated product: ${item.sku} - ${item.name}`);
    } else {
      await prisma.product.create({
        data: {
          sku: item.sku,
          name: item.name,
          category: item.category,
          productType: item.productType,
          slug: item.slug,
          description: item.description,
          sellingPrice: item.sellingPrice,
          productionCost: item.productionCost,
          estimatedMargin: Math.round(((item.sellingPrice - item.productionCost) / item.sellingPrice) * 1000) / 10,
          stockQuantity: item.stockQuantity,
          isPublished: item.isPublished,
          materialName: item.materialName,
          dimensions: item.dimensions,
          colorOptions: item.colorOptions,
          imageUrl: item.imageUrl,
          images: item.images,
          standardPrintTimeHours: item.standardPrintTimeHours,
          standardFilamentGrams: item.standardFilamentGrams,
        }
      });
      console.log(`Created product: ${item.sku} - ${item.name}`);
    }
  }

  // Also seed initial coupons
  const coupons = [
    { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderValue: 500, maxDiscount: 500 },
    { code: 'PRINTXO50', type: 'FIXED_AMOUNT', value: 200, minOrderValue: 1500 }
  ];
  for (const c of coupons) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Coupon" ("id", "code", "type", "value", "minOrderValue", "maxDiscount", "timesUsed", "validFrom", "isActive")
      VALUES ('cpn-${c.code.toLowerCase()}', '${c.code}', '${c.type}', ${c.value}, ${c.minOrderValue}, ${c.maxDiscount || 'NULL'}, 0, NOW(), true)
      ON CONFLICT ("code") DO NOTHING;
    `);
  }

  console.log('✓ Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
