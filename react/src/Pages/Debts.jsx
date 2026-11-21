
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/api";
import Payments from "./Payments";
import {Plus,Search,Pencil, Trash2, X,Wallet, RefreshCw,CreditCard, CalendarDays, AlertCircle,} from "lucide-react";
const initialForm = {
  contact_id: "",
  direction: "they_owe_me",
  amount: "",
  currency: "TJS",
  description: "",
  due_date: "",
};
const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterDirection, setFilterDirection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState(initialForm);
  const getDebts = useCallback(async () => {
    try {
      setError("");
      const res = await api.get("/debts");
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.debts || [];
      setDebts(list);
    } catch (err) {
      console.log("GET DEBTS ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not load debts"
      );
    }
  }, []);

  const getContacts = useCallback(async () => {
    try {
      const res = await api.get("/contacts");
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : data?.data || data?.contacts || [];

      setContacts(list);
    } catch (err) {
      console.log("GET CONTACTS ERROR:", err.response?.data || err);
      setError("Could not load contacts");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([getDebts(), getContacts()]);
    setLoading(false);
  }, [getDebts, getContacts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingDebt(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };
  const openEditModal = (debt) => {
    setError("");
    setEditingDebt(debt);
    setForm({
      contact_id: debt.contact_id || "",
      direction: debt.direction || "they_owe_me",
      amount: String(debt.amount ?? ""),
      currency: debt.currency || "TJS",
      description: debt.description || "",
      due_date: debt.due_date
        ? String(debt.due_date).slice(0, 10)
        : "",
    });

    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    resetForm();
  };

  const saveDebt = async (e) => {
    e.preventDefault();
    if (!form.contact_id) {
      setError("Please select a contact");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!form.due_date) {
      setError("Please select due date");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        contact_id: form.contact_id,
        direction: form.direction,
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description.trim(),
        due_date: form.due_date,
      };

      if (editingDebt) {
        await api.patch(`/debts/${editingDebt.id}`, payload);
      } else {
        await api.post("/debts", payload);
      }
      setOpen(false);
      resetForm();
      await getDebts();
    } catch (err) {
      console.log("SAVE DEBT ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not save debt"
      );
    } finally {
      setSaving(false);
    }
  };

  
const deleteDebt = async (id) => {
  try {
    setDeletingId(id);
    setError("");

    await api.delete(`/debts/${id}`);

    // Дарҳол аз рӯйхат нест мешавад
    setDebts((prev) =>
      prev.filter((debt) => debt.id !== id)
    );

    // Агар ҳамин қарз интихоб шуда бошад,
    // қисми Payments низ пӯшида мешавад
    if (selectedDebtId === id) {
      setSelectedDebtId(null);
    }

  } catch (err) {
    console.log("DELETE DEBT ERROR:", err.response?.data || err);

    setError(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Could not delete debt"
    );
  } finally {
    setDeletingId(null);
  }
};


  const formatMoney = (amount, currency) => {return `${Number(amount || 0).toFixed(2)} ${currency || "TJS"}`;};
  const getStatusStyle = (status) => {
    switch (String(status || "pending").toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-blue-100 text-blue-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const filteredDebts = debts.filter((debt) => {
    const contact = contacts.find((item) => item.id === debt.contact_id);
    const contactName = contact?.name || "Unknown contact";
    const matchesSearch = contactName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDirection =
      filterDirection === "all" ||
      debt.direction === filterDirection;

    const matchesStatus =
      filterStatus === "all" ||
      String(debt.status || "pending").toLowerCase() === filterStatus;
    return matchesSearch && matchesDirection && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Debts</h1>
          <p className="mt-2 text-gray-500">Manage your debts and payments</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh</button>
          <button type="button" onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"><Plus size={19} />Add Debt</button>
        </div>
      </div>
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600"><AlertCircle size={20} />{error}</div>
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contact..." className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"/>
        </div>

        <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
          <option value="all">All directions</option>
          <option value="they_owe_me">They owe me</option>
          <option value="i_owe_them">I owe them</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Wallet size={22} /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">All Debts</h2>
              <p className="text-sm text-gray-400">Your debt transactions</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">{filteredDebts.length} Debts</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500"><RefreshCw className="mx-auto mb-3 animate-spin" size={28} />Loading debts...</div>
        ) : filteredDebts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-3 text-5xl">💰</div>
            <h3 className="text-lg font-semibold text-gray-700">
              {debts.length === 0 ? "No debts yet" : "No matching debts"}
            </h3>
            <p className="mt-2 text-gray-400">{debts.length === 0
                ? "Click Add Debt to create your first debt."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-500">
                  <th className="p-4">Contact</th>
                  <th className="p-4">Direction</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDebts.map((debt) => {
                  const contact = contacts.find(
                    (item) => item.id === debt.contact_id
                  );

                  return (
                    <tr key={debt.id} className="border-t transition hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-800">{contact?.name || "Unknown contact"}</td>
                      <td className="p-4 text-sm text-gray-600">{debt.direction === "they_owe_me"
                          ? "They owe me"
                          : "I owe them"}
                      </td>
                      <td className="p-4 font-bold text-gray-800">{formatMoney(debt.amount, debt.currency)}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {debt.due_date
                            ? String(debt.due_date).slice(0, 10)
                            : "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(debt.status)}`}>{debt.status || "pending"}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button type="button" title="Payments" onClick={() => setSelectedDebtId(debt.id)} className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 transition hover:bg-indigo-100">
                            <CreditCard size={17} />
                          </button>
                          <button type="button" title="Edit debt" onClick={() => openEditModal(debt)} className="rounded-lg bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100"><Pencil size={17} /></button>
                          <button type="button" title="Delete debt" disabled={deletingId === debt.id} onClick={() => deleteDebt(debt.id)} className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 disabled:opacity-50">
                            {deletingId === debt.id ? (
                              <RefreshCw size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Debt Payments</h2>
              <p className="text-sm text-gray-400">View and add payments for this debt</p>
            </div>
            <button type="button" onClick={() => setSelectedDebtId(null)} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"><X size={20} /></button>
          </div>

          <Payments debtId={selectedDebtId} onPaymentAdded={getDebts}/>
        </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{editingDebt ? "Edit Debt" : "Add New Debt"}</h2>
                <p className="mt-1 text-sm text-gray-500">Enter debt information below.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={22} /> </button>
            </div>
              <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            <form onSubmit={saveDebt} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Select Contact *</label>
                <select required name="contact_id" value={form.contact_id} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500">
                  <option value="">Choose a contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
                {contacts.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">No contacts found. Please add a contact first.</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Direction *</label>
                <select name="direction" value={form.direction} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500">
                  <option value="they_owe_me">They owe me</option>
                  <option value="i_owe_them">I owe them</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Amount *</label>
                  <input required type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter amount" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Currency *</label>
                  <select name="currency" value={form.currency} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500">
                    <option value="TJS">TJS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="RUB">RUB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Write a description..." className="w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Due Date *</label>
                <input required type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50" > Cancel</button>
                <button type="submit" disabled={saving || contacts.length === 0} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving
                    ? "Saving..."
                    : editingDebt
                    ? "Update Debt"
                    : "Save Debt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Debts;