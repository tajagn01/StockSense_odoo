"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Boxes, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Warehouse, X, Command } from "lucide-react";
import { searchWorkspaceAction, SearchResult } from "@/app/actions/searchActions";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchWorkspaceAction(query);
      setResults(res);
      setLoading(false);
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    handleClose();
    router.push(result.url);
  };

  if (!isOpen) return null;

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "Product":
        return <Boxes className="h-4 w-4 text-[#168FB3]" />;
      case "Receipt":
        return <ArrowDownToLine className="h-4 w-4 text-[#73D0C3]" />;
      case "Delivery":
        return <ArrowUpFromLine className="h-4 w-4 text-[#464B71]" />;
      case "Transfer":
        return <ArrowLeftRight className="h-4 w-4 text-[#168FB3]" />;
      case "Warehouse":
      case "Location":
        return <Warehouse className="h-4 w-4 text-[#646981]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(70,75,113,0.10)] bg-[#FFFFFF]">
          <Search className="h-5 w-5 text-[#646981] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length < 2) setResults([]);
            }}
            placeholder="Search SKU, products, receipts, deliveries, transfers, warehouses..."
            className="flex-1 bg-transparent text-sm text-[#464B71] placeholder:text-[#646981] focus:outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 text-[#646981] hover:text-[#464B71] rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="p-4 text-center text-xs text-[#646981]">
              Searching operational database...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-6 text-center text-xs text-[#646981]">
              No inventory records found matching &ldquo;<span className="font-semibold text-[#464B71]">{query}</span>&rdquo;.
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="p-5 text-center text-xs text-[#646981]">
              Type at least 2 characters to search across products, operations, and facilities.
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                selectedIndex === idx
                  ? "bg-[#168FB3]/10 text-[#464B71]"
                  : "hover:bg-[#F2F2ED] text-[#464B71]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#F2F2ED] shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#464B71]">{item.title}</div>
                  <div className="text-[11px] text-[#646981]">{item.subtitle}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(70,75,113,0.12)] text-[#646981] bg-[#FFFFFF]">
                {item.type}
              </span>
            </div>
          ))}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2 bg-[#F2F2ED] border-t border-[rgba(70,75,113,0.10)] flex items-center justify-between text-[11px] text-[#646981]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-[rgba(70,75,113,0.15)] text-[10px]">
              ↑↓
            </span>
            <span>to navigate</span>
            <span className="inline-flex items-center gap-1 font-mono bg-white px-1.5 py-0.5 rounded border border-[rgba(70,75,113,0.15)] text-[10px] ml-2">
              Enter
            </span>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
