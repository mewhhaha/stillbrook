"use client";

import { useState } from "react";
import { Figure } from "../../components/figure";

// Eight camera exposures arrive 10 ms apart. Each preview takes 25 ms.
// At a tie the camera delivers its frame before the worker takes the next job.
const captureInterval = 10;
const renderTime = 25;
const lastFrame = 8;
const poses = [
  "striding in profile", "standing side-on", "turning toward the camera", "lifting the hem",
  "swinging the coat open", "showing the green lining", "lowering the hem", "walking away",
];
const sheet = "/images/articles/the-runway-wont-wait-contact.webp";

function Monitor({ label, frame, time }: { label: string; frame: number; time: number }) {
  const cell = frame - 1;
  const age = time - cell * captureInterval;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div
        role="img"
        aria-label={`Runway model ${poses[cell]}`}
        className="aspect-[3/4]"
        style={{
          backgroundImage: `url(${sheet})`,
          backgroundSize: "400% 200%",
          backgroundPosition: `${(cell % 4) * 100 / 3}% ${Math.floor(cell / 4) * 100}%`,
        }}
      />
      <p className="mt-1 font-mono text-xs">Frame {frame} · {age} ms old</p>
    </div>
  );
}

export function RunwayMonitor() {
  const [tick, setTick] = useState(3);
  const time = tick * renderTime;
  const latest = Math.min(lastFrame, 1 + Math.floor((time - renderTime) / captureInterval));
  return (
    <Figure caption="Eight exposures, 10 ms apart. Both monitors take 25 ms to render a photo. The camera wins ties. Runway studies generated with GPT Image.">
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Monitor label="Oldest waiting" frame={tick} time={time} />
          <Monitor label="Newest waiting" frame={latest} time={time} />
        </div>
        <label className="mt-5 block text-sm">
          <span className="flex justify-between"><span>Scrub the monitor clock</span><span className="font-mono">{time} ms</span></span>
          <input type="range" min={1} max={4} value={tick}
            aria-valuetext={`${time} milliseconds. Oldest waiting shows frame ${tick}. Newest waiting shows frame ${latest}.`}
            onChange={(event) => setTick(event.currentTarget.valueAsNumber)}
            className="block min-h-8 w-full accent-[var(--journal-accent)]" />
        </label>
      </div>
    </Figure>
  );
}
