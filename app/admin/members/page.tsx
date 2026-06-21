"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  // VIP Tier fields
  tier: string;
  tierAchievedAt: string | null;
  currentCycleSpend: string;
  lifetimeSpend: string;
  _count: {
    orders: number;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: {
    nameEn: string;
    nameZh: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  deliveryFee: string;
  deliveryMethod: string;
  orderedAt: string;
  items: OrderItem[];
  payment: {
    paymentMethod: string;
    status: string;
  } | null;
}

export default function AdminMembersPage() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Order history modal state
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, member: 0, admin: 0 });

  const t = {
    en: {
      title: "👥 Members Management",
      subtitle: "Approve and manage member accounts",
      loading: "Loading members...",
      filterRole: "Filter by Role",
      allUsers: "All Users",
      pendingApproval: "Pending Approval",
      members: "Members",
      admins: "Admins",
      showing: "Showing",
      of: "of",
      users: "users",
      name: "Name",
      email: "Email",
      role: "Role",
      joinedDate: "Joined",
      orders: "Orders",
      actions: "Actions",
      approve: "Approve",
      reject: "Reject",
      approved: "Approved",
      pending: "Pending",
      member: "Member",
      admin: "Admin",
      noUsers: "No users match the selected filters",
      viewOrders: "View Orders",
      orderHistory: "Order History",
      ordersFor: "Orders for",
      noOrders: "This member hasn't placed any orders yet",
      orderDetails: "Order Details",
      items: "Items",
      deliveryMethod: "Delivery Method",
      paymentStatus: "Payment Status",
      closeModal: "Close",
      orderNumber: "Order #",
      total: "Total",
      status: "Status",
      date: "Date",
      quantity: "Qty",
      price: "Price",
      subtotal: "Subtotal",
      deliveryFee: "Delivery Fee",
      payment: "Payment",
      loadingOrders: "Loading orders...",
      sfLocker: "SF Locker",
      homeDelivery: "Home Delivery",
      revokeAccess: "Revoke Access",
      cancelMembership: "Cancel Membership",
      reactivate: "Reactivate",
      deleteUser: "Delete",
      // VIP Tier translations
      tier: "Tier",
      currentSpend: "Cycle Spend",
      lifetimeSpend: "Lifetime",
      resetDate: "Resets",
      upgradePlatinum: "💎 Platinum",
      downgradePlatinum: "Downgrade",
      // Additional translations
      awaitingApproval: "Awaiting approval",
      approvedOn: "Approved:",
      pendingWarning: "member",
      pendingWarningPlural: "members",
      pendingWarningText: "pending approval",
      user: "User",
      // Info section
      approvalProcessTitle: "Member Approval Process",
      approveTitle: "✓ Approve Members",
      approveDesc: "Approved members can view prices, add items to cart, and place orders. They receive full access to the premium seafood catalog.",
      rejectTitle: "✕ Reject Applications",
      rejectDesc: "Rejecting removes the pending user account entirely. They will need to sign up again if they wish to reapply for membership.",
    },
    zh: {
      title: "👥 會員管理",
      subtitle: "審核及管理會員帳戶",
      loading: "載入會員中...",
      filterRole: "按角色篩選",
      allUsers: "所有用戶",
      pendingApproval: "待審核",
      members: "會員",
      admins: "管理員",
      showing: "顯示",
      of: "共",
      users: "位用戶",
      name: "姓名",
      email: "電郵",
      role: "角色",
      joinedDate: "加入日期",
      orders: "訂單",
      actions: "操作",
      approve: "批准",
      reject: "拒絕",
      approved: "已批准",
      pending: "待審核",
      member: "會員",
      admin: "管理員",
      noUsers: "沒有符合篩選條件的用戶",
      viewOrders: "查看訂單",
      orderHistory: "訂單記錄",
      ordersFor: "訂單記錄：",
      noOrders: "此會員尚未下單",
      orderDetails: "訂單詳情",
      items: "商品",
      deliveryMethod: "送貨方式",
      paymentStatus: "付款狀態",
      closeModal: "關閉",
      orderNumber: "訂單編號",
      total: "總額",
      status: "狀態",
      date: "日期",
      quantity: "數量",
      price: "價格",
      subtotal: "小計",
      deliveryFee: "運費",
      payment: "付款",
      loadingOrders: "載入訂單中...",
      sfLocker: "順豐智能櫃",
      homeDelivery: "送貨上門",
      revokeAccess: "撤銷權限",
      cancelMembership: "取消會員資格",
      reactivate: "重新啟用",
      deleteUser: "刪除",
      // VIP Tier translations
      tier: "等級",
      currentSpend: "週期消費",
      lifetimeSpend: "累計",
      resetDate: "重置日期",
      upgradePlatinum: "💎 白金",
      downgradePlatinum: "降級",
      // Additional translations
      awaitingApproval: "等待批准",
      approvedOn: "已批准：",
      pendingWarning: "位會員",
      pendingWarningPlural: "位會員",
      pendingWarningText: "待審核",
      user: "用戶",
      // Info section
      approvalProcessTitle: "會員審核流程",
      approveTitle: "✓ 批准會員",
      approveDesc: "已批准的會員可以查看價格、加入購物車並下訂單。他們可以完全訪問高級海鮮目錄。",
      rejectTitle: "✕ 拒絕申請",
      rejectDesc: "拒絕會完全刪除待審核用戶帳戶。如果他們希望重新申請會員資格，則需要重新註冊。",
    }
  };

  const text = t[language];

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.set("role", filterRole);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/admin/members?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchApply = () => {
    fetchUsers();
  };

  const handleApprove = async (userId: string, userEmail: string) => {
    const confirmMsg = language === "en"
      ? `Approve member: ${userEmail}?`
      : `批准會員：${userEmail}？`;
    if (!confirm(confirmMsg)) return;

    setProcessingId(userId);

    try {
      const response = await fetch(`/api/admin/members/${userId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchUsers(); // Refresh the list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to approve member");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, userEmail: string) => {
    const confirmMsg = language === "en"
      ? `Reject and remove pending member: ${userEmail}?\n\nThis action cannot be undone.`
      : `拒絕並移除待審核會員：${userEmail}？\n\n此操作無法復原。`;
    if (!confirm(confirmMsg)) return;

    setProcessingId(userId);

    try {
      const response = await fetch(`/api/admin/members/${userId}/reject`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchUsers(); // Refresh the list
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to reject member");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpgradeToPlatinum = async (userId: string, userEmail: string) => {
    const confirmMsg = language === "en"
      ? `Manually upgrade ${userEmail} to Platinum tier?\n\nThis will:\n- Set tier to Platinum\n- Reset their 1-year timer\n- Give them access to platinum pricing`
      : `手動升級 ${userEmail} 至白金卡？\n\n這將：\n- 將等級設為白金\n- 重置一年計時器\n- 授予白金價格訪問權限`;
    
    if (!confirm(confirmMsg)) return;

    setProcessingId(userId);

    try {
      const response = await fetch(`/api/admin/members/${userId}/upgrade-platinum`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to upgrade to Platinum');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDowngradeFromPlatinum = async (userId: string, userEmail: string) => {
    const confirmMsg = language === "en"
      ? `Downgrade ${userEmail} from Platinum?\n\nThey will return to their spend-based tier (Gold/Silver/Member).`
      : `降級 ${userEmail} 的白金卡？\n\n他們將返回基於消費的等級（金/銀/會員）。`;
    
    if (!confirm(confirmMsg)) return;

    setProcessingId(userId);

    try {
      const response = await fetch(`/api/admin/members/${userId}/downgrade-platinum`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to downgrade from Platinum');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewOrders = async (user: User) => {
    setSelectedUser(user);
    setShowOrdersModal(true);
    setOrdersLoading(true);
    setUserOrders([]);

    try {
      const response = await fetch(`/api/admin/members/${user.id}/orders`);
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.orders);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      alert("Failed to load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeOrdersModal = () => {
    setShowOrdersModal(false);
    setSelectedUser(null);
    setUserOrders([]);
    setExpandedOrderId(null);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-indigo-100 text-indigo-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, { en: string; zh: string }> = {
      pending: { en: "Pending", zh: "待處理" },
      confirmed: { en: "Confirmed", zh: "已確認" },
      processing: { en: "Processing", zh: "處理中" },
      shipped: { en: "Shipped", zh: "已發貨" },
      delivered: { en: "Delivered", zh: "已送達" },
      cancelled: { en: "Cancelled", zh: "已取消" },
    };
    return statusLabels[status.toLowerCase()]?.[language] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusLabels: Record<string, { en: string; zh: string }> = {
      pending: { en: "Pending", zh: "待付款" },
      succeeded: { en: "Succeeded", zh: "已付款" },
      failed: { en: "Failed", zh: "失敗" },
    };
    return statusLabels[status.toLowerCase()]?.[language] || status;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "member":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // VIP Tier Helper Functions
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-700';
      case 'gold':
        return 'bg-amber-100 text-amber-700';
      case 'silver':
        return 'bg-gray-200 text-gray-800';
      case 'member':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'member':
      default:
        return '👤';
    }
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, {en: string; zh: string}> = {
      platinum: { en: 'Platinum', zh: '白金' },
      gold: { en: 'Gold', zh: '金卡' },
      silver: { en: 'Silver', zh: '銀卡' },
      member: { en: 'Member', zh: '會員' },
    };
    return labels[tier] || labels.member;
  };

  const formatResetDate = (tierAchievedAt: string | null): string => {
    if (!tierAchievedAt) return '';
    
    const achievedDate = new Date(tierAchievedAt);
    const resetDate = new Date(achievedDate);
    resetDate.setFullYear(resetDate.getFullYear() + 1);
    
    return resetDate.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-HK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const pendingCount = stats.pending;
  const memberCount = stats.member;
  const adminCount = stats.admin;

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

      {/* Stats & Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        {/* Search Bar */}
        <div className="mb-6 pb-6 border-b border-teal/10">
          <label className="block text-sm font-lora font-semibold text-teal mb-2">
            Search Members
          </label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() === "") {
                    fetchUsers();
                  }
                }}
                placeholder="Search by name or email..."
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
                onClick={() => { setSearchQuery(""); fetchUsers(); }}
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
              {text.filterRole}
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border-2 border-teal/20 rounded-xl font-lora focus:border-teal focus:outline-none"
            >
              <option value="all">{text.allUsers}</option>
              <option value="pending">{text.pendingApproval}</option>
              <option value="member">{text.members}</option>
              <option value="admin">{text.admins}</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm font-lora text-teal/70">
              {text.showing} {users.length} {text.of} {stats.total} {text.users}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-teal/10">
          <div className="text-center">
            <p className="text-2xl font-playfair font-bold text-amber-700">
              {pendingCount}
            </p>
            <p className="text-sm text-teal/70">{text.pending}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-playfair font-bold text-green-700">
              {memberCount}
            </p>
            <p className="text-sm text-teal/70">{text.members}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-playfair font-bold text-purple-700">
              {adminCount}
            </p>
            <p className="text-sm text-teal/70">{text.admins}</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 font-semibold">
              ⚠️ {pendingCount} {pendingCount > 1 ? text.pendingWarningPlural : text.pendingWarning} {text.pendingWarningText}
            </p>
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal text-white">
              <tr>
                <th className="px-6 py-4 text-left font-playfair">{text.user}</th>
                <th className="px-6 py-4 text-left font-playfair">{text.email}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.role}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.orders}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.tier}</th>
                <th className="px-6 py-4 text-left font-playfair">{text.currentSpend}</th>
                <th className="px-6 py-4 text-left font-playfair">{text.joinedDate}</th>
                <th className="px-6 py-4 text-center font-playfair">{text.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-lora font-semibold text-teal">
                        {user.name || "N/A"}
                      </p>
                      {user.role === "pending" && (
                        <span className="text-xs text-amber-600 font-semibold">
                          {text.awaitingApproval}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-teal/70">
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role === "admin"
                        ? `👑 ${text.admin}`
                        : user.role === "member"
                        ? `✓ ${text.member}`
                        : `⏳ ${text.pending}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-teal/10 text-teal rounded-lg font-semibold">
                      {user._count.orders}
                    </span>
                  </td>
                  {/* Tier Badge */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor(user.tier || 'member')}`}>
                      <span>{getTierIcon(user.tier || 'member')}</span>
                      <span>{getTierLabel(user.tier || 'member')[language]}</span>
                    </span>
                  </td>
                  {/* Current Spend & Reset Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-teal">
                      ${parseFloat(user.currentCycleSpend || '0').toFixed(0)}
                    </div>
                    <div className="text-xs text-teal/50">
                      {text.lifetimeSpend}: ${parseFloat(user.lifetimeSpend || '0').toFixed(0)}
                    </div>
                    {user.tierAchievedAt && user.tier !== 'member' && (
                      <div className="text-xs text-amber-600 mt-1">
                        {text.resetDate}: {formatResetDate(user.tierAchievedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-lora text-teal/70">
                      {new Date(user.createdAt).toLocaleDateString("en-HK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {user.approvedAt && (
                      <p className="text-xs text-teal/50 mt-1">
                        {text.approvedOn}{" "}
                        {new Date(user.approvedAt).toLocaleDateString("en-HK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(user.id, user.email)}
                          disabled={processingId === user.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {processingId === user.id ? "..." : `✓ ${text.approve}`}
                        </button>
                        <button
                          onClick={() => handleReject(user.id, user.email)}
                          disabled={processingId === user.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {processingId === user.id ? "..." : `✕ ${text.reject}`}
                        </button>
                      </div>
                    ) : user.role === "cancelled" ? (
                      <div className="flex items-center justify-center gap-2">
                        {user._count.orders > 0 && (
                          <button
                            onClick={() => handleViewOrders(user)}
                            className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/80 transition-colors text-sm font-lora font-semibold"
                          >
                            📋 {text.viewOrders}
                          </button>
                        )}
                        <button
                          onClick={() => handleApprove(user.id, user.email)}
                          disabled={processingId === user.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {processingId === user.id ? "..." : `♻️ ${text.reactivate}`}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {user._count.orders > 0 && (
                          <button
                            onClick={() => handleViewOrders(user)}
                            className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/80 transition-colors text-sm font-lora font-semibold"
                          >
                            📋 {text.viewOrders}
                          </button>
                        )}
                        {/* Upgrade to Platinum Button - Show for non-Platinum approved members */}
                        {user.role === 'member' && user.tier !== 'platinum' && (
                          <button
                            onClick={() => handleUpgradeToPlatinum(user.id, user.email)}
                            disabled={processingId === user.id}
                            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-lora font-semibold"
                          >
                            {text.upgradePlatinum}
                          </button>
                        )}
                        {/* Downgrade from Platinum Button - Show for Platinum members */}
                        {user.tier === 'platinum' && (
                          <button
                            onClick={() => handleDowngradeFromPlatinum(user.id, user.email)}
                            disabled={processingId === user.id}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-lora font-semibold"
                          >
                            {text.downgradePlatinum}
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(user.id, user.email)}
                          disabled={processingId === user.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-lora font-semibold"
                        >
                          {processingId === user.id ? "..." :
                            `🚫 ${user.role === "admin" ? text.revokeAccess : text.cancelMembership}`
                          }
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-teal/60 font-lora">
                {text.noUsers}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-gradient-to-r from-teal to-sage rounded-2xl p-6 text-white">
        <h3 className="text-xl font-playfair font-bold mb-4">
          {text.approvalProcessTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h4 className="font-semibold mb-2">{text.approveTitle}</h4>
            <p className="text-sm opacity-90">
              {text.approveDesc}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h4 className="font-semibold mb-2">{text.rejectTitle}</h4>
            <p className="text-sm opacity-90">
              {text.rejectDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Order History Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal to-sage text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-playfair font-bold">
                  📋 {text.orderHistory}
                </h2>
                {selectedUser && (
                  <p className="text-white/90 mt-1">
                    {text.ordersFor} {selectedUser.name || selectedUser.email}
                  </p>
                )}
              </div>
              <button
                onClick={closeOrdersModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal mx-auto mb-4"></div>
                    <p className="text-xl text-teal/70 font-lora">{text.loadingOrders}</p>
                  </div>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-teal/60 font-lora">{text.noOrders}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border-2 border-teal/20 rounded-xl p-6 hover:border-teal/40 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-lora font-semibold text-teal">
                              {text.orderNumber} {order.orderNumber}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-teal/60 mt-1">
                            {new Date(order.orderedAt).toLocaleDateString("en-HK", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-playfair font-bold text-teal">
                            HKD {parseFloat(order.total).toFixed(2)}
                          </p>
                          {order.payment && (
                            <p className="text-sm text-teal/60">
                              {text.payment}: {getPaymentStatusLabel(order.payment.status)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-teal/60">{text.subtotal}:</span>
                          <span className="ml-2 font-semibold text-teal">
                            HKD {parseFloat(order.subtotal).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-teal/60">{text.deliveryFee}:</span>
                          <span className="ml-2 font-semibold text-teal">
                            HKD {parseFloat(order.deliveryFee).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-teal/60">{text.deliveryMethod}:</span>
                          <span className="ml-2 font-semibold text-teal">
                            {order.deliveryMethod === "sf-locker" ? text.sfLocker : text.homeDelivery}
                          </span>
                        </div>
                      </div>

                      {/* Toggle Items Button */}
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-teal/10 hover:bg-teal/20 rounded-lg transition-colors"
                      >
                        <span className="font-lora font-semibold text-teal">
                          {expandedOrderId === order.id ? "▼" : "▶"} {text.items} ({order.items.length})
                        </span>
                      </button>

                      {/* Order Items (Expandable) */}
                      {expandedOrderId === order.id && (
                        <div className="mt-4 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4 bg-cream/30 rounded-lg"
                            >
                              <img
                                src={item.product.imageUrl}
                                alt={language === "en" ? item.product.nameEn : item.product.nameZh}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-lora font-semibold text-teal">
                                  {language === "en" ? item.product.nameEn : item.product.nameZh}
                                </p>
                                <p className="text-sm text-teal/60">
                                  {text.quantity}: {item.quantity} × HKD{" "}
                                  {parseFloat(item.unitPrice).toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-playfair font-bold text-teal">
                                  HKD {parseFloat(item.totalPrice).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeOrdersModal}
                className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal/80 transition-colors font-lora font-semibold"
              >
                {text.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
