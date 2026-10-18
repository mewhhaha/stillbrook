"use client";

import { useRef, type ReactNode } from "react";

export function MobileMenu({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={menu}
      className="journal-menu relative md:hidden"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !menu.current?.open) return;
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 text-base">
        Menu <span aria-hidden="true">＋</span>
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="absolute top-14 right-0 z-20 grid min-w-48 gap-2 border border-ink/20 bg-paper p-4 text-base [&>a]:py-3"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a") && menu.current) menu.current.open = false;
        }}
      >
        {children}
      </nav>
    </details>
  );
}
