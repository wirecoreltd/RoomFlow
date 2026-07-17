"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function Navbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = [
    { href: "/planning", label: "Planning" },
    ...(profile?.role === "admin"
      ? [
          { href: "/admin", label: "Tableau de bord" },
          { href: "/admin/resources", label: "Ressources" },
          { href: "/admin/bookings", label: "Réservations" },
          { href: "/admin/users", label: "Utilisateurs" },
        ]
      : []),
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/planning" className="font-display italic text-lg text-ink">
            RoomFlow
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  pathname === l.href ? "bg-ink text-white" : "text-muted hover:text-text hover:bg-black/5"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
            <span className="h-7 w-7 rounded-full bg-brand-light text-brand-dark flex items-center justify-center text-xs font-semibold">
              {initials(profile?.full_name)}
            </span>
            <span>{profile?.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-muted hover:text-occupied transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap",
              pathname === l.href ? "bg-ink text-white" : "text-muted bg-black/5"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
