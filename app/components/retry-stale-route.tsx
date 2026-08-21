"use client";

import { useEffect } from "react";

/**
 * Heals 404s caused by deploy-propagation skew: right after a deploy, the
 * homepage can come from a new worker version while the next request lands
 * on an instance still serving the previous one, which does not know the
 * newest article route yet. One automatic reload usually lands on the
 * updated version. The sessionStorage guard keeps genuine 404s visible —
 * each URL only gets a single retry per tab session.
 */
export function RetryStaleRoute() {
  useEffect(() => {
    const key = `retried:${location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const timer = setTimeout(() => location.reload(), 800);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
