"use client";

import { useState, useEffect } from "react";
import { getAllTags, createTag, toggleTag, deleteTag } from "@/lib/actions/tags";
import type { Tag } from "@/lib/types";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getAllTags();
    setTags(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setMessage(null);

    const result = await createTag(newTagName);
    if (result.error) {
      setMessage(result.error);
    } else {
      setNewTagName("");
    }
    await refresh();
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await toggleTag(id, !currentActive);
    await refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    setMessage(null);
    const result = await deleteTag(id);
    if (result.error) setMessage(result.error);
    await refresh();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl text-charcoal mb-6">Tag Management</h1>

      {/* Add tag form */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="submit"
          className="rounded-lg bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark transition-colors"
        >
          Add Tag
        </button>
      </form>

      {message && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          {message}
        </div>
      )}

      {/* Tags list */}
      {loading ? (
        <p className="text-warm-gray">Loading...</p>
      ) : tags.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-warm-gray">No tags yet</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm divide-y divide-cream-dark">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`flex items-center justify-between px-4 py-3 ${
                !tag.is_active ? "opacity-50" : ""
              }`}
            >
              <span className="text-sm text-charcoal">{tag.name}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(tag.id, tag.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tag.is_active ? "bg-olive" : "bg-warm-gray-light"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tag.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
