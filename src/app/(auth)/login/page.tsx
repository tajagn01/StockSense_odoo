"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/authActions";
import { Boxes, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);

      if (!res?.success) {
        setError(res?.error || "Invalid email address or password. Please verify credentials.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      setError(err?.message || "An unexpected error occurred during authentication.");
      setLoading(false);
    }
  };

  const setCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F2F2ED] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="h-10 w-10 rounded-xl bg-[#464B71] flex items-center justify-center text-white shadow-sm">
          <Boxes className="h-5 w-5 text-[#73D0C3]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-[#464B71]">
            StockSense
          </span>
          <span className="text-[11px] text-[#646981] font-medium tracking-wider">
            Operational Inventory Workspace
          </span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#464B71]">Sign in to your account</h1>
          <p className="text-xs text-[#646981] mt-1">
            Access real-time inventory, receipts, deliveries, and stock ledger.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@stocksense.io"
                className="w-full pl-9 pr-4 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] placeholder:text-[#646981]/70 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#464B71]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-[#168FB3] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] placeholder:text-[#646981]/70 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#168FB3] hover:bg-[#127492] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Workspace"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Seed Accounts Helper */}
        <div className="mt-6 pt-5 border-t border-[rgba(70,75,113,0.10)]">
          <p className="text-[11px] font-semibold text-[#464B71] mb-2">Demo Operator Accounts:</p>
          <div className="space-y-1.5 text-[10px] text-[#646981] bg-[#F2F2ED]/60 p-2.5 rounded-lg border border-[rgba(70,75,113,0.08)]">
            <div
              className="flex justify-between items-center cursor-pointer hover:text-[#168FB3]"
              onClick={() => setCredentials("admin@stocksense.io", "StockSense123!")}
            >
              <span><strong className="text-[#464B71]">Admin:</strong> admin@stocksense.io</span>
              <span className="font-mono text-[#168FB3] font-bold">Fill</span>
            </div>
            <div
              className="flex justify-between items-center cursor-pointer hover:text-[#168FB3]"
              onClick={() => setCredentials("manager@stocksense.io", "StockSense123!")}
            >
              <span><strong className="text-[#464B71]">Manager:</strong> manager@stocksense.io</span>
              <span className="font-mono text-[#168FB3] font-bold">Fill</span>
            </div>
            <div
              className="flex justify-between items-center cursor-pointer hover:text-[#168FB3]"
              onClick={() => setCredentials("staff@stocksense.io", "StockSense123!")}
            >
              <span><strong className="text-[#464B71]">Staff:</strong> staff@stocksense.io</span>
              <span className="font-mono text-[#168FB3] font-bold">Fill</span>
            </div>
            <div className="text-[9px] text-[#646981] pt-1 border-t border-[rgba(70,75,113,0.06)]">
              Password for all demo accounts: <code className="bg-white px-1 py-0.5 rounded text-[#464B71]">StockSense123!</code>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-[#646981]">
            Need a new workspace account?{" "}
            <Link href="/signup" className="text-[#168FB3] font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
