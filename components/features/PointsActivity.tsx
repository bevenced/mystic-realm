"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

function typeIcon(type: string) {
  if (type === "checkin") return "+";
  if (type === "wish_email_bonus") return "+";
  if (type === "wish" || type === "redeem") return "−";
  return type.startsWith("wish") || type.startsWith("redeem") ? "−" : "+";
}

export default function PointsActivity() {
  const { currentTheme } = useTheme();
  const { t, tf } = useLocale();
  const c = currentTheme.colors;
  const [txns, setTxns] = useState<Transaction[]>([]);

  const typeLabel = (type: string): string => {
    switch (type) {
      case "checkin": return t.points.checkin;
      case "wish": return t.points.wish;
      case "wish_email_bonus": return t.points.emailBonus;
      case "redeem": return t.points.redeem;
      default: return type;
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/points/transactions")
      .then((r) => r.json())
      .then((json) => {
        if (!json.error && json.transactions) setTxns(json.transactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || txns.length === 0) return null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center gap-2"
        style={{
          borderBottom: `1px solid ${c.primary}10`,
          background: `${c.primary}06`,
        }}
      >
        <Sparkles size={14} style={{ color: c.primary }} />
        <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: c.text }}>
          {t.points.title}
        </h3>
        <span className="text-[10px] ml-auto" style={{ color: c.textMuted }}>
          {tf("points.last", { n: txns.length })}
        </span>
      </div>

      {/* List */}
      <div className="divide-y" style={{ borderColor: `${c.primary}08` }}>
        {txns.map((t) => {
          const isPositive = t.amount > 0;
          return (
            <div
              key={t.id}
              className="px-6 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isPositive ? "#2ECC7118" : "#E74C3C18",
                  }}
                >
                  {isPositive ? (
                    <ArrowUpRight size={13} style={{ color: "#2ECC71" }} />
                  ) : (
                    <ArrowDownRight size={13} style={{ color: "#E74C3C" }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: c.text }}>
                    {t.description || typeLabel(t.type)}
                  </p>
                  <p className="text-[10px]" style={{ color: c.textMuted }}>
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span
                  className="text-sm font-bold"
                  style={{ color: isPositive ? "#2ECC71" : "#E74C3C" }}
                >
                  {isPositive ? "+" : ""}{t.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
