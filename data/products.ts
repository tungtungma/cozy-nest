export interface Product {
  id: string;
  name_en: string;
  name_zh: string;
  price_hkd: number;
  platinum_price_hkd?: number | null;  // VIP Tier: Optional Platinum pricing
  grade: "Premium" | "Superior" | "Deluxe";
  weight: string;
  image_url: string;
  description_en: string;
  description_zh: string;
  origin: string;
  origin_zh: string;
  preparation_tips_en: string;
  preparation_tips_zh: string;
  category: string;
  category_zh: string;
  in_stock: boolean;
  stock_quantity?: number;
}

export const products: Product[] = [
  {
    id: "japanese-dried-scallops",
    name_en: "Japanese Dried Scallops",
    name_zh: "日本乾貝",
    price_hkd: 680,
    grade: "Premium",
    weight: "500g",
    image_url: "/images/scallops.jpg",
    description_en: "Premium grade dried scallops from Hokkaido, Japan. Known for their sweet, umami-rich flavor and tender texture. Perfect for soups, congee, and premium Chinese dishes.",
    description_zh: "來自日本北海道的優質乾貝。以其甘甜、鮮味濃郁和嫩滑質地而聞名。適合用於湯品、粥品和高級中式菜餚。",
    origin: "Hokkaido, Japan",
    origin_zh: "日本北海道",
    preparation_tips_en: "Soak in cold water for 2-3 hours before cooking. Use the soaking water as a flavorful broth base. Perfect for steaming with garlic or adding to congee.",
    preparation_tips_zh: "烹調前用冷水浸泡2-3小時。浸泡水可用作美味湯底。適合蒸蒜蓉或加入粥品中。",
    category: "Shellfish",
    category_zh: "貝類",
    in_stock: true
  },
  {
    id: "premium-fish-maw",
    name_en: "Premium Fish Maw",
    name_zh: "花膠",
    price_hkd: 1280,
    grade: "Superior",
    weight: "300g",
    image_url: "/images/fish-maw.jpg",
    description_en: "Highest quality fish maw, prized for its rich collagen content and health benefits. A delicacy in Chinese cuisine, perfect for soups and double-boiled dishes.",
    description_zh: "最優質的花膠，以其豐富的膠原蛋白含量和健康益處而珍貴。是中國料理中的珍品，適合用於湯品和燉品。",
    origin: "South China Sea",
    origin_zh: "南中國海",
    preparation_tips_en: "Soak overnight in cold water. Blanch in ginger water to remove any fishy smell. Best enjoyed in double-boiled soups with chicken or pork.",
    preparation_tips_zh: "用冷水浸泡過夜。用薑水汆燙以去除腥味。最適合與雞肉或豬肉燉湯享用。",
    category: "Fish Products",
    category_zh: "魚類產品",
    in_stock: true
  },
  {
    id: "dried-abalone",
    name_en: "Dried Abalone",
    name_zh: "乾鮑魚",
    price_hkd: 2380,
    grade: "Deluxe",
    weight: "200g (8-10 pieces)",
    image_url: "/images/abalone.jpg",
    description_en: "Premium dried abalone from Japan, meticulously processed to preserve its tender texture and rich flavor. A symbol of luxury in Chinese gastronomy.",
    description_zh: "來自日本的優質乾鮑魚，經過精心加工以保持其嫩滑質地和濃郁風味。是中國美食中的奢華象徵。",
    origin: "Japan",
    origin_zh: "日本",
    preparation_tips_en: "Requires 3-5 days of soaking with daily water changes. Best braised with oyster sauce or added to festive dishes.",
    preparation_tips_zh: "需要3-5天浸泡，每天換水。最適合用蠔油燜煮或加入節日菜餚。",
    category: "Shellfish",
    category_zh: "貝類",
    in_stock: true
  },
  {
    id: "dried-sea-cucumber",
    name_en: "Dried Sea Cucumber",
    name_zh: "海參",
    price_hkd: 1680,
    grade: "Premium",
    weight: "250g",
    image_url: "/images/sea-cucumber.jpg",
    description_en: "Wild-caught sea cucumber, naturally sun-dried to preserve its nutritional value. Renowned for its health benefits and unique texture in Chinese cuisine.",
    description_zh: "野生海參，自然曬乾以保持其營養價值。以其健康益處和中國菜中獨特的質地而聞名。",
    origin: "Pacific Ocean",
    origin_zh: "太平洋",
    preparation_tips_en: "Requires 4-7 days soaking with daily water changes and boiling. Best braised with mushrooms or added to nourishing soups.",
    preparation_tips_zh: "需要4-7天浸泡，每天換水和煮沸。最適合與蘑菇一起燜煮或加入滋補湯中。",
    category: "Sea Products",
    category_zh: "海產品",
    in_stock: true
  },
  {
    id: "dried-oysters",
    name_en: "Dried Oysters",
    name_zh: "蠔豉",
    price_hkd: 480,
    grade: "Premium",
    weight: "400g",
    image_url: "/images/oysters.jpg",
    description_en: "Premium dried oysters with rich umami flavor. Essential for traditional Cantonese dishes and festive celebrations. Known as 'ho see' - bringing good fortune.",
    description_zh: "優質蠔豉，鮮味濃郁。傳統粵菜和節日慶典的必備食材。被稱為「好市」，帶來好運。",
    origin: "Hong Kong Waters",
    origin_zh: "香港水域",
    preparation_tips_en: "Rinse and soak for 30 minutes. Perfect for braising with fa cai (hair vegetable) during Chinese New Year or adding to clay pot rice.",
    preparation_tips_zh: "沖洗後浸泡30分鐘。適合在農曆新年與髮菜一起燜煮，或加入煲仔飯中。",
    category: "Shellfish",
    category_zh: "貝類",
    in_stock: true
  },
  {
    id: "dried-shrimp",
    name_en: "Premium Dried Shrimp",
    name_zh: "蝦米",
    price_hkd: 320,
    grade: "Premium",
    weight: "300g",
    image_url: "/images/shrimp.jpg",
    description_en: "Small but mighty dried shrimp bursting with umami. A versatile ingredient for stir-fries, fried rice, and traditional dim sum fillings.",
    description_zh: "小巧但味道濃郁的蝦米。是炒菜、炒飯和傳統點心餡料的多功能食材。",
    origin: "Taiwan",
    origin_zh: "台灣",
    preparation_tips_en: "Rinse and soak for 15-20 minutes before use. Great for adding depth to fried rice, glutinous rice, or turnip cake.",
    preparation_tips_zh: "使用前沖洗並浸泡15-20分鐘。適合為炒飯、糯米飯或蘿蔔糕增添風味。",
    category: "Crustaceans",
    category_zh: "甲殼類",
    in_stock: true
  }
];

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}

// Helper function to get featured products (first 2 for homepage)
export function getFeaturedProducts(): Product[] {
  return products.slice(0, 2);
}
