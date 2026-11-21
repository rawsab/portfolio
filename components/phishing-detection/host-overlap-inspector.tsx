"use client";

import { useState } from "react";
import { FigureFrame } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { ClassLegend, count, DataTable, type FigureProps } from "./figure-parts";
import { benignCoverage, benignTotal, overlap } from "./hosts.data";

const keyOptions = [
  { value: "host", label: "Exact host" },
  { value: "registrable_domain", label: "Registrable domain" },
] as const;
const schematicOptions = [
  { value: "url", label: "Shuffle URLs" },
  { value: "grouped", label: "Group by domain" },
] as const;

const columns = ["Train", "Validation", "Test"];
const entries = [
  { host: "docs.cedar.example", family: 0, split: 0 },
  { host: "fern.example", family: 1, split: 0 },
  { host: "help.cedar.example", family: 0, split: 1 },
  { host: "docs.cedar.example", family: 0, split: 2 },
  { host: "www.fern.example", family: 1, split: 2 },
  { host: "plum.example", family: 2, split: 2 },
];
const classes = ["Benign", "Malicious"];

function SplitSketch({ grouped }: { grouped: boolean }) {
  return (
    <div className="pd-split-sketch" data-grouped={grouped || undefined}>
      {columns.map((column, index) => (
        <div key={column} className="pd-split-column">
          <h4 className="bi-figure-label">{column}</h4>
          <ul>
            {entries.filter((entry) => (grouped ? entry.family : entry.split) === index).map((entry) => (
              <li key={`${entry.split}-${entry.host}`} data-family={entry.family}><span aria-hidden="true">{["●", "■", "◆"][entry.family]}</span> {entry.host}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function HostOverlapInspector(props: FigureProps) {
  const [key, setKey] = useState<keyof typeof overlap>("host");
  const [schematic, setSchematic] = useState<"url" | "grouped">("url");
  const grouped = schematic === "grouped";

  return (
    <FigureFrame
      {...props}
      badge="Measured overlap · synthetic schematic"
      caption="Measured overlap counts are paired with a synthetic view of how individual URL shuffling can spread one domain across multiple splits. Overlap measures exposure to site keys. Its effect on the scores is unknown."
      controls={<SegmentedControl label="Site key" value={key} onChange={setKey} options={[...keyOptions]} />}
    >
      <div className="pd-body">
        <div className="pd-panes pd-host-panes">
          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">Original URL-level split</h3>
            <p className="pd-note">Test URLs with a matching {key === "host" ? "exact host" : "registrable domain"} in any training URL.</p>
            <div aria-live="polite" className="pd-overlap-pairs">
              {overlap[key].map(({matched, total, percent}, index) => (
                <div key={classes[index]} className="pd-overlap-row">
                  <div className="pd-plot-heading">
                    <span>{classes[index]} <small>{count(matched)} / {count(total)}</small></span>
                    <strong>{percent.toFixed(2)}%</strong>
                  </div>
                  <svg viewBox="0 0 100 3" preserveAspectRatio="none" className="pd-ratio" aria-hidden="true">
                    <rect width="100" height="3" className="pd-ratio-bg" />
                    {index === 0
                      ? <rect width={percent} height="3" className="pd-bar-benign" />
                      : <line x1="0" y1="1.5" x2={percent} y2="1.5" className="pd-ratio-malicious" />}
                  </svg>
                </div>
              ))}
            </div>
            <ClassLegend />
            <p className="pd-note">Denominators include every test URL in each class, including URLs with unavailable keys. Training matches include both labels.</p>
          </div>

          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">Synthetic split schematic</h3>
            <SegmentedControl label="Schematic assignment" value={schematic} onChange={setSchematic} options={[...schematicOptions]} />
            <SplitSketch grouped={grouped} />
            <p className="pd-note">{grouped
              ? "Proposed assignment. Each fictional family stays together in one split."
              : "Two distinct URL strings on docs.cedar.example can land in different splits. help.cedar.example shares the same domain."}</p>
          </div>
        </div>

        <div className="pd-diagram-panel">
          <h3 className="pd-panel-title bi-figure-label">Benign concentration in the whole corpus</h3>
          <p className="pd-note">Cumulative coverage across {count(benignTotal)} benign URLs. Exact hosts retain <code>www.</code></p>
          <div className="pd-coverage-grid">
            {benignCoverage.map(([rank, urls, share]) => (
              <div key={rank} className="pd-coverage-row" data-callout={rank >= 10 || undefined}>
                <span>Top {rank}</span>
                <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="pd-ratio" aria-hidden="true">
                  <rect width="100" height="4" className="pd-ratio-bg" />
                  <rect width={share} height="4" className="pd-bar-benign" />
                </svg>
                <span>{count(urls)} · {share.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        <DataTable label="Measured original URL-level overlap, all training labels" headings={["Key", "Test class", "Matched", "All test URLs", "Percent"]} rows={keyOptions.flatMap(({ value, label }) => overlap[value].map(({matched, total, percent}, index) => [label, classes[index], count(matched), count(total), percent]))} disclosure="Exact overlap ratios" />
        <details className="pd-details">
          <summary className="bi-focusable rounded-sm">Both synthetic split arrangements</summary>
          <h3 className="pd-panel-title bi-figure-label">Shuffle URLs</h3>
          <SplitSketch grouped={false} />
          <h3 className="pd-panel-title bi-figure-label">Group by domain</h3>
          <SplitSketch grouped />
        </details>
      </div>
    </FigureFrame>
  );
}
