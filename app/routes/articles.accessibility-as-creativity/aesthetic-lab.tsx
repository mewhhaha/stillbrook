"use client";

import { useState } from "react";

const skinIds = ["field", "signal", "civic"] as const;
type SkinId = (typeof skinIds)[number];

const skins = {
  field: {
    label: "Field notes",
    note: "Warm paper, botanical restraint, and a reading-first serif hierarchy.",
    frame:
      "overflow-hidden rounded-[1.75rem] border border-[#40513f]/25 bg-[#f4efdf] text-[#223023] shadow-[0_18px_55px_rgba(64,81,63,0.14)]",
    top: "flex flex-col gap-1 border-b border-[#40513f]/25 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-8",
    kicker: "font-serif text-xs uppercase tracking-[0.24em] text-[#415b45]",
    date: "font-mono text-xs text-[#415b45]",
    layout: "grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_14rem]",
    title: "max-w-2xl font-serif text-4xl leading-[0.98] tracking-tight sm:text-5xl",
    summary: "mt-5 max-w-2xl font-serif text-base leading-7 text-[#354638]",
    list: "mt-6 space-y-3 border-t border-[#40513f]/25 pt-5",
    item: "grid grid-cols-[2rem_1fr] gap-3 font-serif text-sm leading-6",
    marker: "font-mono text-xs text-[#536c56]",
    action: "self-start border-l-2 border-[#71806b] pl-5",
    price: "font-serif text-4xl leading-none",
    priceLabel: "mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#415b45]",
    button:
      "mt-6 min-h-11 w-full rounded-full bg-[#223023] px-4 py-3 font-serif text-sm font-semibold text-[#fffdf5] outline-offset-4 hover:bg-[#354638] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#223023] disabled:cursor-default disabled:opacity-65",
    status: "mt-3 font-mono text-xs text-[#415b45]",
  },
  signal: {
    label: "Night signal",
    note: "Deep sky, oversized type, and one luminous control without changing the page structure.",
    frame:
      "overflow-hidden rounded-[2rem] border border-[#7ab8ff]/30 bg-[radial-gradient(circle_at_top_right,_#17345e_0,_#081426_46%,_#03070d_100%)] text-[#f5f8ff] shadow-[0_24px_70px_rgba(3,7,13,0.45)]",
    top: "flex flex-col gap-1 border-b border-[#7ab8ff]/25 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-8",
    kicker: "font-mono text-xs uppercase tracking-[0.26em] text-[#9cc9ff]",
    date: "font-mono text-xs text-[#d2e6ff]",
    layout: "grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_15rem]",
    title:
      "max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.045em] !text-[#f5f8ff] sm:text-6xl",
    summary: "mt-6 max-w-2xl text-base leading-7 text-[#d8e9ff]",
    list: "mt-7 grid gap-3 sm:grid-cols-3",
    item: "rounded-xl border border-[#7ab8ff]/30 bg-[#0c1c33]/80 p-3 text-sm leading-6",
    marker: "mb-2 block font-mono text-xs text-[#86f0cf]",
    action: "self-start rounded-2xl border border-[#86f0cf]/45 bg-[#07111f]/80 p-5",
    price: "text-5xl font-black tracking-[-0.06em]",
    priceLabel: "mb-2 block font-mono text-xs uppercase tracking-[0.24em] text-[#9cc9ff]",
    button:
      "mt-6 min-h-11 w-full rounded-xl bg-[#86f0cf] px-4 py-3 text-sm font-bold text-[#04120e] outline-offset-4 hover:bg-[#b2ffe8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-65",
    status: "mt-3 font-mono text-xs text-[#d2e6ff]",
  },
  civic: {
    label: "Civic notice",
    note: "A hard public-information grid with no rounded cards and nowhere for the date to hide.",
    frame:
      "overflow-hidden border-4 border-zinc-950 bg-[#f1d329] text-zinc-950 shadow-[9px_9px_0_#18181b] dark:border-zinc-950",
    top: "flex flex-col gap-1 bg-zinc-950 px-5 py-4 text-white sm:flex-row sm:items-end sm:justify-between sm:px-7",
    kicker: "font-mono text-xs font-bold uppercase tracking-[0.22em]",
    date: "font-mono text-xs font-bold",
    layout: "grid lg:grid-cols-[minmax(0,1fr)_16rem]",
    title: "max-w-3xl px-5 pt-6 text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] sm:px-7 sm:text-6xl",
    summary: "max-w-2xl px-5 pt-5 text-base font-medium leading-7 sm:px-7",
    list: "mt-6 grid border-y-4 border-zinc-950 sm:grid-cols-3",
    item: "border-zinc-950 p-4 text-sm font-bold leading-6 sm:border-r-2 sm:last:border-r-0",
    marker: "mb-2 block font-mono text-xs",
    action: "border-t-4 border-zinc-950 bg-white p-5 lg:border-l-4 lg:border-t-0",
    price: "font-mono text-5xl font-black tracking-[-0.08em]",
    priceLabel: "mb-2 block font-mono text-xs font-bold uppercase tracking-[0.18em]",
    button:
      "mt-6 min-h-11 w-full bg-zinc-950 px-4 py-3 font-mono text-sm font-bold uppercase text-white outline-offset-4 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white disabled:cursor-default disabled:opacity-65",
    status: "mt-3 font-mono text-xs font-bold uppercase",
  },
} as const;

