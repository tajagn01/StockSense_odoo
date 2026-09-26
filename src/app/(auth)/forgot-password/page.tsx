"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPasswordAction } from "@/app/actions/authActions";
import { Boxes, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevOtp(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPasswordAction(formData);

    if (res.success) {
      setMessage(res.message || "OTP code has been generated.");
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 2500);
    } else {
      setError(res.error || "Failed to process request.");
      setLoading(false);
    }
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

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#464B71]">Reset Password</h1>
          <p className="text-xs text-[#646981] mt-1">
            Enter your registered email to receive a 6-digit one-time verification code.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-5 p-3 rounded-xl bg-[#73D0C3]/20 border border-[#73D0C3]/40 text-[#464B71] text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#168FB3]" />
              <span>{message}</span>
            </div>
            {devOtp && (
              <div className="p-2 bg-white/80 rounded-lg border border-[rgba(70,75,113,0.12)] text-xs font-mono font-bold text-[#168FB3] text-center">
                Dev OTP: {devOtp} (Redirecting to verification...)
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
              Registered Work Email
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#168FB3] hover:bg-[#127492] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Generating OTP..." : "Send Verification Code"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#646981] hover:text-[#464B71] font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
