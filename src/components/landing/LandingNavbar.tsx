"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Boxes, Menu, X, ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#product-showcase" },
    { label: "Operations", href: "#operations" },
    { label: "Interactive Demo", href: "#interactive-demo" },
    { label: "Workflow", href: "#workflow" },
    { label: "Security & Roles", href: "#roles" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[rgba(70,75,113,0.12)] py-3 shadow-[0_2px_12px_rgba(70,75,113,0.04)]"
          : "bg-[#F2F2ED]/90 backdrop-blur-sm border-b border-[rgba(70,75,113,0.06)] py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#464B71] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Boxes className="h-4.5 w-4.5 text-[#73D0C3]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight text-[#464B71]">
              StockSense
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-[#73D0C3]/20 text-[#168FB3] rounded">
              v1.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-[#646981] hover:text-[#464B71] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#464B71] hover:text-[#168FB3] px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#168FB3] hover:bg-[#127492] px-3.5 py-2 rounded-lg transition shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#168FB3] px-2.5 py-1.5"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#464B71] hover:bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(70,75,113,0.12)] bg-[#FFFFFF] px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#464B71] hover:text-[#168FB3] py-2 border-b border-[rgba(70,75,113,0.06)]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-semibold text-white bg-[#168FB3] hover:bg-[#127492] py-2.5 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-semibold text-[#464B71] bg-[#F2F2ED] py-2.5 rounded-lg"
              >
                Sign in to Workspace
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
