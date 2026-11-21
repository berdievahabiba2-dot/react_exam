
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {LayoutDashboard,Wallet,TrendingUp,TrendingDown,Users,Clock,RefreshCw,LogOut,CalendarDays,ArrowUpRight,AlertCircle,} from "lucide-react";
import { api } from "../api/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const getSummary = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      console.log("Dashboard error:", err.response?.data || err);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);
  useEffect(() => {
    getSummary();
  }, [getSummary]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const formatMoney = (amount) => {
    return `$${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "No date";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const theyOweMe = Number(
    summary?.outstanding?.they_owe_me || 0
  );

  const iOweThem = Number(
    summary?.outstanding?.i_owe_them || 0
  );

  const totalDebts = theyOweMe + iOweThem;

  const netBalance = Number(
    summary?.outstanding?.net_balance || 0
  );

  const stats = [
    {
      title: "Total Debts",
      value: formatMoney(totalDebts),
      icon: Wallet,
      color: "bg-blue-100 text-blue-600",
      description: "Total outstanding amount",
    },
    {
      title: "They Owe Me",
      value: formatMoney(theyOweMe),
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      description: "Money you should receive",
    },
    {
      title: "I Owe Them",
      value: formatMoney(iOweThem),
      icon: TrendingDown,
      color: "bg-red-100 text-red-600",
      description: "Money you should pay",
    },
    {
      title: "Pending Debts",
      value: summary?.counts?.pending || 0,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
      description: "Waiting for payment",
    },
    {
      title: "Total Transactions",
      value: summary?.counts?.total || 0,
      icon: LayoutDashboard,
      color: "bg-purple-100 text-purple-600",
      description: "All debt transactions",
    },
    {
      title: "Total Contacts",
      value: summary?.contacts_count || 0,
      icon: Users,
      color: "bg-pink-100 text-pink-600",
      description: "Your saved contacts",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5">
              <Wallet className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-800 sm:text-2xl">DebtFlow</h1>
              <p className="hidden text-xs text-gray-400 sm:block">Personal Finance Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="font-semibold text-gray-800">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400">Welcome back!</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:px-4">
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Dashboard Overview</h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Manage your debts and financial activities.</p>
          </div>
          <button onClick={() => getSummary(true)}disabled={loading || refreshing}className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""}/>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
            <p className="mt-4 font-medium text-gray-500">Loading dashboard...</p>
          </div>
        )}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={22} />
              <p className="font-semibold">{error}</p>
            </div>
            <button onClick={() => getSummary()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Try Again</button>
          </div>
        {!loading && !error && summary && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{item.title}</p>
                        <h3 className="mt-3 text-2xl font-bold text-gray-800 sm:text-3xl">{item.value}</h3>
                      </div>
                      <div className={`rounded-xl p-3 ${item.color}`}><Icon size={25} /></div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-7 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white shadow-lg sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-sm font-medium text-emerald-100">Net Balance</p>
                  <h3 className="mt-3 text-3xl font-bold sm:text-4xl">{formatMoney(netBalance)}</h3>
                  <p className="mt-3 text-sm text-emerald-100">Your current net outstanding balance</p>
                </div>
                <div className="rounded-2xl bg-white/20 p-4">
                  <TrendingUp size={35} />
                </div>
              </div>
            </div>
            <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Upcoming Due</h3>
                  <p className="mt-1 text-sm text-gray-400">Your upcoming debt payments</p>
                </div>
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600"><CalendarDays size={23} /></div>
              </div>
              {summary.upcoming_due?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {summary.upcoming_due.map((item, index) => (
                    <div key={item.id || index} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Users size={20} /></div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.contact_name || "Contact"}</p>
                          <p className="mt-1 text-sm text-gray-400">Due: {formatDate(item.due_date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">{formatMoney(item.amount)}</p>
                        <p className="mt-1 text-xs text-gray-400">Upcoming payment</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 py-10 text-center">
                  <CalendarDays size={35}className="mx-auto text-gray-300"/>
                  <p className="mt-3 font-medium text-gray-500">No upcoming payments</p>
                  <p className="mt-1 text-sm text-gray-400">Your upcoming payments will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">No dashboard data available.</p>
          </div>
        <footer className="mt-10 border-t border-gray-200 py-6 text-center text-sm text-gray-400">© {new Date().getFullYear()} DebtFlow. All rights reserved.</footer>
      </main>
    </div>
  );
};
export default Dashboard;