import { Link } from "react-router";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const navigation = <><Link to="/#archive">Essays</Link><Link to="/#about">About</Link></>;
  return (
    <header className="journal-container">
      <div className="flex min-h-20 items-center justify-between gap-6 border-b border-ink/70">
        <p className="shrink-0 font-display text-xl tracking-tight">
          <Link to="/" aria-label="Still Brook homepage">Still Brook<span className="text-accent">.</span></Link>
        </p>
        <nav className="ml-auto flex items-center gap-8 text-sm max-md:hidden" aria-label="Main navigation">{navigation}</nav>
        <div className="flex shrink-0 items-center gap-4">
          <ThemeToggle />
          <MobileMenu>{navigation}</MobileMenu>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="journal-container">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-5 border-t border-ink/70 pt-7 pb-9 text-base text-muted sm:text-sm">
        <p className="font-display text-xl tracking-tight text-ink"><Link to="/">Still Brook<span className="text-accent">.</span></Link></p>
        <p className="max-sm:order-3 max-sm:w-full">Notes made carefully. Curiosity left intact.</p>
        <a href="#main">Back to the top ↑</a>
      </div>
    </footer>
  );
}
