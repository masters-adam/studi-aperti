"use client";

import { useState, useEffect } from "react";
import {
  getAdmins,
  getCurrentAdminId,
  inviteAdmin,
  removeAdmin,
} from "@/lib/actions/admin-management";
import { useTranslations } from "next-intl";
import type { Admin } from "@/lib/types";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("AdminAdmins");

  const refresh = async () => {
    const [data, id] = await Promise.all([getAdmins(), getCurrentAdminId()]);
    setAdmins(data);
    setCurrentId(id);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage(null);

    const result = await inviteAdmin(email);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: t("inviteSuccess", { email }) });
      setEmail("");
    }
    await refresh();
  };

  const handleRemove = async (id: string, adminEmail: string) => {
    if (!confirm(t("removeConfirm", { email: adminEmail }))) return;
    setMessage(null);

    const result = await removeAdmin(id);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    await refresh();
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl text-charcoal mb-6">{t("title")}</h1>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="flex gap-2 mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-lg border border-warm-gray-light bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="submit"
          className="rounded-lg bg-terracotta px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark transition-colors"
        >
          {t("invite")}
        </button>
      </form>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-olive-light/20 border border-olive-light text-olive-dark"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admins list */}
      {loading ? (
        <p className="text-warm-gray">{t("loading")}</p>
      ) : (
        <div className="rounded-xl bg-white shadow-sm divide-y divide-cream-dark">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm text-charcoal">{admin.email}</p>
                <p className="text-xs text-warm-gray">
                  {t("added", { date: new Date(admin.created_at).toLocaleDateString() })}
                  {admin.id === currentId && (
                    <span className="ml-2 text-olive">{t("you")}</span>
                  )}
                </p>
              </div>
              {admin.id !== currentId && (
                <button
                  onClick={() => handleRemove(admin.id, admin.email)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  {t("remove")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
