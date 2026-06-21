// Seed script: Insert sample Korean skincare products into Cozy Nest database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    id: "oat-cream",
    nameEn: "Oat Cream Moisturizer",
    nameZh: "燕麥保濕面霜",
    imageUrl: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=800&fit=crop",
    descriptionEn: "Deeply nourishing oat-based cream that soothes sensitive skin. Enriched with beta-glucan and ceramides to strengthen the skin barrier and lock in moisture for 24 hours.",
    descriptionZh: "深層滋養的燕麥面霜，舒緩敏感肌膚。富含β-葡聚醣和神經酰胺，強化肌膚屏障，24小時鎖水保濕。",
    category: "Moisturizer",
    categoryZh: "面霜",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 50,
    price: 380,
    variants: [
      { weight: "50ml", weightGrams: 50, priceHkd: 380, stockQuantity: 30, isDefault: true, sortOrder: 0 },
      { weight: "100ml", weightGrams: 100, priceHkd: 620, stockQuantity: 20, isDefault: false, sortOrder: 1 },
    ]
  },
  {
    id: "cica-serum",
    nameEn: "Cica Calming Serum",
    nameZh: "積雪草舒緩精華",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=800&fit=crop",
    descriptionEn: "Lightweight calming serum with Centella Asiatica extract. Reduces redness and irritation while strengthening sensitive skin. Perfect for acne-prone and reactive skin types.",
    descriptionZh: "輕盈的積雪草舒緩精華，減少泛紅和刺激，同時強化敏感肌膚。適合痘痘肌和易敏肌膚。",
    category: "Serum",
    categoryZh: "精華",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 40,
    price: 420,
    variants: [
      { weight: "30ml", weightGrams: 30, priceHkd: 420, stockQuantity: 25, isDefault: true, sortOrder: 0 },
      { weight: "60ml", weightGrams: 60, priceHkd: 680, stockQuantity: 15, isDefault: false, sortOrder: 1 },
    ]
  },
  {
    id: "ginseng-toner",
    nameEn: "Ginseng Hydrating Toner",
    nameZh: "人參保濕爽膚水",
    imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4ee8e3b?w=600&h=800&fit=crop",
    descriptionEn: "Fermented red ginseng toner that deeply hydrates and revitalizes dull skin. Rich in antioxidants and amino acids, it preps skin for better absorption of subsequent products.",
    descriptionZh: "發酵紅參爽膚水，深層補水，喚醒暗沉肌膚。富含抗氧化物和氨基酸，為後續護膚品吸收做好準備。",
    category: "Toner",
    categoryZh: "爽膚水",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 60,
    price: 320,
    variants: [
      { weight: "150ml", weightGrams: 150, priceHkd: 320, stockQuantity: 35, isDefault: true, sortOrder: 0 },
      { weight: "300ml", weightGrams: 300, priceHkd: 520, stockQuantity: 25, isDefault: false, sortOrder: 1 },
    ]
  },
  {
    id: "snail-essence",
    nameEn: "Snail Mucin Repair Essence",
    nameZh: "蝸牛粘液修復精華",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=800&fit=crop",
    descriptionEn: "Concentrated snail mucin essence that repairs damaged skin and improves elasticity. Contains 96% snail secretion filtrate for maximum regeneration and scar healing.",
    descriptionZh: "濃縮蝸牛粘液精華，修復受損肌膚，提升彈性。含96%蝸牛分泌濾液，促進再生和疤痕修復。",
    category: "Essence",
    categoryZh: "精華液",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 35,
    price: 480,
    variants: [
      { weight: "30ml", weightGrams: 30, priceHkd: 480, stockQuantity: 20, isDefault: true, sortOrder: 0 },
      { weight: "80ml", weightGrams: 80, priceHkd: 780, stockQuantity: 15, isDefault: false, sortOrder: 1 },
    ]
  },
  {
    id: "green-tea-mask",
    nameEn: "Green Tea Purifying Mask",
    nameZh: "綠茶淨化面膜",
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=800&fit=crop",
    descriptionEn: "Jeju green tea clay mask that deeply cleanses pores and removes excess sebum. Infused with matcha powder and tea tree oil for a refreshing, purifying experience.",
    descriptionZh: "濟州綠茶泥膜，深層清潔毛孔，去除多餘油脂。注入抹茶粉和茶樹油，帶來清爽淨化體驗。",
    category: "Mask",
    categoryZh: "面膜",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 80,
    price: 250,
    variants: [
      { weight: "100g", weightGrams: 100, priceHkd: 250, stockQuantity: 50, isDefault: true, sortOrder: 0 },
      { weight: "200g", weightGrams: 200, priceHkd: 420, stockQuantity: 30, isDefault: false, sortOrder: 1 },
    ]
  },
  {
    id: "propolis-ampoule",
    nameEn: "Propolis Glow Ampoule",
    nameZh: "蜂膠光彩安瓶",
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=800&fit=crop",
    descriptionEn: "High-concentration propolis ampoule for instant radiance. Contains 83% propolis extract and niacinamide to brighten skin tone and fade dark spots.",
    descriptionZh: "高濃度蜂膠安瓶，瞬間提亮光澤。含83%蜂膠提取物和煙酰胺，均勻膚色，淡化暗斑。",
    category: "Ampoule",
    categoryZh: "安瓶",
    origin: "Korea",
    originZh: "韓國",
    stockQuantity: 30,
    price: 550,
    variants: [
      { weight: "15ml", weightGrams: 15, priceHkd: 550, stockQuantity: 20, isDefault: true, sortOrder: 0 },
      { weight: "30ml", weightGrams: 30, priceHkd: 880, stockQuantity: 10, isDefault: false, sortOrder: 1 },
    ]
  },
];

async function main() {
  console.log('🌱 Seeding Cozy Nest products...\n');

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        nameEn: p.nameEn,
        nameZh: p.nameZh,
        imageUrl: p.imageUrl,
        descriptionEn: p.descriptionEn,
        descriptionZh: p.descriptionZh,
        category: p.category,
        categoryZh: p.categoryZh,
        origin: p.origin,
        originZh: p.originZh,
        priceHkd: p.price,
        stockQuantity: p.stockQuantity,
        inStock: true,
        isActive: true,
        variants: {
          create: p.variants.map((v, i) => ({
            weight: v.weight,
            weightGrams: v.weightGrams,
            priceHkd: v.priceHkd,
            stockQuantity: v.stockQuantity,
            isDefault: v.isDefault,
            sortOrder: v.sortOrder,
            isActive: true,
          })),
        },
      },
    });
    console.log(`  ✅ ${product.nameEn} (${product.nameZh})`);
  }

  console.log(`\n✨ Done — ${products.length} products seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
