"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/ui/Avatar";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
      >
        <Avatar src={user?.avatar} name={user?.name} size={36} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: "var(--color-card-bg)",
            border: "1px solid color-mix(in srgb, var(--color-text-muted) 15%, transparent)",
          }}
        >
          {/* User name */}
          <div className="px-4 py-3 text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
            {user?.name || user?.email}
          </div>

          <div className="border-t" style={{ borderColor: "color-mix(in srgb, var(--color-text-muted) 10%, transparent)" }} />

          {/* Menu items */}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm theme-transition"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            Profile
          </Link>
          <Link
            href="/membership"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm theme-transition"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            Membership
          </Link>

          <div className="border-t" style={{ borderColor: "color-mix(in srgb, var(--color-text-muted) 10%, transparent)" }} />

          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm theme-transition"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E74C3C")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
