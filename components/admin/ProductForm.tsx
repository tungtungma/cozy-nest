"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductVariantFormData } from "@/types/product";
import { parseWeightToGrams } from "@/types/product";

interface ProductFormData {
  id: string;
  nameEn: string;
  nameZh: string;
  grade: "Premium" | "Superior" | "Deluxe";
  shippingWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  imageUrl: string;
  descriptionEn: string;
  descriptionZh: string;
  origin: string;
  originZh: string;
  preparationTipsEn: string;
  preparationTipsZh: string;
  category: string;
  categoryZh: string;
  featured: boolean;
  isActive: boolean;
  variants: ProductVariantFormData[];
}

interface ProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isEdit = false }: ProductFormProps) {
  console.log("🔥 ProductForm LOADED - Variant-enabled version with addVariant function");
  const { language } = useLanguage();
  
  // Helper to safely convert Prisma Decimal to number
  const toNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'toNumber' in value) return value.toNumber();
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };
  
  const [formData, setFormData] = useState<ProductFormData>(
    product ? {
      id: product.id,
      nameEn: product.nameEn,
      nameZh: product.nameZh,
      grade: product.grade,
      shippingWeightKg: toNumber(product.shippingWeightKg, 0.5),
      packageLengthCm: toNumber(product.packageLengthCm, 30),
      packageWidthCm: toNumber(product.packageWidthCm, 20),
      packageHeightCm: toNumber(product.packageHeightCm, 20),
      imageUrl: product.imageUrl,
      descriptionEn: product.descriptionEn,
      descriptionZh: product.descriptionZh,
      origin: product.origin,
      originZh: product.originZh,
      preparationTipsEn: product.preparationTipsEn,
      preparationTipsZh: product.preparationTipsZh,
      category: product.category,
      categoryZh: product.categoryZh,
      featured: product.featured || false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      variants: product.variants && product.variants.length > 0
        ? product.variants.map((v: any, index: number) => ({
            id: v.id,
            weight: v.weight,
            weightGrams: v.weightGrams,
            priceHkd: toNumber(v.priceHkd, 0),
            platinumPriceHkd: v.platinumPriceHkd ? toNumber(v.platinumPriceHkd, 0) : null,
            stockQuantity: toNumber(v.stockQuantity, 0),
            isDefault: v.isDefault,
            sortOrder: toNumber(v.sortOrder, index),
            shippingWeightKg: toNumber(v.shippingWeightKg, 0.5),
            packageLengthCm: toNumber(v.packageLengthCm, 30),
            packageWidthCm: toNumber(v.packageWidthCm, 20),
            packageHeightCm: toNumber(v.packageHeightCm, 20),
          }))
        : [
            // Create default variant from legacy product data
            {
              id: '',
              weight: product.weight || '500g',
              weightGrams: parseWeightToGrams(product.weight || '500g'),
              priceHkd: toNumber(product.priceHkd, 0),
              platinumPriceHkd: product.platinumPriceHkd ? toNumber(product.platinumPriceHkd, 0) : null,
              stockQuantity: toNumber(product.stockQuantity, 0),
              isDefault: true,
              sortOrder: 0,
              shippingWeightKg: toNumber(product.shippingWeightKg, 0.5),
              packageLengthCm: toNumber(product.packageLengthCm, 30),
              packageWidthCm: toNumber(product.packageWidthCm, 20),
              packageHeightCm: toNumber(product.packageHeightCm, 20),
            }
          ],
    } : {
      id: "",
      nameEn: "",
      nameZh: "",
      grade: "Premium",
      shippingWeightKg: 0.5,
      packageLengthCm: 30,
      packageWidthCm: 20,
      packageHeightCm: 20,
      imageUrl: "",
      descriptionEn: "",
      descriptionZh: "",
      origin: "",
      originZh: "",
      preparationTipsEn: "",
      preparationTipsZh: "",
      category: "",
      categoryZh: "",
      featured: false,
      isActive: true,
      variants: [
        {
          weight: "",
          weightGrams: 0,
          priceHkd: 0,
          platinumPriceHkd: null,
          stockQuantity: 0,
          isDefault: true,
          sortOrder: 0,
          shippingWeightKg: 0.5,
          packageLengthCm: 30,
          packageWidthCm: 20,
          packageHeightCm: 20,
        }
      ],
    }
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation: At least one variant
    if (formData.variants.length === 0) {
      setError("Product must have at least one variant");
      return;
    }
    
    // Validation: Exactly one default variant
    const defaultVariants = formData.variants.filter(v => v.isDefault);
    if (defaultVariants.length === 0) {
      setError("Please mark one variant as default");
      return;
    }
    if (defaultVariants.length > 1) {
      setError("Only one variant can be marked as default");
      return;
    }
    
    // Validation: All variants have required fields
    const invalidVariants = formData.variants.filter(
      v => !v.weight || v.priceHkd <= 0 || v.stockQuantity < 0
    );
    if (invalidVariants.length > 0) {
      setError("All variants must have weight, price, and stock quantity");
      return;
    }

    setSubmitting(true);

    // 🔍 DIAGNOSTIC: Log payload being sent
    console.log("📤 ProductForm submitting payload:", JSON.stringify(formData, null, 2));
    console.log("📊 Variants count:", formData.variants.length);
    console.log("📦 First variant:", formData.variants[0]);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== VARIANT MANAGEMENT FUNCTIONS =====
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          weight: "",
          weightGrams: 0,
          priceHkd: 0,
          platinumPriceHkd: null,
          stockQuantity: 0,
          isDefault: false,
          sortOrder: formData.variants.length,
          shippingWeightKg: formData.shippingWeightKg,
          packageLengthCm: formData.packageLengthCm,
          packageWidthCm: formData.packageWidthCm,
          packageHeightCm: formData.packageHeightCm,
        }
      ],
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) {
      setError("Product must have at least one variant");
      return;
    }
    
    const variantToRemove = formData.variants[index];
    let newVariants = formData.variants.filter((_, i) => i !== index);
    
    // If removing the default variant, make the first one default
    if (variantToRemove.isDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }
    
    // Re-index sortOrder
    newVariants = newVariants.map((v, i) => ({ ...v, sortOrder: i }));
    
    setFormData({
      ...formData,
      variants: newVariants,
    });
    setError("");
  };

  const updateVariant = (index: number, field: keyof ProductVariantFormData, value: any) => {
    const newVariants = [...formData.variants];
    
    // If setting this variant as default, unset others
    if (field === 'isDefault' && value === true) {
      newVariants.forEach((v, i) => {
        v.isDefault = i === index;
      });
    }
    
    // Auto-calculate weightGrams when weight changes
    if (field === 'weight' && typeof value === 'string') {
      newVariants[index] = {
        ...newVariants[index],
        weight: value,
        weightGrams: parseWeightToGrams(value),
      };
    } else {
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
      };
    }
    
    setFormData({
      ...formData,
      variants: newVariants,
    });
  };

  const t = {
    en: {
      title: isEdit ? "Edit Product" : "Add New Product",
      basicInfo: "Basic Information",
      productId: "Product ID",
      productIdHelp: "Lowercase, alphanumeric with hyphens (e.g., japanese-dried-scallops)",
      nameEn: "Name (English)",
      nameZh: "Name (Chinese)",
      category: "Category (English)",
      categoryZh: "Category (Chinese)",
      grade: "Grade",
      variants: "Product Variants (Weight & Price)",
      variantsHelp: "Add different weight options for this product",
      weight: "Weight",
      weightPlaceholder: "e.g., 250g, 500g, 1kg",
      price: "Price (HKD)",
      platinumPrice: "💎 Platinum Price",
      stock: "Stock Qty",
      defaultVariant: "Default",
      addVariant: "+ Add Variant",
      removeVariant: "Remove",
      shipping: "Shipping Defaults",
      shippingHelp: "These values are used as defaults when creating new variants",
      shippingWeight: "Shipping Weight (kg)",
      packageDimensions: "Package Dimensions (cm)",
      length: "Length",
      width: "Width",
      height: "Height",
      productDetails: "Product Details",
      descriptionEn: "Description (English)",
      descriptionZh: "Description (Chinese)",
      originEn: "Origin (English)",
      originZh: "Origin (Chinese)",
      preparationTipsEn: "Preparation Tips (English)",
      preparationTipsZh: "Preparation Tips (Chinese)",
      inventory: "Inventory & Display",
      imageUrl: "Image URL",
      featured: "Featured Product",
      isActive: "Active Product",
      isActiveHelp: "Hide discontinued or seasonal products without deleting them",
      cancel: "Cancel",
      save: isEdit ? "Update Product" : "Create Product",
      saving: "Saving...",
    },
    zh: {
      title: isEdit ? "編輯產品" : "新增產品",
      basicInfo: "基本資訊",
      productId: "產品ID",
      productIdHelp: "小寫字母、數字及連字符 (例: japanese-dried-scallops)",
      nameEn: "名稱 (英文)",
      nameZh: "名稱 (中文)",
      category: "分類 (英文)",
      categoryZh: "分類 (中文)",
      grade: "等級",
      variants: "產品規格 (重量及價格)",
      variantsHelp: "為此產品添加不同重量選項",
      weight: "重量",
      weightPlaceholder: "例如：250g, 500g, 1kg",
      price: "價格 (港幣)",
      platinumPrice: "💎 白金價格",
      stock: "庫存數量",
      defaultVariant: "預設",
      addVariant: "+ 新增規格",
      removeVariant: "移除",
      shipping: "運送預設值",
      shippingHelp: "這些數值用作新增規格時的預設值",
      shippingWeight: "運送重量 (公斤)",
      packageDimensions: "包裝尺寸 (厘米)",
      length: "長度",
      width: "寬度",
      height: "高度",
      productDetails: "產品詳情",
      descriptionEn: "描述 (英文)",
      descriptionZh: "描述 (中文)",
      originEn: "產地 (英文)",
      originZh: "產地 (中文)",
      preparationTipsEn: "烹調貼士 (英文)",
      preparationTipsZh: "烹調貼士 (中文)",
      inventory: "庫存及展示",
      imageUrl: "圖片網址",
      featured: "精選產品",
      isActive: "啟用產品",
      isActiveHelp: "隱藏停產或季節性產品，無需刪除",
      cancel: "取消",
      save: isEdit ? "更新產品" : "新增產品",
      saving: "儲存中...",
    },
  };

  const text = t[language];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {/* DEBUG MARKER - REMOVE AFTER CONFIRMING */}
        <div className="mb-4 p-4 bg-green-500 text-white rounded-lg text-center font-bold text-xl">
          ✅ VARIANT-ENABLED FORM v2.0 - THIS IS THE NEW VERSION WITH ADD VARIANT BUTTON
        </div>
        
        <h2 className="text-2xl font-playfair font-bold text-teal mb-6">{text.title}</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-playfair font-semibold text-teal mb-4">{text.basicInfo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.productId} *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={isEdit}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none disabled:bg-gray-100"
                required
              />
              <p className="text-xs text-teal/60 mt-1">{text.productIdHelp}</p>
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.grade} *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              >
                <option value="Premium">Premium</option>
                <option value="Superior">Superior</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.nameEn} *
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.nameZh} *
              </label>
              <input
                type="text"
                value={formData.nameZh}
                onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.category} *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.categoryZh} *
              </label>
              <input
                type="text"
                value={formData.categoryZh}
                onChange={(e) => setFormData({ ...formData, categoryZh: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* ===== PRODUCT VARIANTS SECTION ===== */}
        <div className="mb-8 p-6 bg-amber/5 rounded-xl border-2 border-amber/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-playfair font-semibold text-teal">
                ⚖️ {text.variants}
              </h3>
              <p className="text-sm text-teal/60 mt-1">{text.variantsHelp}</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-amber text-white rounded-lg hover:bg-amber-dark font-lora font-semibold transition-colors"
            >
              {text.addVariant}
            </button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  variant.isDefault 
                    ? 'bg-teal/5 border-teal/30' 
                    : 'bg-white border-teal/10'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-lora font-semibold text-teal mb-2">
                      {text.weight} *
                    </label>
                    <input
                      type="text"
                      value={variant.weight}
                      onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                      placeholder={text.weightPlaceholder}
                      className="w-full px-3 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-lora font-semibold text-teal mb-2">
                      {text.price} *
                    </label>
                    <input
                      type="number"
                      value={variant.priceHkd || ''}
                      onChange={(e) => updateVariant(index, 'priceHkd', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none text-sm"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-lora font-semibold text-purple-600 mb-2">
                      {text.platinumPrice}
                    </label>
                    <input
                      type="number"
                      value={variant.platinumPriceHkd || ''}
                      onChange={(e) => updateVariant(index, 'platinumPriceHkd', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl font-lora focus:border-purple-500 focus:outline-none text-sm"
                      min="0"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-lora font-semibold text-teal mb-2">
                      {text.stock} *
                    </label>
                    <input
                      type="number"
                      value={variant.stockQuantity || ''}
                      onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none text-sm"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-lora font-semibold transition-colors"
                      >
                        {text.removeVariant}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultVariant"
                      checked={variant.isDefault}
                      onChange={() => updateVariant(index, 'isDefault', true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-lora text-teal font-semibold">
                      {text.defaultVariant}
                    </span>
                  </label>
                  {variant.isDefault && (
                    <span className="text-xs text-teal/60 font-lora">
                      ({language === 'en' ? 'Selected by default on product page' : '產品頁面預設選擇'})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="text-xl font-playfair font-semibold text-teal mb-4">
            📦 {text.shipping}
          </h3>
          <p className="text-sm text-teal/60 font-lora mb-4">{text.shippingHelp}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.shippingWeight} *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.shippingWeightKg}
                onChange={(e) => setFormData({ ...formData, shippingWeightKg: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                min="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.length} *
              </label>
              <input
                type="number"
                value={formData.packageLengthCm}
                onChange={(e) => setFormData({ ...formData, packageLengthCm: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.width} *
              </label>
              <input
                type="number"
                value={formData.packageWidthCm}
                onChange={(e) => setFormData({ ...formData, packageWidthCm: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.height} *
              </label>
              <input
                type="number"
                value={formData.packageHeightCm}
                onChange={(e) => setFormData({ ...formData, packageHeightCm: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-8">
          <h3 className="text-xl font-playfair font-semibold text-teal mb-4">{text.productDetails}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-lora font-semibold text-teal mb-2">
                  {text.originEn} *
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-lora font-semibold text-teal mb-2">
                  {text.originZh} *
                </label>
                <input
                  type="text"
                  value={formData.originZh}
                  onChange={(e) => setFormData({ ...formData, originZh: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.descriptionEn} *
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.descriptionZh} *
              </label>
              <textarea
                value={formData.descriptionZh}
                onChange={(e) => setFormData({ ...formData, descriptionZh: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.preparationTipsEn} *
              </label>
              <textarea
                value={formData.preparationTipsEn}
                onChange={(e) => setFormData({ ...formData, preparationTipsEn: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.preparationTipsZh} *
              </label>
              <textarea
                value={formData.preparationTipsZh}
                onChange={(e) => setFormData({ ...formData, preparationTipsZh: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Inventory & Display */}
        <div className="mb-8">
          <h3 className="text-xl font-playfair font-semibold text-teal mb-4">{text.inventory}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-lora font-semibold text-teal mb-2">
                {text.imageUrl} *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-lora font-semibold text-teal">{text.featured}</span>
            </label>
            
            <div className="p-4 bg-amber/10 border-2 border-amber/30 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <span className="text-sm font-lora font-semibold text-teal block">{text.isActive}</span>
                  <span className="text-xs text-teal/60 font-lora">{text.isActiveHelp}</span>
                </div>
              </label>
              {!formData.isActive && (
                <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="text-xs font-lora text-orange-800">
                    {language === 'en' 
                      ? '⚠️ This product will be hidden from customers but stock will be preserved' 
                      : '⚠️ 此產品將對顧客隱藏，但庫存將被保留'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-lora font-semibold"
            disabled={submitting}
          >
            {text.cancel}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-lora font-semibold"
            disabled={submitting}
          >
            {submitting ? text.saving : text.save}
          </button>
        </div>
      </div>
    </form>
  );
}
