"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  deliveryFee: string;
  deliveryMethod: string;
  deliveryAddress: Record<string, unknown> | null;
  orderedAt: string;
  courier_uid: string | null;
  shipany_order_id: string | null;
  tracking_number: string | null;
  waybill_url: string | null;
  customerNote: string | null;
  user: {
    name: string | null;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product: {
      nameEn: string;
      nameZh: string;
    };
  }[];
  payment: {
    paymentMethod: string;
    status: string;
    paymentReceiptUrl?: string | null;
    receiptUploadedAt?: string | null;
  } | null;
}

interface ExportOrder extends Order {
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    variantWeight?: string | null;
    product: {
      nameEn: string;
      nameZh: string;
    };
    variant: {
      weight: string;
    } | null;
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editOrderStatus, setEditOrderStatus] = useState<string>("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  // ✅ NEW: Store signed URLs for payment receipts
  const [receiptSignedUrl, setReceiptSignedUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    total: 0,
  });

  const [exportingCsv, setExportingCsv] = useState(false);
  const [printingSlips, setPrintingSlips] = useState(false);
  const [printOrders, setPrintOrders] = useState<Order[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [currentPage, limit, filterStatus]);

  const fetchOrders = async (searchOverride?: string) => {
    setLoading(true);
    try {
      const effectiveSearch = searchOverride !== undefined ? searchOverride : searchQuery;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        status: filterStatus,
      });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (effectiveSearch) params.set("search", effectiveSearch);
      
      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPreviousPage(data.pagination.hasPreviousPage);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: Record<string, unknown> | null): string => {
    if (!addr) return "N/A";
    const parts: string[] = [];
    if (addr.street) parts.push(addr.street as string);
    if (addr.building) parts.push((addr.building as string));
    if (addr.floor) parts.push(`${addr.floor as string}F`);
    if (addr.unit) parts.push(`Unit ${addr.unit}`);
    if (addr.district) parts.push((addr.district as string));
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const getPhone = (addr: Record<string, unknown> | null): string => {
    if (!addr?.phone) return "N/A";
    return addr.phone as string;
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleApplyDateFilter = () => {
    setCurrentPage(1);
    setTimeout(() => fetchOrders(), 0);
  };

  const handleSearchApply = () => {
    setCurrentPage(1);
    setTimeout(() => fetchOrders(), 0);
  };

  const fetchAllFilteredOrders = async (): Promise<ExportOrder[]> => {
    const params = new URLSearchParams({
      status: filterStatus,
      export: "true",
    });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (searchQuery) params.set("search", searchQuery);
    const response = await fetch(`/api/admin/orders?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders for export");
    }
    const data = await response.json();
    return data.orders as ExportOrder[];
  };

  const formatExportAddress = (addr: Record<string, unknown> | null): string => {
    if (!addr) return "";
    const parts: string[] = [];
    if (addr.street || addr.addressLine1) parts.push((addr.street || addr.addressLine1) as string);
    if (addr.addressLine2) parts.push(addr.addressLine2 as string);
    if (addr.building) parts.push(addr.building as string);
    if (addr.floor) parts.push(`${addr.floor as string}F`);
    if (addr.unit) parts.push(`Unit ${addr.unit}`);
    if (addr.district) parts.push(addr.district as string);
    return parts.length > 0 ? parts.join(", ") : "";
  };

  const handleExportCSV = async () => {
    if (exportingCsv) return;
    setExportingCsv(true);
    try {
      const allOrders = await fetchAllFilteredOrders();
      const BOM = "\uFEFF";
      const headers = ["商家訂單號", "收件人姓名", "收件人手機", "收件人詳細地址", "托寄物名稱", "訂單日期", "訂單總額"];
      const rows = allOrders.map((order) => {
        const addr = order.deliveryAddress as Record<string, unknown> | null;
        const recipientName = (addr?.fullName as string) || (addr?.name as string) || order.user?.name || "";
        const recipientPhone = (addr?.phone as string) || "";
        const recipientAddr = formatExportAddress(order.deliveryAddress);
        if (!recipientAddr) {
          if (addr?.addressLine1) {
            // Use addressLine1 only
          }
        }
        const itemsText = order.items
          .map((item) => {
            const name = item.product?.nameZh || item.product?.nameEn || "優質海味";
            const variantInfo = item.variant?.weight ? ` (${item.variant.weight})` : (item.variantWeight ? ` (${item.variantWeight})` : "");
            return `${name}${variantInfo} x${item.quantity}`;
          })
          .join("; ");
        const itemName = itemsText || "優質海味";
        const escapeCsv = (val: string) => {
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        };
        return [
          escapeCsv(order.orderNumber),
          escapeCsv(recipientName),
          escapeCsv(recipientPhone),
          escapeCsv(recipientAddr),
          escapeCsv(itemName),
          new Date(order.orderedAt).toISOString().slice(0, 10),
          order.total,
        ].join(",");
      });
      const csv = BOM + headers.join(",") + "\n" + rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const statusLabel = filterStatus === "all" ? "all" : filterStatus;
      link.download = `orders-${statusLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExportingCsv(false);
    }
  };

  const handlePrintSlips = async () => {
    if (printingSlips) return;
    setPrintingSlips(true);
    try {
      const allOrders = await fetchAllFilteredOrders();
      setPrintOrders(allOrders);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to load orders for printing.");
    } finally {
      setPrintingSlips(false);
    }
  };

  // ✅ NEW: Fetch signed URL for payment receipt
  const fetchReceiptSignedUrl = async (receiptUrl: string) => {
    setLoadingReceipt(true);
    try {
      const response = await fetch('/api/admin/receipt-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setReceiptSignedUrl(data.signedUrl);
      } else {
        console.error('Failed to fetch signed URL');
        setReceiptSignedUrl(null);
      }
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      setReceiptSignedUrl(null);
    } finally {
      setLoadingReceipt(false);
    }
  };

  // ✅ NEW: Fetch signed URL when order is selected
  useEffect(() => {
    if (selectedOrder?.payment?.paymentReceiptUrl) {
      fetchReceiptSignedUrl(selectedOrder.payment.paymentReceiptUrl);
    } else {
      setReceiptSignedUrl(null);
    }
  }, [selectedOrder]);

  const handleEditClick = (order: Order) => {
    setEditMode(true);
    setEditOrderStatus(order.status);
    setEditPaymentStatus(order.payment?.status || "pending");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditOrderStatus("");
    setEditPaymentStatus("");
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderStatus: editOrderStatus,
          paymentStatus: editPaymentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the orders list with the updated order
        setOrders(orders.map(order =>
          order.id === selectedOrder.id ? data.order : order
        ));
        setSelectedOrder(data.order);
        setEditMode(false);
        alert("Order updated successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to update order: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  // Handle FPS Payment Approval
  const handleApprovePayment = async () => {
    if (!selectedOrder) return;

    if (!confirm("Are you sure you want to approve this FPS payment? This will confirm the order and cannot be undone.")) {
      return;
    }

    setApproving(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          paymentStatus: "succeeded",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the orders list
        setOrders(orders.map(order =>
          order.id === selectedOrder.id ? data.order : order
        ));
        setSelectedOrder(data.order);
        // Refresh to get updated stats
        fetchOrders();
        alert("✅ Payment approved! Order status updated to confirmed.");
      } else {
        const error = await response.json();
        alert(`❌ Failed to approve payment: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to approve payment:", error);
      alert("❌ Failed to approve payment");
    } finally {
      setApproving(false);
    }
  };

  // Handle Order Cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const reason = prompt(
      "Please enter a cancellation reason (or press Cancel to abort):",
      "Customer did not complete FPS payment"
    );
    
    if (reason === null) {
      return; // User pressed Cancel
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the orders list
        setOrders(orders.map(order =>
          order.id === selectedOrder.id 
            ? { ...order, status: "cancelled", payment: { ...order.payment!, status: "cancelled" } }
            : order
        ));
        setSelectedOrder(null); // Close modal
        // Refresh to get updated stats
        fetchOrders();
        
        const restoredItems = data.restoredItems?.length || 0;
        alert(`✅ Order cancelled successfully!\n\n${restoredItems > 0 ? `📦 Stock restored for ${restoredItems} item(s)` : ""}`);
      } else {
        const error = await response.json();
        alert(`❌ Failed to cancel order: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("❌ Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-indigo-100 text-indigo-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const { language } = useLanguage();

  const t = {
    en: {
      title: "📋 Orders Management",
      subtitle: "View and manage customer orders",
      loading: "Loading orders...",
      filterStatus: "Filter by Status",
      allOrders: "All Orders",
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      showing: "Showing",
      of: "of",
      orders: "orders",
      orderNumber: "Order #",
      customer: "Customer",
      total: "Total",
      status: "Status",
      date: "Date",
      actions: "Actions",
      viewDetails: "View Details",
      noOrders: "No orders match the selected filters",
      orderDetails: "Order Details",
      close: "Close",
      items: "Items",
      quantity: "Quantity",
      price: "Price",
      subtotal: "Subtotal",
      deliveryFee: "Delivery Fee",
      deliveryMethod: "Delivery Method",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status",
    },
    zh: {
      title: "📋 訂單管理",
      subtitle: "查看及管理客戶訂單",
      loading: "載入訂單中...",
      filterStatus: "按狀態篩選",
      allOrders: "所有訂單",
      pending: "待處理",
      confirmed: "已確認",
      processing: "處理中",
      shipped: "已發貨",
      delivered: "已送達",
      cancelled: "已取消",
      showing: "顯示",
      of: "共",
      orders: "筆訂單",
      orderNumber: "訂單編號",
      customer: "客戶",
      total: "總計",
      status: "狀態",
      date: "日期",
      actions: "操作",
      viewDetails: "查看詳情",
      noOrders: "沒有符合篩選條件的訂單",
      orderDetails: "訂單詳情",
      close: "關閉",
      items: "項目",
      quantity: "數量",
      price: "價格",
      subtotal: "小計",
      deliveryFee: "運費",
      deliveryMethod: "運送方式",
      paymentMethod: "付款方式",
      paymentStatus: "付款狀態",
    }
  };

  const text = t[language];

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
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold text-teal mb-2">
          {text.title}
        </h1>
        <p className="text-lg font-lora text-teal/70">
          {text.subtitle}
        </p>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-packing-slips,
          #printable-packing-slips * {
            visibility: visible;
          }
          #printable-packing-slips {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .packing-slip-page {
            page-break-after: always;
            padding: 2cm 1.5cm;
            background: white !important;
          }
          .packing-slip-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Filters & Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        {/* Search Bar */}
        <div className="mb-6 pb-6 border-b border-teal/10">
          <label className="block text-sm font-lora font-semibold text-teal mb-2">
            Search Orders
          </label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() === "") {
                    setCurrentPage(1);
                    fetchOrders("");
                  }
                }}
                placeholder="Search by name, phone, order #, or item..."
                className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora text-sm focus:border-teal focus:outline-none"
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchApply(); }}
              />
            </div>
            <button
              onClick={handleSearchApply}
              className="px-4 py-2 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold text-sm whitespace-nowrap"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); fetchOrders(""); }}
                className="px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-lora font-semibold whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-lora font-semibold text-teal mb-2">
              {text.filterStatus}
            </label>
            <div className="flex gap-3 mb-3">
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
              >
                <option value="all">{text.allOrders}</option>
                <option value="pending">{text.pending}</option>
                <option value="confirmed">{text.confirmed}</option>
                <option value="processing">{text.processing}</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleExportCSV}
                disabled={exportingCsv}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-lora font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {exportingCsv ? "⏳ Exporting..." : "📥 Export CSV"}
              </button>
              <button
                onClick={handlePrintSlips}
                disabled={printingSlips}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-lora font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {printingSlips ? "⏳ Loading..." : "🖨️ Print Slips"}
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs font-lora font-semibold text-teal/70 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-teal/20 rounded-xl font-lora text-sm focus:border-teal focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-lora font-semibold text-teal/70 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-teal/20 rounded-xl font-lora text-sm focus:border-teal focus:outline-none"
                />
              </div>
              <button
                onClick={handleApplyDateFilter}
                className="mt-5 px-4 py-2 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold text-sm whitespace-nowrap"
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); setCurrentPage(1); setTimeout(() => fetchOrders(), 0); }}
                  className="mt-5 px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-lora font-semibold whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-lora font-semibold text-teal mb-2">
              Orders per page
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLimitChange(10)}
                className={`px-4 py-2 rounded-xl font-lora font-semibold transition-colors ${
                  limit === 10
                    ? "bg-teal text-white"
                    : "bg-teal/10 text-teal hover:bg-teal/20"
                }`}
              >
                10
              </button>
              <button
                onClick={() => handleLimitChange(20)}
                className={`px-4 py-2 rounded-xl font-lora font-semibold transition-colors ${
                  limit === 20
                    ? "bg-teal text-white"
                    : "bg-teal/10 text-teal hover:bg-teal/20"
                }`}
              >
                20
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Info & Quick Stats */}
        <div className="pt-6 border-t border-teal/10">
          <div className="text-center mb-4">
            <p className="text-sm font-lora text-teal/70">
              Showing <span className="font-bold text-teal">{orders.length}</span> of{" "}
              <span className="font-bold text-teal">{totalCount}</span> orders
              {filterStatus !== "all" && ` (filtered by ${filterStatus})`}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-playfair font-bold text-teal">
                {stats.total}
              </p>
              <p className="text-sm text-teal/70">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-playfair font-bold text-amber-700">
                {stats.pending}
              </p>
              <p className="text-sm text-teal/70">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-playfair font-bold text-blue-700">
                {stats.confirmed}
              </p>
              <p className="text-sm text-teal/70">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-playfair font-bold text-indigo-700">
                {stats.shipped}
              </p>
              <p className="text-sm text-teal/70">Shipped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-playfair font-bold text-green-700">
                {stats.delivered}
              </p>
              <p className="text-sm text-teal/70">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal text-white">
              <tr>
                <th className="px-6 py-4 text-left font-playfair">Order #</th>
                <th className="px-6 py-4 text-left font-playfair">Customer</th>
                <th className="px-6 py-4 text-left font-playfair">Date</th>
                <th className="px-6 py-4 text-center font-playfair">Items</th>
                <th className="px-6 py-4 text-right font-playfair">Total</th>
                <th className="px-6 py-4 text-center font-playfair">Payment</th>
                <th className="px-6 py-4 text-center font-playfair">Status</th>
                <th className="px-6 py-4 text-center font-playfair">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-teal">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-lora font-semibold text-teal">
                        {order.user.name || "N/A"}
                      </p>
                      <p className="text-sm text-teal/70">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-lora text-teal/70">
                      {new Date(order.orderedAt).toLocaleDateString("en-HK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-teal/10 text-teal rounded-lg font-semibold">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-playfair font-bold text-teal text-lg">
                      ${order.total}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.payment?.status === "succeeded"
                          ? "bg-green-100 text-green-700"
                          : order.payment?.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.payment?.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors text-sm font-lora font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-teal/60 font-lora">
                No orders match the selected filter
              </p>
            </div>
)}

      {printOrders.length > 0 && (
        <div id="printable-packing-slips" className="hidden">
          {printOrders.map((order) => {
            const addr = order.deliveryAddress as Record<string, unknown> | null;
            const recipientName = (addr?.fullName as string) || (addr?.name as string) || order.user?.name || "";
            const recipientPhone = (addr?.phone as string) || "";
            const recipientAddr = formatAddress(order.deliveryAddress);
            const orderDate = new Date(order.orderedAt).toLocaleDateString("zh-HK", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            return (
              <div key={order.id} className="packing-slip-page" style={{ fontFamily: "Arial, sans-serif", fontSize: "13px", color: "#000" }}>
                <div style={{ marginBottom: "20px", borderBottom: "3px solid #0d9488", paddingBottom: "12px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 4px 0", color: "#0d9488" }}>
                    {order.orderNumber}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
                    Date: {orderDate} | Status: {order.status}
                  </p>
                </div>

                <div style={{ marginBottom: "18px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "bold", margin: "0 0 8px 0", color: "#0d9488" }}>Ship To</h3>
                  <p style={{ margin: "2px 0", fontSize: "14px", fontWeight: "bold" }}>{recipientName}</p>
                  <p style={{ margin: "2px 0" }}>Phone: {recipientPhone}</p>
                  <p style={{ margin: "2px 0" }}>{recipientAddr}</p>
                  <p style={{ margin: "2px 0", color: "#666", fontSize: "12px" }}>
                    Method: {order.deliveryMethod}
                  </p>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0d9488", color: "#fff" }}>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "bold", fontSize: "13px", borderBottom: "2px solid #0d9488" }}>Qty</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "bold", fontSize: "13px", borderBottom: "2px solid #0d9488" }}>Item</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "bold", fontSize: "13px", borderBottom: "2px solid #0d9488" }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const variantInfo = (item as any).variant?.weight
                        ? ` (${(item as any).variant.weight})`
                        : (item as any).variantWeight
                        ? ` (${(item as any).variantWeight})`
                        : "";
                      const itemName = `${item.product?.nameZh || item.product?.nameEn || ""}${variantInfo}`;
                      return (
                        <tr key={item.id} style={{ borderBottom: idx === order.items.length - 1 ? "2px solid #0d9488" : "1px solid #e5e7eb" }}>
                          <td style={{ padding: "8px 10px", textAlign: "center", fontSize: "14px" }}>{item.quantity}</td>
                          <td style={{ padding: "8px 10px", fontSize: "13px" }}>{itemName}</td>
                          <td style={{ padding: "8px 10px", fontSize: "12px", color: "#666" }}></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ fontSize: "11px", color: "#999", textAlign: "center", marginTop: "12px" }}>
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} items | Total: ${order.total}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-cream/30">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="px-6 py-2 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-lora text-teal/70">
                  Page <span className="font-bold text-teal">{currentPage}</span> of{" "}
                  <span className="font-bold text-teal">{totalPages}</span>
                </span>
                
                {/* Page Numbers */}
                <div className="hidden md:flex gap-1 ml-4">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-lora font-semibold transition-colors ${
                          currentPage === pageNum
                            ? "bg-teal text-white"
                            : "bg-white text-teal hover:bg-teal/10"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="px-6 py-2 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-teal text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-playfair font-bold">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="font-mono text-sm opacity-90 mt-1">
                {selectedOrder.orderNumber}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                  Customer Information
                </h3>
                <div className="bg-cream rounded-xl p-4 space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {selectedOrder.user.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedOrder.user.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone Number:</span>{" "}
                    {getPhone(selectedOrder.deliveryAddress)}
                  </p>
                  <p>
                    <span className="font-semibold">Shipping Address:</span>{" "}
                    {formatAddress(selectedOrder.deliveryAddress)}
                  </p>
                  <p>
                    <span className="font-semibold">Order Date:</span>{" "}
                    {new Date(selectedOrder.orderedAt).toLocaleString("en-HK")}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-cream rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-teal">
                          {item.product.nameEn}
                        </p>
                        <p className="text-sm text-teal/70">
                          {item.product.nameZh}
                        </p>
                        <p className="text-sm text-teal/60 mt-1">
                          ${item.unitPrice} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-playfair font-bold text-teal text-lg">
                        ${item.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                  Order Summary
                </h3>
                <div className="bg-cream rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">
                      ${selectedOrder.deliveryFee}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-playfair font-bold text-teal pt-2 border-t border-teal/20">
                    <span>Total:</span>
                    <span>${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                    Payment
                  </h3>
                  <div className="bg-cream rounded-xl p-4">
                    <p className="text-sm">
                      <span className="font-semibold">Method:</span>{" "}
                      {selectedOrder.payment?.paymentMethod || "N/A"}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Status:</span>{" "}
                      {editMode ? (
                        <select
                          value={editPaymentStatus}
                          onChange={(e) => setEditPaymentStatus(e.target.value)}
                          className="w-full px-3 py-1 border-2 border-teal/20 rounded-lg font-lora focus:border-teal focus:outline-none mt-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="succeeded">Succeeded</option>
                          <option value="failed">Failed</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            selectedOrder.payment?.status === "succeeded"
                              ? "bg-green-100 text-green-700"
                              : selectedOrder.payment?.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedOrder.payment?.status || "N/A"}
                        </span>
                      )}
                    </p>
                    
                    {/* NEW: Payment Receipt Display */}
                    {selectedOrder.payment?.paymentReceiptUrl && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Payment Receipt:</p>
                        {loadingReceipt ? (
                          <div className="w-full h-32 rounded-lg border-2 border-teal/20 flex items-center justify-center">
                            <p className="text-sm text-teal/60">Loading receipt...</p>
                          </div>
                        ) : receiptSignedUrl ? (
                          <a
                            href={receiptSignedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-teal/20 hover:border-teal transition-colors">
                              {/* ✅ FIX: Use signed URL for private Supabase storage */}
                              <img
                                src={receiptSignedUrl}
                                alt="Payment Receipt"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
/>
                            </div>
                            <p className="text-xs text-teal/60 mt-1 hover:text-teal">
                              🔍 Click to view full size
                            </p>
                          </a>
                        ) : (
                          <div className="w-full h-32 rounded-lg border-2 border-red-200 flex items-center justify-center">
                            <p className="text-sm text-red-600">Failed to load receipt</p>
                          </div>
                        )}
                        {selectedOrder.payment.receiptUploadedAt && (
                          <p className="text-xs text-teal/50 mt-1">
                            Uploaded: {new Date(selectedOrder.payment.receiptUploadedAt).toLocaleString("en-HK")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                    Delivery
                  </h3>
                  <div className="bg-cream rounded-xl p-4">
                    <p className="text-sm">
                      <span className="font-semibold">Method:</span>{" "}
                      {selectedOrder.deliveryMethod}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Status:</span>{" "}
                      {editMode ? (
                        <select
                          value={editOrderStatus}
                          onChange={(e) => setEditOrderStatus(e.target.value)}
                          className="w-full px-3 py-1 border-2 border-teal/20 rounded-lg font-lora focus:border-teal focus:outline-none mt-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      )}
                    </p>

                    {/* Customer Note */}
                    {selectedOrder.customerNote && (
                      <div className="mt-4 pt-4 border-t border-teal/10">
                        <p className="text-xs font-semibold text-teal/70 mb-1 uppercase tracking-wide">
                          Customer Note:
                        </p>
                        <p className="text-sm text-teal/80 italic bg-white/60 rounded-lg p-3 leading-relaxed">
                          {selectedOrder.customerNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {(selectedOrder.courier_uid || selectedOrder.tracking_number) && (
                <div>
                  <h3 className="text-lg font-playfair font-bold text-teal mb-3">
                    📦 Shipping Information
                  </h3>
                  <div className="bg-cream rounded-xl p-4 space-y-2">
                    {selectedOrder.courier_uid && (
                      <p className="text-sm">
                        <span className="font-semibold">Courier:</span>{" "}
                        {selectedOrder.courier_uid.replace(/_/g, ' ')}
                      </p>
                    )}
                    {selectedOrder.tracking_number && (
                      <p className="text-sm">
                        <span className="font-semibold">Tracking Number:</span>{" "}
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          {selectedOrder.tracking_number}
                        </span>
                      </p>
                    )}
                    {selectedOrder.waybill_url && (
                      <p className="text-sm">
                        <a
                          href={selectedOrder.waybill_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:text-teal-dark font-semibold underline"
                        >
                          📄 Download Waybill/Label
                        </a>
                      </p>
                    )}
                    {selectedOrder.shipany_order_id && (
                      <p className="text-xs text-teal/60 mt-2">
                        ShipAny Order ID: {selectedOrder.shipany_order_id}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions for FPS Pending Orders */}
              {selectedOrder.status === "pending" && selectedOrder.payment?.paymentMethod === "fps" && selectedOrder.payment?.status === "pending" && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-playfair font-bold text-blue-800 mb-3">
                    📱 FPS Payment - Awaiting Verification
                  </h3>
                  
                  {/* NEW: Receipt Review Section */}
                  {selectedOrder.payment?.paymentReceiptUrl && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-blue-800 mb-2">
                        Customer Receipt:
                      </p>
                      {loadingReceipt ? (
                        <div className="w-full h-64 rounded-lg border-2 border-blue-300 flex items-center justify-center bg-gray-50">
                          <p className="text-sm text-blue-600">Loading receipt...</p>
                        </div>
                      ) : receiptSignedUrl ? (
                        <a
                          href={receiptSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-colors bg-gray-50">
                            {/* ✅ FIX: Use signed URL for private Supabase storage */}
                            <img
                              src={receiptSignedUrl}
                              alt="Payment Receipt"
                              className="w-full h-full object-contain cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-center text-blue-600 mt-2">
                            🔍 Click to view in new tab
                          </p>
                        </a>
                      ) : (
                        <div className="w-full h-64 rounded-lg border-2 border-red-300 flex items-center justify-center bg-red-50">
                          <p className="text-sm text-red-600">Failed to load receipt</p>
                        </div>
                      )}
                      {selectedOrder.payment.receiptUploadedAt && (
                        <p className="text-xs text-blue-500 mt-2">
                          📅 Uploaded: {new Date(selectedOrder.payment.receiptUploadedAt).toLocaleString("en-HK")}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-blue-700 font-lora mb-4">
                    {selectedOrder.payment?.paymentReceiptUrl
                      ? "Review the payment receipt above. If it matches the order total, approve the payment."
                      : "⚠️ No receipt uploaded. Customer may need to be contacted."}
                    {" "}Stock has been reserved.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprovePayment}
                      disabled={approving || cancelling}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approving ? "⏳ Approving..." : "✅ Approve Payment"}
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={approving || cancelling}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? "⏳ Cancelling..." : "❌ Cancel Order"}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Button for other pending orders */}
              {selectedOrder.status === "pending" && !(selectedOrder.payment?.paymentMethod === "fps" && selectedOrder.payment?.status === "pending") && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-playfair font-bold text-amber-800 mb-3">
                    ⏳ Order Pending
                  </h3>
                  <p className="text-sm text-amber-700 font-lora mb-4">
                    This order is awaiting payment confirmation. If the customer doesn't complete payment, you can cancel the order to restore stock.
                  </p>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? "⏳ Cancelling..." : "❌ Cancel Order & Restore Stock"}
                  </button>
                </div>
              )}

              {/* Cancel Button for confirmed orders (before shipping) */}
              {selectedOrder.status === "confirmed" && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
                  <h3 className="text-lg font-playfair font-bold text-gray-700 mb-3">
                    ✅ Order Confirmed
                  </h3>
                  <p className="text-sm text-gray-600 font-lora mb-4">
                    This order has been confirmed. You can still cancel it before creating a shipment.
                  </p>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? "⏳ Cancelling..." : "❌ Cancel Order & Restore Stock"}
                  </button>
                </div>
              )}

              {/* Edit Actions */}
              <div className="flex gap-3 pt-4 border-t border-teal/10">
                {editMode ? (
                  <>
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updating || approving || cancelling}
                      className="flex-1 px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? "Saving..." : "💾 Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updating || approving || cancelling}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditClick(selectedOrder)}
                    disabled={approving || cancelling}
                    className="flex-1 px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal-dark transition-colors font-lora font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✏️ Edit Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Loading Modal for Order Approval */}
      {approving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
            {/* Animated Spinner */}
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal"></div>
            </div>
            
            {/* Status Heading */}
            <h3 className="text-xl sm:text-2xl font-playfair font-bold text-teal text-center mb-6">
              Approving Payment
            </h3>
            
            {/* Progress Steps */}
            <div className="space-y-3 text-sm sm:text-base font-lora">
              <div className="flex items-center gap-3 text-green-600">
                <span className="text-xl">✓</span>
                <span>Confirming payment status</span>
              </div>
              <div className="flex items-center gap-3 text-teal">
                <span className="text-xl animate-pulse">⏳</span>
                <span className="font-semibold">Creating ShipAny shipment...</span>
              </div>
              <div className="flex items-center gap-3 text-teal/50">
                <span className="text-xl">○</span>
                <span>Sending confirmation email</span>
              </div>
            </div>
            
            {/* Warning Message */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-center text-amber-800 font-lora">
                ⏱️ This process may take <span className="font-bold">10-15 seconds</span>
                <br />
                <span className="text-amber-600">Please do not close this window</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
