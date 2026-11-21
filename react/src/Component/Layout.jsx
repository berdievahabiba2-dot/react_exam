
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Contacts", path: "/contacts", icon: "👥" },
    { name: "Debts", path: "/debts", icon: "💰" },
  ];

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-gray-200 bg-white p-5">
        <h1 className="mb-2 text-2xl font-bold text-blue-600">DebtFlow</h1>
        <p className="mb-10 text-sm text-gray-400">Personal Finance</p>
        <p className="mb-3 text-xs font-semibold uppercase text-gray-400">Menu</p>
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="ml-60 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;