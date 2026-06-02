"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Phone } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  customerName: string;
  phone: string;
  productName: string;
  categoryName: string;
  status: string;
  createdAt: string;
  estimatedPrice: number | null;
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد المراجعة", color: "text-yellow-500", icon: Clock },
  "in-progress": { label: "قيد التنفيذ", color: "text-blue-500", icon: Package },
  completed: { label: "تم التنفيذ", color: "text-green-500", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "text-red-500", icon: XCircle },
};

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/track?phone=${phone}`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (error) {
      console.error("Error tracking order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-arabic py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
          >
            <Package className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent"
          >
            تتبع حالة طلبك
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            أدخل رقم هاتفك المسجل لمتابعة حالة طلباتك الحالية والسابقة
          </motion.p>
        </div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="relative max-w-md mx-auto mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-1 shadow-2xl overflow-hidden">
              <div className="flex items-center px-4 text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف (مثلاً: 010...)"
                className="flex-1 bg-transparent py-4 text-lg focus:outline-none placeholder:text-slate-600"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>بحث</span>
              </button>
            </div>
          </div>
        </motion.form>

        {/* Results */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {searched ? (
              orders.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6"
                >
                  {orders.map((order, index) => {
                    const status = statusMap[order.status] || statusMap.pending;
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 hover:border-primary/30 transition-all duration-500"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors">
                              <Package className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-1">{order.productName}</h3>
                              <p className="text-slate-500 text-sm mb-2">{order.categoryName}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                                <span className="text-white/10">|</span>
                                <span className="flex items-center gap-1">
                                  ID: {order.id.slice(-6).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="font-bold text-sm">{status.label}</span>
                            </div>
                            {order.estimatedPrice && (
                              <p className="text-primary font-bold">
                                {order.estimatedPrice} ج.م
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar (Visual) */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-2 px-1">
                            <span>طلب جديد</span>
                            <span>قيد التنفيذ</span>
                            <span>مكتمل</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: order.status === 'pending' ? '33%' : 
                                       order.status === 'in-progress' ? '66%' : 
                                       order.status === 'completed' ? '100%' : '0%' 
                              }}
                              className={`h-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-primary'}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl"
                >
                  <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لم يتم العثور على طلبات</h3>
                  <p className="text-slate-500">تأكد من إدخال رقم الهاتف بشكل صحيح</p>
                </motion.div>
              )
            ) : null}
          </AnimatePresence>
        </div>

        {/* Support Link */}
        <div className="text-center mt-12">
          <Link 
            href="/contact" 
            className="text-slate-500 hover:text-primary transition-colors text-sm"
          >
            تواجه مشكلة؟ تواصل مع الدعم الفني
          </Link>
        </div>
      </div>
    </div>
  );
}