export function AestheticLab() {
  const [active, setActive] = useState<SkinId>("field");
  const [reserved, setReserved] = useState(false);
  const skin = skins[active];

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Choose a visual treatment"
        className="flex flex-wrap gap-2"
      >
        {skinIds.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === active}
            onClick={() => setActive(id)}
            className={`min-h-10 rounded-full border px-4 py-2 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-white ${
              id === active
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                : "border-zinc-950/15 bg-white text-zinc-700 hover:border-zinc-950/40 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-white/40"
            }`}
          >
            {skins[id].label}
          </button>
        ))}
      </div>

      <section aria-labelledby="observatory-title" aria-describedby="observatory-summary" className={skin.frame}>
        <div className={skin.top}>
          <p className={skin.kicker}>Public programme</p>
          <p className={skin.date}>Saturday 19 September · 21:00</p>
        </div>

        <div className={skin.layout}>
          <div>
            <h3 id="observatory-title" className={skin.title}>
              After dark at the observatory
            </h3>
            <p id="observatory-summary" className={skin.summary}>
              A small-group evening for learning the autumn sky, using the rooftop telescope, and reading a
              star chart without an app.
            </p>
            <ul className={skin.list}>
              <li className={skin.item}>
                <span aria-hidden="true" className={skin.marker}>
                  01
                </span>
                <span>Rooftop telescope session</span>
              </li>
              <li className={skin.item}>
                <span aria-hidden="true" className={skin.marker}>
                  02
                </span>
                <span>Printed sky map included</span>
              </li>
              <li className={skin.item}>
                <span aria-hidden="true" className={skin.marker}>
                  03
                </span>
                <span>Step-free route to the dome</span>
              </li>
            </ul>
          </div>

          <div className={skin.action}>
            <p className={skin.price}>
              <span className={skin.priceLabel}>Ticket</span>
              €12
            </p>
            <button
              type="button"
              disabled={reserved}
              onClick={() => setReserved(true)}
              className={skin.button}
            >
              {reserved ? "Place reserved" : "Reserve a place"}
            </button>
            <p role="status" className={skin.status}>
              {reserved ? "Place held for 10 minutes" : "12 places left"}
            </p>
          </div>
        </div>
      </section>

      <p aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-950 dark:text-zinc-100">{skin.label}.</span> {skin.note} The event
        region keeps the same roles, names, source order, button, and status.
      </p>
    </div>
  );
}
