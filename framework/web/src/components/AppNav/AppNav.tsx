"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Active Framework" },
  { href: "/frameworks", label: "Frameworks" },
  { href: "/frameworks/revisions", label: "Revision History" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/frameworks/revisions")
    return pathname === "/frameworks/revisions" || pathname.startsWith("/frameworks/revisions/");
  if (href === "/frameworks")
    return (
      pathname === "/frameworks" ||
      (pathname.startsWith("/frameworks/") && !pathname.startsWith("/frameworks/revisions"))
    );
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <div className="px-4 pt-6 pb-2 sm:px-6 lg:px-8" role="banner">
      <nav
        className="mx-auto flex w-fit items-center gap-0.5 rounded-full border border-zinc-200/80 bg-white/80 px-1.5 py-1 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-zinc-950/50"
        aria-label="Main navigation"
      >
        {navItems.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-200/90 text-zinc-900 dark:bg-zinc-700/90 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
