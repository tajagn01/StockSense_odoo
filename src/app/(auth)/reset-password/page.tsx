"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/authActions";
import { Boxes, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const ticket = searchParams.get("ticket") || "";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("email", email);
    formData.append("resetTicket", ticket);

    const res = await resetPasswordAction(formData);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(res.error || "Failed to reset password.");
      setLoading(false);
    }
  };

  if (!email || !ticket) {
    return (
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl shadow-sm p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#464B71] mb-2">Invalid Reset Link</h2>
        <p className="text-xs text-[#646981] mb-6">
          This password reset request is missing required verification parameters or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center bg-[#168FB3] text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Request New Code
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#464B71]">Set New Password</h1>
        <p className="text-xs text-[#646981] mt-1">
          Create a secure new password for <strong className="text-[#464B71]">{email}</strong>.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 rounded-xl bg-[#73D0C3]/20 border border-[#73D0C3]/40 text-[#464B71] text-xs flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#168FB3]" />
          <span>Password reset successful! Redirecting to login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
            New Password (minimum 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-4 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] placeholder:text-[#646981]/70 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#464B71] mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646981]" />
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-4 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] placeholder:text-[#646981]/70 focus:outline-none focus:border-[#168FB3] focus:ring-1 focus:ring-[#168FB3] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-[#168FB3] hover:bg-[#127492] text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Updating Password..." : "Save Password & Sign In"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={<div className="text-xs text-[#646981]">Loading reset password form...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
