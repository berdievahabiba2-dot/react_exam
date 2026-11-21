
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import {Eye,EyeOff,User, Mail, Lock, Wallet,} from "lucide-react";
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name) {
      setError("Please enter your full name");
      return;}
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;}
    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { user, accessToken, refreshToken } = response.data;
      if (!user || !accessToken || !refreshToken) {
        throw new Error(
          "Registration succeeded but authentication data is incomplete"
        );
      }
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:min-h-[650px] md:grid-cols-2">
        <div className="flex flex-col justify-between bg-[#142d27] p-8 text-white sm:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#a4d4b5] text-2xl font-bold text-[#142d27]">D</div>
            <h2 className="text-2xl font-bold">DebtFlow</h2>
          </div>
          <div className="my-12 md:my-0">
            <p className="mb-5 text-xs tracking-[3px] text-[#a4d4b5]">SMART FINANCIAL MANAGEMENT</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">Start your<br />financial journey.</h1>
            <p className="max-w-sm leading-8 text-gray-300">Create your account and manage your debts,track payments and organize your finances in one place.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-[#a4d4b5]">
              <Wallet size={20} />
              <span>Take control of your finances.</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">© 2026 DebtFlow. All rights reserved.</p>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-12">
          <div className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-[#192b25]">Create account</h1>
            <p className="text-sm text-gray-500">Enter your details to get started.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#273a32]">Full name</label>
              <div className="relative">
                <User size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" autoComplete="name" required className="h-13 w-full rounded-lg border border-gray-200 pl-11 pr-4 outline-none transition focus:border-[#36866a] focus:ring-2 focus:ring-[#36866a]/10"/>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#273a32]">Email address</label>
              <div className="relative">
                <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" autoComplete="email" required className="h-13 w-full rounded-lg border border-gray-200 pl-11 pr-4 outline-none transition focus:border-[#36866a] focus:ring-2 focus:ring-[#36866a]/10"/>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#273a32]">Password</label>
              <div className="relative">
                <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete="new-password" minLength={6} required className="h-13 w-full rounded-lg border border-gray-200 pl-11 pr-12 outline-none transition focus:border-[#36866a] focus:ring-2 focus:ring-[#36866a]/10"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#246b51]" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">Minimum 6 characters.</p>
            </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
            <button type="submit" disabled={loading} className="h-13 w-full cursor-pointer rounded-lg bg-[#246b51] font-semibold text-white transition duration-200 hover:bg-[#194f3b] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">Already have an account?<button type="button" onClick={() => navigate("/login")} className="ml-1 font-semibold text-[#246b51] hover:underline">Sign in</button></p>
        </div>
      </div>
    </div>
  );
};
export default Register;