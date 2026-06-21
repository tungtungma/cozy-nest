"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductForm from "@/components/admin/ProductForm";

interface ProductVariant {
  id: string;
  weight: string;
  weightGrams: number;
  priceHkd: number;
  platinumPriceHkd?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  nameEn: string;
  nameZh: string;
  priceHkd: number;
  grade: string;
  weight: string;
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
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (product: Product, operation: "add" | "set") => {
    const t = {
      en: {
        selectVariant: "Select variant:",
        addQuantity: "Enter quantity to ADD to current stock:",
        setQuantity: "Enter NEW total stock quantity:",
        invalidNumber: "Please enter a valid positive number",
        noVariants: "This product has no variants configured",
        currentStock: "Current stock:",
      },
      zh: {
        selectVariant: "選擇規格：",
        addQuantity: "輸入要增加的數量：",
        setQuantity: "輸入新的總庫存數量：",
        invalidNumber: "請輸入有效的正數",
        noVariants: "此產品沒有配置規格",
        currentStock: "當前庫存：",
      }
    };
    
    const text = t[language];
    
    // Check if product has variants
    if (!product.variants || product.variants.length === 0) {
      alert(text.noVariants);
      return;
    }

    // Sort variants by weight for consistent ordering
    const sortedVariants = [...product.variants].sort((a, b) => a.weightGrams - b.weightGrams);

    // If only one variant, use it directly
    let selectedVariant: ProductVariant;
    if (sortedVariants.length === 1) {
      selectedVariant = sortedVariants[0];
    } else {
      // Show variant selection dialog
      const variantOptions = sortedVariants
        .map((v, idx) => `${idx + 1}. ${v.weight} (${text.currentStock} ${v.stockQuantity})`)
        .join('\n');
      
      const variantInput = prompt(
        `${text.selectVariant}\n\n${variantOptions}\n\n${language === "en" ? "Enter number:" : "輸入編號："}`,
        "1"
      );

      if (!variantInput) return;

      const variantIndex = parseInt(variantInput) - 1;
      if (isNaN(variantIndex) || variantIndex < 0 || variantIndex >= sortedVariants.length) {
        alert(text.invalidNumber);
        return;
      }

      selectedVariant = sortedVariants[variantIndex];
    }
    
    const quantityInput = prompt(
      `${selectedVariant.weight} - ${operation === "add" ? text.addQuantity : text.setQuantity}\n${text.currentStock} ${selectedVariant.stockQuantity}`,
      "0"
    );

    if (!quantityInput) return;

    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity < 0) {
      alert(text.invalidNumber);
      return;
    }

