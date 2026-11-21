"use client";

import { useState } from "react";
import { useSvgId } from "@/components/brand-identity/diagram";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { cn } from "@/lib/utils";

type Transform = "grayscale" | "binary" | "adaptive" | "blur" | "dilation";

const TRANSFORMS: { value: Transform; label: string; heading: string; strength: string; note: string }[] = [
  {
    value: "grayscale",
    label: "Gray",
    heading: "Grayscale",
    strength: "desaturation",
    note: "Removes color so later steps work on intensity alone. The reports describe it as useful for text visibility in the tested screenshots.",
  },
  {
    value: "binary",
    label: "Binary",
    heading: "Binary threshold",
    strength: "cutoff",
    note: "One global cutoff for the whole image. On a gradient background, the faint label disappears at low cutoffs and the darker side floods at high ones.",
  },
  {
    value: "adaptive",
    label: "Adaptive",
    heading: "Adaptive threshold",
    strength: "offset",
    note: "Compares each pixel with its neighborhood, so the gradient matters less. A small offset keeps faint text but lets background texture through.",
  },
  {
    value: "blur",
    label: "Blur",
    heading: "Gaussian blur",
    strength: "radius",
    note: "Smooths noise but softens character edges, one of the tradeoffs recorded in the preprocessing reports.",
  },
  {
    value: "dilation",
    label: "Dilate",
    heading: "Dilation",
    strength: "radius",
    note: "Thickens strokes. Past a point, nearby characters merge, another effect the reports recorded.",
  },
];

const caption =
  "Synthetic crop illustrating preprocessing tradeoffs and section-aware label association. The examples explain reported failure modes; they are not OCR benchmark results, and no OCR engine was run on this image.";

const W = 300;
const H = 176;

const SECTIONS = [
  { id: "reach", title: "Reach", y: 34, rows: [["Followers", "62%"], ["Non-followers", "38%"]] },
  { id: "engagement", title: "Engagement", y: 106, rows: [["Followers", "312"], ["Likes", "1,204"]] },
] as const;

/** A 0/1 lookup table with `bins` steps that switches to white at `cutoff`. */
function stepTable(cutoff: number, bins = 48) {
  return Array.from({ length: bins }, (_, i) => ((i + 0.5) / bins >= cutoff ? 1 : 0)).join(" ");
}

function Crop({ filter, sections }: { filter?: string; sections: boolean }) {
  const uid = useSvgId("sr-crop");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full rounded-md" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" x2="1" y1="0" y2="0.4">
          <stop offset="0" stopColor="#f6f3ec" />
          <stop offset="0.55" stopColor="#d9dbe0" />
          <stop offset="1" stopColor="#8f9aa8" />
        </linearGradient>
      </defs>
      <g filter={filter}>
        <rect width={W} height={H} fill={`url(#${uid}-bg)`} />
        <rect x={0} y={0} width={W} height={4} fill="#e2557a" />
        <text x={14} y={22} fontSize={10.5} fill="#bdb9b0" className="sr-crop-text">
          Accounts reached · last 7 days
        </text>
        {SECTIONS.map((section) => (
          <g key={section.id}>
            <text x={14} y={section.y + 14} fontSize={12} fontWeight={600} fill="#2b2f36" className="sr-crop-text">
              {section.title}
            </text>
            {section.rows.map(([label, value], i) => (
              <g key={label}>
                <text x={14} y={section.y + 33 + i * 17} fontSize={11} fill="#4b5563" className="sr-crop-text">
                  {label}
                </text>
                <text x={W - 16} y={section.y + 33 + i * 17} fontSize={11} fontWeight={600} fill="#1f2937" textAnchor="end" className="sr-crop-text">
                  {value}
                </text>
              </g>
            ))}
          </g>
        ))}
      </g>
      {sections &&
        SECTIONS.map((section) => (
          <g key={section.id} className="sr-section-box">
            <rect x={6} y={section.y} width={W - 12} height={62} rx={5} />
            <text x={W - 12} y={section.y + 13} textAnchor="end">
              {section.id === "reach" ? "section 1" : "section 2"}
            </text>
          </g>
        ))}
    </svg>
  );
}

