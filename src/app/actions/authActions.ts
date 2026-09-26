"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { sendPasswordResetOtp } from "@/lib/email";

export async function loginAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Please enter your work email and password." };
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email address or password. Please verify credentials." };
        default:
          return { success: false, error: "Authentication failed. Please check credentials." };
      }
    }
    // Next.js redirect mechanism throws internal NEXT_REDIRECT error which must bubble up
    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Login action error:", error);
    return { success: false, error: "Invalid email address or password. Please verify credentials." };
  }
}

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

    // Security rule: Public signup ALWAYS assigns WAREHOUSE_STAFF.
    // Privileged accounts (ADMIN, INVENTORY_MANAGER) must be provisioned via database seed or admin functionality.
    const assignedRole: UserRole = UserRole.WAREHOUSE_STAFF;

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
    return { success: false, error: "Failed to create account. Please check inputs and try again." };
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

    // Invalidate any previously issued unused OTPs for this email
    await prisma.otpToken.updateMany({
      where: {
        email,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate cryptographically random 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.otpToken.create({
      data: {
        email,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Dispatch via email service
    await sendPasswordResetOtp({ to: email, otp: rawOtp });

    return {
      success: true,
      message: "If that email is registered, a 6-digit OTP verification code has been dispatched.",
      devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
      email,
    };
  } catch (error: any) {
    console.error("Forgot password failed:", error);
    return { success: false, error: "Failed to generate reset OTP. Please try again." };
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

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate any previous unused password reset tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: {
        email: cleanEmail,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate a secure, opaque cryptographically random 256-bit reset token
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lifetime

    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        tokenHash,
        expiresAt,
      },
    });

    return {
      success: true,
      resetTicket: rawResetToken,
    };
  } catch (error: any) {
    console.error("Verify OTP failed:", error);
    return { success: false, error: "Failed to verify code. Please try again." };
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

    // Cryptographic verification of server-issued reset token
    const tokenHash = crypto.createHash("sha256").update(resetTicket.trim()).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetRecord ||
      resetRecord.usedAt !== null ||
      resetRecord.expiresAt < new Date() ||
      resetRecord.email !== email
    ) {
      return {
        success: false,
        error: "Reset session has expired or is invalid. Please restart the password reset flow.",
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atomic update of user password and token invalidation
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email },
        data: { passwordHash },
      });

      // Mark reset ticket used
      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all tokens for this email
      await tx.otpToken.deleteMany({
        where: { email },
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password failed:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