    setRestockingId(product.id);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity, operation, variantId: selectedVariant.id }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchProducts(); // Refresh the list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to restock product");
      console.error(error);
    } finally {
      setRestockingId(null);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = async (productId: string) => {
    try {
      // Fetch full product details
      const response = await fetch(`/api/admin/products`);
      if (response.ok) {
        const data = await response.json();
        const product = data.products.find((p: any) => p.id === productId);
        if (product) {
          setEditingProduct(product);
          setShowForm(true);
        }
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      alert("Failed to load product details");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirmMsg = language === "en"
      ? `Are you sure you want to delete "${productName}"?`
      : `確定要刪除 "${productName}" 嗎？`;
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        const successMsg = language === "en"
          ? data.softDelete
            ? "Product marked as out of stock (has order history)"
            : "Product deleted successfully"
          : data.softDelete
            ? "產品已標記為缺貨 (有訂單記錄)"
            : "產品已成功刪除";
        alert(successMsg);
        fetchProducts();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      const url = editingProduct
        ? `/api/admin/products/${formData.id}`
        : `/api/admin/products`;
      
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        throw new Error(data.error || "Failed to save product");
      }
    } catch (error: any) {
      throw error;
    }
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      filterCategory === "all" || product.category === filterCategory;
    
    const stockMatch =
      filterStock === "all" ||
      (filterStock === "in-stock" && product.inStock && product.stockQuantity > 10) ||
      (filterStock === "low-stock" && product.stockQuantity > 0 && product.stockQuantity <= 10) ||
      (filterStock === "out-of-stock" && (!product.inStock || product.stockQuantity === 0));

    return categoryMatch && stockMatch;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const { language } = useLanguage();

  const t = {
    en: {
      title: "📦 Products Inventory",
      subtitle: "Manage stock levels and product availability",
      loading: "Loading products...",
      addNew: "+ Add New Product",
      filterCategory: "Filter by Category",
      filterStock: "Filter by Stock Status",
      allCategories: "All Categories",
      allProducts: "All Products",
      inStock: "In Stock (>10)",
      lowStock: "Low Stock (1-10)",
      outOfStock: "Out of Stock",
      showing: "Showing",
      of: "of",
      products: "products",
      product: "Product",
      category: "Category",
      price: "Price",
      stock: "Stock",
      shipping: "Shipping",
      status: "Status",
      actions: "Actions",
      inStockLabel: "✓ In Stock",
      lowStockLabel: "⚠ Low Stock",
      outOfStockLabel: "✕ Out of Stock",
      edit: "Edit",
      delete: "Delete",
      addStock: "+ Add Stock",
      setTotal: "Set Total",
      noProducts: "No products match the selected filters",
      stockSummary: "Stock Summary",
      totalProducts: "Total Products",
      lowStockItems: "Low Stock Items",
      outOfStockItems: "Out of Stock",
      packageDims: "Package",
    },
    zh: {
      title: "📦 產品庫存",
      subtitle: "管理庫存水平及產品供應",
      loading: "載入產品中...",
      addNew: "+ 新增產品",
      filterCategory: "按分類篩選",
      filterStock: "按庫存狀態篩選",
      allCategories: "所有分類",
      allProducts: "所有產品",
      inStock: "有貨 (>10)",
      lowStock: "低庫存 (1-10)",
      outOfStock: "缺貨",
      showing: "顯示",
      of: "共",
      products: "項產品",
      product: "產品",
      category: "分類",
      price: "價格",
      stock: "庫存",
      shipping: "運送",
      status: "狀態",
      actions: "操作",
      inStockLabel: "✓ 有貨",
      lowStockLabel: "⚠ 低庫存",
      outOfStockLabel: "✕ 缺貨",
      edit: "編輯",
      delete: "刪除",
      addStock: "+ 補貨",
      setTotal: "設定庫存",
      noProducts: "沒有符合篩選條件的產品",
      stockSummary: "庫存摘要",
      totalProducts: "總產品數",
      lowStockItems: "低庫存商品",
      outOfStockItems: "缺貨商品",
      packageDims: "包裝",
    }
  };

  const text = t[language];

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        isEdit={!!editingProduct}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal mx-auto mb-4"></div>
          <p className="text-xl text-teal/70 font-lora">{text.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-teal mb-2">
            {text.title}
          </h1>
          <p className="text-lg font-lora text-teal/70">
            {text.subtitle}
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors font-lora font-semibold shadow-lg"
        >
          {text.addNew}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-lora font-semibold text-teal mb-2">
              {text.filterCategory}
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
            >
              <option value="all">{text.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-lora font-semibold text-teal mb-2">
              {text.filterStock}
            </label>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
            >
              <option value="all">{text.allProducts}</option>
              <option value="in-stock">{text.inStock}</option>
              <option value="low-stock">{text.lowStock}</option>
              <option value="out-of-stock">{text.outOfStock}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm font-lora">
          <span className="text-teal/70">
            {text.showing} {filteredProducts.length} {text.of} {products.length} {text.products}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal text-white">
              <tr>
                <th className="px-6 py-4 text-left font-playfair">{text.product}</th>
                <th className="px-6 py-4 text-left font-playfair">{text.category}</th>
                <th className="px-6 py-4 text-left font-playfair">{text.price}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.stock}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.shipping}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.status}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.nameEn}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 className="font-lora font-semibold text-teal">
                          {language === "en" ? product.nameEn : product.nameZh}
                        </h3>
                        <p className="text-sm text-teal/70">{language === "en" ? product.nameZh : product.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-lora text-teal/70">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="text-sm">
                        <div className="font-playfair font-bold text-teal">
                          ${product.variants.find(v => v.isDefault)?.priceHkd || product.variants[0].priceHkd}
                        </div>
                        {product.variants.length > 1 && (
                          <div className="text-xs text-teal/60">
                            {product.variants.length} variants
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-playfair font-bold text-teal">
                        ${product.priceHkd}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      // Calculate total stock from all variants if they exist
                      const totalStock = product.variants && product.variants.length > 0
                        ? product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
                        : product.stockQuantity;
                      
                      return (
                        <div>
                          <span
                            className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                              totalStock === 0
                                ? "bg-red-100 text-red-700"
                                : totalStock <= 5
                                ? "bg-red-100 text-red-700"
                                : totalStock <= 10
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {totalStock}
                          </span>
                          {product.variants && product.variants.length > 1 && (
                            <div className="text-xs text-teal/60 mt-1">
                              across {product.variants.length} variants
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-xs font-lora text-teal/70">
                      {product.shippingWeightKg ? (
                        <>
                          <div>{product.shippingWeightKg}kg</div>
                          <div className="text-teal/50">
                            {product.packageLengthCm}×{product.packageWidthCm}×{product.packageHeightCm}cm
                          </div>
                        </>
                      ) : (
                        <span className="text-amber-600">⚠ Not set</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          product.inStock && product.stockQuantity > 10
                            ? "bg-green-100 text-green-700"
                            : product.inStock && product.stockQuantity > 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.inStock && product.stockQuantity > 10
                          ? text.inStockLabel
                          : product.inStock && product.stockQuantity > 0
                          ? text.lowStockLabel
                          : text.outOfStockLabel}
                      </span>
                      {!product.isActive && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                          {language === 'en' ? '🚫 Inactive' : '🚫 已停用'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-lora font-semibold"
                        >
                          {text.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, language === "en" ? product.nameEn : product.nameZh)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-lora font-semibold"
                        >
                          {text.delete}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestock(product, "add")}
                          disabled={restockingId === product.id}
                          className="px-3 py-1 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {restockingId === product.id ? "..." : text.addStock}
                        </button>
                        <button
                          onClick={() => handleRestock(product, "set")}
                          disabled={restockingId === product.id}
                          className="px-3 py-1 bg-sage text-white rounded-lg hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {restockingId === product.id ? "..." : text.setTotal}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-teal/60 font-lora">
                {text.noProducts}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Summary */}
      <div className="mt-6 bg-gradient-to-r from-teal to-sage rounded-2xl p-6 text-white">
        <h3 className="text-xl font-playfair font-bold mb-4">{text.stockSummary}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <p className="text-sm opacity-90 mb-1">{text.totalProducts}</p>
            <p className="text-3xl font-playfair font-bold">{products.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <p className="text-sm opacity-90 mb-1">{text.lowStockItems}</p>
            <p className="text-3xl font-playfair font-bold">
              {products.filter((p) => {
                const totalStock = p.variants && p.variants.length > 0
                  ? p.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
                  : p.stockQuantity;
                return totalStock > 0 && totalStock <= 10;
              }).length}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <p className="text-sm opacity-90 mb-1">{text.outOfStockItems}</p>
            <p className="text-3xl font-playfair font-bold">
              {products.filter((p) => {
                const totalStock = p.variants && p.variants.length > 0
                  ? p.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
                  : p.stockQuantity;
                return !p.inStock || totalStock === 0;
              }).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
