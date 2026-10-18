import { isRouteErrorResponse, Links, Meta, Outlet, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { RetryStaleRoute } from "./components/retry-stale-route";
import "./styles.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
  { rel: "icon", href: "/favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "preload", href: "/fonts/InterVariable.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/Lora-normal-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

// Applies display preferences before first paint. Without a theme cookie the
// dark variant falls back to prefers-color-scheme, so no attribute is needed.
const preferenceScript =
  "(function () { var theme = document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/); if (theme) document.documentElement.dataset.theme = theme[1]; if (/(?:^|;\\s*)fixation=on/.test(document.cookie)) document.documentElement.dataset.fixation = 'true'; })();";

export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="antialiased" suppressHydrationWarning><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><script dangerouslySetInnerHTML={{ __html: preferenceScript }} /><Meta /><Links /></head><body>{children}<ScrollRestoration /></body></html>;
}

export default function App() {
  return (
    <div className="isolate min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-paper focus:p-3">Skip to content</a>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main id="main" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">{notFound ? <RetryStaleRoute /> : null}<p className="font-mono text-base text-accent sm:text-sm">{notFound ? "404" : "Error"}</p><h1 className="text-balance font-display text-4xl font-normal tracking-tight text-ink">{notFound ? "That page has wandered off." : "Something went wrong."}</h1><a className="journal-link w-fit" href="/">Return home</a></main>;
}