export function PreprocessingCompare({ id, number, title }: { id: string; number: number; title: string }) {
  const uid = useSvgId("sr-pre");
  const [transform, setTransform] = useState<Transform>("grayscale");
  const [strength, setStrength] = useState(60);
  const [sections, setSections] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const s = strength / 100;
  const meta = TRANSFORMS.find((item) => item.value === transform)!;
  const filterId = `${uid}-${transform}`;

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      width="column"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Transformation"
            value={transform}
            onChange={(value) => {
              setTransform(value);
              setAnnouncement(`${TRANSFORMS.find((item) => item.value === value)!.label} selected. ${TRANSFORMS.find((item) => item.value === value)!.note}`);
            }}
            options={TRANSFORMS.map(({ value, label }) => ({ value, label }))}
          />
          <ControlButton
            pressed={sections}
            onClick={() => {
              setSections((value) => !value);
              setAnnouncement(sections ? "Section boundaries hidden." : "Section boundaries shown. Each Followers label now belongs to a section.");
            }}
          >
            Sections
          </ControlButton>
        </>
      }
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id={`${uid}-grayscale`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values={(1 - s).toFixed(3)} />
          </filter>
          <filter id={`${uid}-binary`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues={stepTable(0.35 + 0.5 * s)} />
              <feFuncG type="discrete" tableValues={stepTable(0.35 + 0.5 * s)} />
              <feFuncB type="discrete" tableValues={stepTable(0.35 + 0.5 * s)} />
            </feComponentTransfer>
          </filter>
          <filter id={`${uid}-adaptive`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" result="gray" />
            <feGaussianBlur in="gray" stdDeviation="7" edgeMode="duplicate" result="mean" />
            <feComposite in="gray" in2="mean" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0.5" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues={stepTable(0.5 - (0.005 + 0.06 * s), 96)} />
              <feFuncG type="discrete" tableValues={stepTable(0.5 - (0.005 + 0.06 * s), 96)} />
              <feFuncB type="discrete" tableValues={stepTable(0.5 - (0.005 + 0.06 * s), 96)} />
              <feFuncA type="linear" slope="0" intercept="1" />
            </feComponentTransfer>
          </filter>
          <filter id={`${uid}-blur`} x="0" y="0" width="100%" height="100%">
            <feGaussianBlur stdDeviation={(0.15 + 1.8 * s).toFixed(2)} edgeMode="duplicate" />
          </filter>
          <filter id={`${uid}-dilation`} x="0" y="0" width="100%" height="100%">
            <feMorphology operator="erode" radius={(0.2 + 1.1 * s).toFixed(2)} />
          </filter>
        </defs>
      </svg>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 @md:grid-cols-2">
          <div>
            <MonoLabel>Original</MonoLabel>
            <div className="mt-1.5">
              <Crop sections={sections} />
            </div>
          </div>
          <div>
            <MonoLabel>{meta.heading}</MonoLabel>
            <div className="mt-1.5">
              <Crop filter={`url(#${filterId})`} sections={sections} />
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between">
            <MonoLabel>Strength · {meta.strength}</MonoLabel>
            <span className="font-mono text-[0.7rem] text-zinc-400">{strength}</span>
          </span>
          <input type="range" min={0} max={100} value={strength} onChange={(event) => setStrength(Number(event.target.value))} className="pal-range" />
        </label>

        <p className="text-[0.8rem] leading-relaxed text-zinc-400">{meta.note}</p>

        <div className="rounded-md border border-zinc-800/80 bg-black/20 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <MonoLabel>Expected fields</MonoLabel>
            <span className="text-[0.68rem] text-zinc-600">synthetic ground truth</span>
          </div>
          <dl className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 font-mono text-[0.72rem]">
            {SECTIONS.flatMap((section) =>
              section.rows
                .filter(([label]) => label === "Followers")
                .map(([label, value]) => (
                  <div key={section.id} className="contents">
                    <dt className={cn("text-zinc-400", !sections && "bi-tone-text")} data-tone={sections ? undefined : "user"}>
                      {sections ? (
                        <>
                          <span className="text-zinc-600">{section.title} › </span>
                          {label}
                        </>
                      ) : (
                        `${label} ?`
                      )}
                    </dt>
                    <dd className="text-right text-zinc-200">{value}</dd>
                  </div>
                )),
            )}
          </dl>
          <p className="mt-2 text-[0.7rem] leading-snug text-zinc-500">
            {sections
              ? "With section boundaries, each Followers value is associated with the section around it."
              : "The same label appears twice. Character accuracy alone cannot say which breakdown each value belongs to."}
          </p>
        </div>
      </div>
    </FigureFrame>
  );
}
