"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { signOut } from "@/auth";

export async function signupAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password) {
      return { success: false, error: "Please provide name, email, and password." };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "An account with this email address already exists." };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // If first user, make ADMIN, otherwise check email pattern or default to WAREHOUSE_STAFF
    const userCount = await prisma.user.count();
    let assignedRole: UserRole = UserRole.WAREHOUSE_STAFF;
    if (userCount === 0 || email.includes("admin")) {
      assignedRole = UserRole.ADMIN;
    } else if (email.includes("manager")) {
      assignedRole = UserRole.INVENTORY_MANAGER;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: assignedRole,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Welcome to StockSense",
        message: `Your account has been provisioned with role: ${assignedRole.replace("_", " ")}.`,
        type: "SYSTEM",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup failed:", error);
    return { success: false, error: error.message || "Failed to create account." };
  }
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();

    if (!email) {
      return { success: false, error: "Please enter your registered email address." };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return generic message for privacy, but succeed
      return {
        success: true,
        message: "If that email is registered, a 6-digit OTP verification code has been dispatched.",
        email,
      };
    }

    // Rate limit: check recent tokens in last 2 minutes
    const recentToken = await prisma.otpToken.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentToken) {
      return {
        success: false,
        error: "Please wait at least 2 minutes before requesting another OTP.",
      };
    }

    // Generate random 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.otpToken.create({
      data: {
        email,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    console.log(`[STOCKSENSE AUTH] Password reset OTP for ${email}: ${rawOtp}`);

    return {
      success: true,
      message: "6-digit OTP has been generated. (In development mode, check console/screen).",
      devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
      email,
    };
  } catch (error: any) {
    console.error("Forgot password failed:", error);
    return { success: false, error: error.message || "Failed to generate reset OTP." };
  }
}

export async function verifyOtpAction(email: string, otp: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !cleanOtp || cleanOtp.length !== 6) {
      return { success: false, error: "Please provide a valid 6-digit verification code." };
    }

    // Find latest valid unexpired OTP token for this email
    const tokenRecord = await prisma.otpToken.findFirst({
      where: {
        email: cleanEmail,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return { success: false, error: "Verification code is expired or invalid. Please request a new one." };
    }

    // Check maximum attempts (brute force protection)
    if (tokenRecord.attempts >= 5) {
      return { success: false, error: "Too many failed attempts. This OTP has been invalidated. Please request a new code." };
    }

    // Increment attempts
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify code
    const isValid = await bcrypt.compare(cleanOtp, tokenRecord.codeHash);
    if (!isValid) {
      return { success: false, error: `Invalid code. ${4 - tokenRecord.attempts} attempts remaining.` };
    }

    // Mark used
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Generate reset verification ticket (hash of record id + email)
    const resetTicket = Buffer.from(`${tokenRecord.id}:${cleanEmail}:${Date.now()}`).toString("base64");

    return {
      success: true,
      resetTicket,
    };
  } catch (error: any) {
    console.error("Verify OTP failed:", error);
    return { success: false, error: error.message || "Failed to verify code." };
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const resetTicket = formData.get("resetTicket") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !resetTicket || !newPassword) {
      return { success: false, error: "All fields are required." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    // Verify reset ticket
    const decoded = Buffer.from(resetTicket, "base64").toString("utf-8");
    const [tokenId, ticketEmail, timestamp] = decoded.split(":");

    if (ticketEmail !== email || Date.now() - parseInt(timestamp, 10) > 30 * 60 * 1000) {
      return { success: false, error: "Reset session has expired. Please restart the forgot-password flow." };
    }

    // Verify token was actually marked used
    const tokenRecord = await prisma.otpToken.findUnique({
      where: { id: tokenId },
    });

    if (!tokenRecord || !tokenRecord.usedAt || tokenRecord.email !== email) {
      return { success: false, error: "Invalid reset session." };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Cleanup all tokens for this email
    await prisma.otpToken.deleteMany({
      where: { email },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password failed:", error);
    return { success: false, error: error.message || "Failed to reset password." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
