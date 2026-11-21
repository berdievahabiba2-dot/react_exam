
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      console.log("Email:", email);
      console.log("Password length:", password.length);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("Login response:", response.status);
      const { user, accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Server did not return complete login data");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Token saved:", !!localStorage.getItem("accessToken"));
      console.log("Going to dashboard...");

      navigate("/dashboard");

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("SERVER ERROR:", err.response?.data);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-5">
      <div className="w-full max-w-5xl min-h-[600px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#142d27] text-white p-10 md:p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#a4d4b5] text-[#142d27] rounded-xl flex items-center justify-center text-2xl font-bold">D</div>
            <h2 className="text-2xl font-bold">DebtFlow</h2>
          </div>
          <div className="my-12 md:my-0">
            <p className="text-[#a4d4b5] text-xs tracking-[3px] mb-5">SMART FINANCIAL MANAGEMENT</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Take control of<br />your finances.</h1>
            <p className="text-gray-300 leading-8 max-w-sm">Manage your debts, track payments and keep your financiallife organized in one simple place.</p>
          </div>
          <p className="text-gray-400 text-xs">© 2026 DebtFlow. All rights reserved.</p>
        </div>
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#192b25] mb-3">Welcome back</h1>
            <p className="text-gray-500 text-sm">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 mb-6">
              <label className="text-sm font-semibold text-[#273a32]">Email address</label>
              <input type="email" value={email} placeholder="Enter your Email" onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full h-13 px-4 border border-gray-200 rounded-lg outline-none focus:border-[#36866a] focus:ring-2 focus:ring-[#36866a]/10 transition"/>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              <label className="text-sm font-semibold text-[#273a32]">Password</label>
              <input type="password" value={password} placeholder="Enter your Password" onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} className="w-full h-13 px-4 border border-gray-200 rounded-lg outline-none focus:border-[#36866a] focus:ring-2 focus:ring-[#36866a]/10 transition"/>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-5">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full h-13 bg-[#246b51] hover:bg-[#194f3b] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 cursor-pointer">{loading ? "Signing in..." : "Sign in"}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-8">Don't have an account?
            <button type="button" onClick={() => navigate("/register")} className="text-[#246b51] font-semibold ml-1 hover:underline">Create account</button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;