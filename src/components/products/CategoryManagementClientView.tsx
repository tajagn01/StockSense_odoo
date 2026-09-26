"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderTree, Plus, Search, Trash2, ArrowLeft, X, AlertCircle } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/app/actions/productActions";

interface CategoryManagementClientViewProps {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    _count: { products: number };
  }>;
}

export function CategoryManagementClientView({ categories }: CategoryManagementClientViewProps) {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCategoryAction(formData);

    if (res.success) {
      setIsCreateOpen(false);
      window.location.reload();
    } else {
      setError(res.error || "Failed to create category.");
      setLoading(false);
    }
  };

  const handleDelete = async (category: any) => {
    if (category._count.products > 0) {
      alert(`Cannot delete '${category.name}' because ${category._count.products} product(s) are assigned to it. Reassign products first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete category '${category.name}'?`)) {
      const res = await deleteCategoryAction(category.id);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#464B71]">
              Product Categories
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#168FB3]/10 text-[#168FB3] border border-[#168FB3]/20">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#646981] mt-1">
            Organize catalog items into operational groupings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-3 py-2 border border-[rgba(70,75,113,0.15)] bg-white hover:bg-[#F2F2ED] text-xs font-semibold text-[#464B71] rounded-xl transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#646981]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category name or description..."
            className="w-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.12)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#464B71] placeholder:text-[#646981] focus:outline-none focus:border-[#168FB3]"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.12)] rounded-2xl p-5 shadow-sm hover:border-[#168FB3]/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#F2F2ED] text-[#168FB3]">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-[#464B71]">{cat.name}</h2>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-[#646981] hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  title={cat._count.products > 0 ? "Cannot delete: products depend on this category" : "Delete category"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-[#646981] line-clamp-2">
                {cat.description || "No description provided."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[rgba(70,75,113,0.08)] flex items-center justify-between text-xs">
              <span className="text-[#646981]">Associated Products</span>
              <span className="font-bold text-[#464B71] px-2 py-0.5 rounded-full bg-[#F2F2ED] border border-[rgba(70,75,113,0.10)] font-mono text-[11px]">
                {cat._count.products} items
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[rgba(70,75,113,0.15)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(70,75,113,0.10)] mb-4">
              <h2 className="text-base font-bold text-[#464B71]">Add Product Category</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-[#646981] hover:text-[#464B71]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Electrical Components"
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#464B71] mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Functional grouping details..."
                  className="w-full px-3 py-2 bg-[#F2F2ED]/50 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs text-[#464B71] focus:outline-none focus:border-[#168FB3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-[rgba(70,75,113,0.15)] rounded-xl text-xs font-semibold text-[#646981] hover:bg-[#F2F2ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#168FB3] hover:bg-[#127492] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
