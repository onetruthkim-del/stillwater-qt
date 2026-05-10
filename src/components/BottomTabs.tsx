"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

type Tab = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
};

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 8 Q 6 6.6, 9 8 T 14.5 8 T 20.5 8" />
      <path d="M3.5 12 Q 6 10.6, 9 12 T 14.5 12 T 20.5 12" />
      <path d="M3.5 16 Q 6 14.6, 9 16 T 14.5 16 T 20.5 16" />
    </svg>
  );
}

function LibraryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="4" width="16" height="3.5" rx="0.8" />
      <rect x="4" y="10.25" width="16" height="3.5" rx="0.8" />
      <rect x="4" y="16.5" width="16" height="3.5" rx="0.8" />
    </svg>
  );
}

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    isActive: (p) => p === "/" || p === "/intake",
    Icon: HomeIcon,
  },
  {
    href: "/library",
    label: "Library",
    isActive: (p) => p === "/library" || p.startsWith("/workbook"),
    Icon: LibraryIcon,
  },
];

export default function BottomTabs() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-cream/85 backdrop-blur-md border-t border-rule"
    >
      <ul
        className="mx-auto flex max-w-md items-stretch justify-around px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map(({ href, label, isActive, Icon }) => {
          const active = isActive(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 transition ${
                  active
                    ? "text-navy-deep"
                    : "text-ink-soft/60 hover:text-ink-soft"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gold transition-all ${
                    active ? "w-8 opacity-100" : "w-0 opacity-0"
                  }`}
                />
                <Icon className="h-6 w-6" />
                <span
                  className={`text-[11px] tracking-wide font-medium ${
                    active ? "" : "font-normal"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
