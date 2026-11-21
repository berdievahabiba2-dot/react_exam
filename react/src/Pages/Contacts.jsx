
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/api";
import {Plus,Search,Pencil,Trash2,X,Users,Phone,Mail,FileText,RefreshCw,AlertCircle,} from "lucide-react";

const initialForm = {name: "",phone: "",email: "",note: "",};
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(initialForm);
  const getContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contacts");
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.contacts)
        ? data.contacts
        : [];
      setContacts(list);
    } catch (err) {
      console.log("GET CONTACTS ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to load contacts"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingContact(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);

    setForm({
      name: contact.name || "",
      phone: contact.phone || "",
      email: contact.email || "",
      note: contact.note || "",
    });
    setError("");
    setOpen(true);
  };
  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    resetForm();
  };
  const saveContact = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const note = form.note.trim();
    if (!name) {
      setError("Please enter contact name");
      return;
    }
    
    const payload = {
      name,
      phone: phone || undefined,
      email: email || undefined,
      note: note || undefined,
    };
    try {
      setSaving(true);
      setError("");

      if (editingContact) {
        await api.patch(`/contacts/${editingContact.id}`, payload);
      } else {
        await api.post("/contacts", payload);
      }
      setOpen(false);
      resetForm();
      await getContacts();
    } catch (err) {
      console.log("SAVE CONTACT ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save contact"
      );
    } finally {
      setSaving(false);
    }
  };
 
const deleteContact = async (id) => {
  try {
    setDeletingId(id);
    setError("");
    await api.delete(`/contacts/${id}`);
    setContacts((prev) =>
      prev.filter((contact) => contact.id !== id)
    );
  } catch (err) {
    console.log("DELETE CONTACT ERROR:", err.response?.data || err);
    setError(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to delete contact"
    );
  } finally {
    setDeletingId(null);
  }
};


  const filteredContacts = contacts.filter((contact) => {
    const searchText = search.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchText) ||
      contact.phone?.toLowerCase().includes(searchText) ||
      contact.email?.toLowerCase().includes(searchText)
    );
  });
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Contacts</h1>
            <p className="mt-2 text-gray-500">Manage people who owe you or whom you owe.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={getContacts} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              <RefreshCw size={17} className={loading ? "animate-spin" : ""}/>Refresh</button>
            <button type="button" onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <Plus size={19} />Add Contact
            </button>
          </div>
        </div>
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            <AlertCircle size={20} />{error}
          </div>
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email..." className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"/>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Users size={23} /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">All Contacts</h2>
                <p className="text-sm text-gray-400">Your saved contacts</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">{filteredContacts.length} Contacts</span>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <RefreshCw size={28} className="mx-auto mb-3 animate-spin"/>Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={45} className="mx-auto mb-4 text-gray-300"/>
              <h3 className="text-lg font-semibold text-gray-700">
                {contacts.length === 0
                  ? "No contacts yet"
                  : "No contacts found"}
              </h3>
              <p className="mt-2 text-gray-400">
                {contacts.length === 0
                  ? "Click Add Contact to create your first contact."
                  : "Try another search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="group rounded-2xl border border-gray-200 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{contact.name?.charAt(0)?.toUpperCase() || "?"}</div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-gray-800">{contact.name}</h3>
                        <p className="text-xs text-gray-400">Contact</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">Active</span>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={17} className="shrink-0 text-blue-500" />
                      <span className="break-all">{contact.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail size={17} className="shrink-0 text-blue-500" />
                      <span className="break-all">{contact.email || "Not provided"}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <FileText size={17} className="mt-0.5 shrink-0 text-blue-500" />
                      <span className="break-words">{contact.note || "No note"}</span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <button type="button" onClick={() => openEditModal(contact)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"><Pencil size={16} />Edit</button>
                    <button type="button" disabled={deletingId === contact.id} onClick={() => deleteContact(contact.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50">
                      {deletingId === contact.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{editingContact ? "Edit Contact" : "Add New Contact"}</h2>
                <p className="mt-1 text-sm text-gray-500">Enter contact information below.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X size={22} />
              </button>
            </div>
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <form onSubmit={saveContact} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name *</label>
                <input required name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Phone</label>
                <input name="phone"value={form.phone} onChange={handleChange} placeholder="+992 900 000 000" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Note</label>
                <textarea name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Write something..." className="w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"/>
              </div>
              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving && (
                    <RefreshCw size={17} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingContact
                    ? "Update Contact"
                    : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Contacts;