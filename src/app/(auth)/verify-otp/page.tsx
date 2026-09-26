"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAction } from "@/app/actions/authActions";
import { Boxes, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await verifyOtpAction(email, otp);

    if (res.success && res.resetTicket) {
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&ticket=${encodeURIComponent(res.resetTicket)}`
      );
    } else {
      setError(res.error || "Invalid or expired verification code.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#464B71]">Verify OTP Code</h1>
        <p className="text-xs text-[#646981] mt-1">
          Enter the 6-digit code dispatched to{" "}
          <strong className="text-[#464B71]">{email || "your email"}</strong>.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!emailParam && (
          <div>
            <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@stocksense.io"
              className="w-full px-4 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] placeholder:text-[#646981]/70 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
            6-Digit Verification Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full pl-9 pr-4 py-2.5 tracking-widest font-mono text-center font-bold text-base bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-[#464B71] placeholder:text-[#646981]/40 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-[#168FB3] hover:bg-[#127492] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Validating Code..." : "Confirm & Proceed to Password Reset"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-[#646981] hover:text-[#464B71] font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change Email
        </Link>
        <Link
          href="/login"
          className="text-[#168FB3] hover:underline font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
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

      <Suspense fallback={<div className="text-xs text-[#646981]">Loading verification screen...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
