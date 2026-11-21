
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/api";
import {Plus,Wallet,TrendingUp,Clock,CalendarDays, RefreshCw,X,CreditCard,AlertCircle,} from "lucide-react";

const Payments = ({ debtId, onPaymentAdded }) => {
  const [payments, setPayments] = useState([]);
  const [debt, setDebt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    note: "",
    paid_at: new Date().toISOString().slice(0, 16),
  });

  const getPayments = useCallback(async () => {
    if (!debtId) return;
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/debts/${debtId}/payments`
      );
      const data = response.data;
      setPayments(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.payments)
          ? data.payments
          : []
      );
    } catch (err) {
      console.log("GET PAYMENTS ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  }, [debtId]);

  const getDebt = useCallback(async () => {
    if (!debtId) return;
    try {
      const response = await api.get("/debts");
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.debts || [];
      const selected = list.find(
        (item) => item.id === debtId
      );

      setDebt(selected || null);
    } catch (err) {
      console.log("GET DEBT ERROR:", err.response?.data || err);
    }
  }, [debtId]);

  const loadData = useCallback(async () => {
    await Promise.all([
      getPayments(),
      getDebt(),
    ]);
  }, [getPayments, getDebt]);

  useEffect(() => {
    setPayments([]);
    setDebt(null);
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatMoney = (amount) => {
    return `${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${debt?.currency || "TJS"}`;
  };

  const totalPaid = payments.reduce((total, payment) => total + Number(payment.amount || 0),0);
  const originalAmount = Number(debt?.amount || 0);
  const remainingBalance = Math.max(0,originalAmount - totalPaid);
  const progress =
    originalAmount > 0
      ? Math.min((totalPaid / originalAmount) * 100, 100)
      : 0;

  const addPayment = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Payment amount must be greater than 0");
      return;
    }
    if (amount > remainingBalance) {
      setError(`Payment cannot exceed remaining balance: ${formatMoney(remainingBalance)}`);
      return;
    }
    if (!form.paid_at) {
      setError("Please select payment date");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        amount,
        note: form.note.trim() || undefined,
        paid_at: new Date(form.paid_at).toISOString(),
      };

      await api.post(
        `/debts/${debtId}/payments`,
        payload
      );

      setForm({
        amount: "",
        note: "",
        paid_at: new Date().toISOString().slice(0, 16),
      });

      setOpen(false);
      await loadData();
      if (onPaymentAdded) {
        await onPaymentAdded();
      }
    } catch (err) {
      console.log("ADD PAYMENT ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to add payment"
      );
    } finally {
      setSaving(false);
    }
  };
  if (!debtId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <CreditCard size={40} className="mx-auto mb-3 text-gray-400"/>
        <h2 className="text-lg font-semibold text-gray-700">Payments</h2>
        <p className="mt-2 text-sm text-gray-500">Барои дидани пардохтҳо аввал қарзро интихоб кун.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>
          <p className="mt-1 text-sm text-gray-500">Manage and track your debt payments.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/>Refresh</button>
          <button type="button" onClick={() => {
              setError("");
              setOpen(!open);
            }}
            disabled={remainingBalance <= 0 && originalAmount > 0}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={18} />Add Payment</button>
        </div>
      </div>
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={20} />{error}
        </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Original Debt</p>
            <Wallet className="text-blue-500" size={22} />
          </div>
          <h3 className="mt-3 text-2xl font-bold text-gray-800">{formatMoney(originalAmount)}</h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Paid</p>
            <TrendingUp className="text-green-500" size={22} />
          </div>
          <h3 className="mt-3 text-2xl font-bold text-green-600">{formatMoney(totalPaid)}</h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Remaining Balance</p>
            <Clock className="text-orange-500" size={22} />
          </div>
          <h3 className="mt-3 text-2xl font-bold text-orange-600">{formatMoney(remainingBalance)}</h3>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800">Payment Progress</h3>
          <span className="font-bold text-indigo-600">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}/></div>
        <p className="mt-3 text-sm text-gray-400">{formatMoney(totalPaid)} paid out of {formatMoney(originalAmount)}</p>
      </div>
        <form onSubmit={addPayment} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Add New Payment</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20} /></button>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Amount *</label>
            <input type="number" min="0.01" max={remainingBalance > 0 ? remainingBalance : undefined} step="0.01" required name="amount" value={form.amount} onChange={handleChange} placeholder="Enter payment amount" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"/>
            <p className="mt-1 text-xs text-gray-400">Remaining: {formatMoney(remainingBalance)}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Note</label>
            <textarea name="note" value={form.note} onChange={handleChange} placeholder="Payment description..." rows="3" className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"/>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Date *</label>
            <input type="datetime-local" required name="paid_at" value={form.paid_at} onChange={handleChange}className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"/>
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
            <button type="button" onClick={() => setOpen(false)}disabled={saving} className="rounded-lg bg-gray-100 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving || remainingBalance <= 0} className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving..." : "Save Payment"}</button>
          </div>
        </form>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800">All Payments</h3>
            <p className="mt-1 text-sm text-gray-400">{payments.length} payment records</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><CreditCard size={22} /></div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-500"><RefreshCw size={25} className="mx-auto mb-3 animate-spin"/>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard size={40} className="mx-auto mb-3 text-gray-300"/>
            <p className="font-semibold text-gray-600">No payments yet</p>
            <p className="mt-2 text-sm text-gray-400">Add your first payment to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Note</th>
                  <th className="p-4">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment.id || index} className="border-t border-gray-100 transition hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-bold text-green-600">{formatMoney(payment.amount)}</td>
                    <td className="p-4 text-gray-600">{payment.note || "—"}</td>
                    <td className="p-4 text-gray-600">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleString()
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Payments;