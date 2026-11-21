"use client";

import { useState } from "react";
import { useSvgId } from "@/components/brand-identity/diagram";
import { ControlButton, FigureFrame } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { AxisBottom, AxisLeft, linear } from "@/components/palitronica/plot";
import { ClassLegend, DataTable, count, type FigureProps } from "./figure-parts";
import { lengthBins, lengthCutoffs, scoreBins, scoreMedians } from "./histograms.data";
import { PlotInspection } from "./plot-inspection";
import { configuredThreshold } from "./threshold.data";

const cohorts = [
  { value: "both", label: "Both" },
  { value: "benign", label: "Benign" },
  { value: "malicious", label: "Malicious" },
] as const;
type Cohort = (typeof cohorts)[number]["value"];
type Bin = (typeof lengthBins)[number];

const left = 47;
const right = 403;
const top = 28;
const bottom = 171;
const lengthX = linear([0, lengthBins.length], [left, right]);
const scoreX = linear([0, 1], [left, right]);
const lengthTicks = [0, 5000, 10000, 15000];
const countTicks = [0, 500, 1000, 1500, 2000];
const logTicks = [0, 1, 10, 100, 1000];

function lengthRange([lower, upper]: Bin) {
  return upper === null ? `${count(lower)}+ (overflow)` : `[${lower}, ${upper})`;
}

function scoreRange([lower, upper]: Bin) {
  return `[${lower.toFixed(2)}, ${upper?.toFixed(2)}${upper === 1 ? "]" : ")"}`;
}

function binDetail(range: string, [, , benign, malicious]: Bin, cohort: Cohort) {
  const counts = [
    cohort !== "malicious" ? `${count(benign)} benign` : "",
    cohort !== "benign" ? `${count(malicious)} malicious` : "",
  ].filter(Boolean);
  return `${range} · ${counts.join(" · ")}`;
}

function Bars({
  bins,
  leftFor,
  rightFor,
  heightFor,
  cohort,
  selected,
  patternId,
}: {
  bins: readonly Bin[];
  leftFor: (bin: Bin, index: number) => number;
  rightFor: (bin: Bin, index: number) => number;
  heightFor: (value: number) => number;
  cohort: Cohort;
  selected: number;
  patternId: string;
}) {
  return (
    <g aria-hidden="true">
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 1,-1 M0,4 4,0 M3,5 5,3" className="pd-hatch" />
        </pattern>
      </defs>
      {bins.map((bin, index) => {
        const start = leftFor(bin, index);
        const width = rightFor(bin, index) - start;
        const paired = cohort === "both";
        const barWidth = paired ? width * 0.42 : width * 0.78;
        const [, , benign, malicious] = bin;
        return (
          <g key={index}>
            {index === selected && <rect x={start} width={width} y={top} height={bottom - top} className="pd-plot-selection" />}
            {cohort !== "malicious" && benign > 0 && (
              <rect className="pd-bar-benign" x={start + width * 0.1} width={barWidth} y={bottom - heightFor(benign)} height={heightFor(benign)} />
            )}
            {cohort !== "benign" && malicious > 0 && (
              <rect className="pd-bar-malicious" fill={`url(#${patternId})`} x={start + width * (paired ? 0.53 : 0.1)} width={barWidth} y={bottom - heightFor(malicious)} height={heightFor(malicious)} />
            )}
          </g>
        );
      })}
    </g>
  );
}

export function UrlLengthCutoff(props: FigureProps) {
  const [cohort, setCohort] = useState<Cohort>("both");
  const cutoffIndex = lengthBins.findIndex(([lower]) => lower === 128);
  const [selected, setSelected] = useState(cutoffIndex);
  const patternId = useSvgId("pd-length-hatch");
  const y = linear([0, 15000], [bottom, top]);
  const cutoff = lengthCutoffs[cohort];
  const detail = binDetail(lengthRange(lengthBins[selected]), lengthBins[selected], cohort);
  const headings = ["Raw characters", ...(cohort !== "malicious" ? ["Benign"] : []), ...(cohort !== "benign" ? ["Malicious"] : [])];

  return (
    <FigureFrame
      {...props}
      width="column"
      badge="Corpus aggregate"
      caption="Raw lengths in the deduplicated corpus. The cutoff separates 145 URLs of exactly 128 characters from the 9,691 longer URLs."
      controls={<SegmentedControl label="URL class" options={[...cohorts]} value={cohort} onChange={setCohort} />}
    >
      <div className="pd-body">
        <div className="pd-plot-heading"><span>Counts by raw length range</span><ClassLegend benign={cohort !== "malicious"} malicious={cohort !== "benign"} /></div>
        <svg className="bi-diagram pd-chart pd-compact-plot" viewBox="0 0 420 211" role="group" aria-label="Raw URL length ranges with the 128-character cutoff">
          <AxisLeft scale={y} at={left} values={lengthTicks} label="URLs" grid={right - left} format={count} />
          <Bars bins={lengthBins} leftFor={(_, i) => lengthX(i)} rightFor={(_, i) => lengthX(i + 1)} heightFor={(value) => bottom - y(value)} cohort={cohort} selected={selected} patternId={patternId} />
          <AxisBottom scale={lengthX} at={bottom} values={[0, 4, cutoffIndex, 12, 15, 17.3]} format={(value) => value === 17.3 ? "Overflow" : String(lengthBins[value][0])} />
          <line className="pd-reference" x1={lengthX(cutoffIndex)} x2={lengthX(cutoffIndex)} y1={top - 6} y2={bottom} />
          <text className="pd-plot-label" x={lengthX(cutoffIndex) + 5} y={18}>128 cutoff</text>
          <PlotInspection bins={lengthBins.map((bin, index) => ({ left: lengthX(index), width: lengthX(index + 1) - lengthX(index), label: binDetail(lengthRange(bin), bin, cohort) }))} active={selected} select={setSelected} top={top} height={bottom - top} />
        </svg>
        <p className="pd-readout">{detail}</p>
        <dl className="pd-stat-grid">
          <div><dt>Shorter than 128</dt><dd>{count(cutoff.shorter)}</dd></div>
          <div><dt>Exactly 128</dt><dd>{count(cutoff.exactly)}</dd></div>
          <div><dt>Longer than 128</dt><dd>{count(cutoff.longer)}</dd></div>
          <div><dt>Truncated after tokenization</dt><dd>{count(cutoff.truncated.count)} <small>({cutoff.truncated.percent.toFixed(2)}%)</small></dd></div>
        </dl>
        <p className="pd-note">The bars count raw characters. After tokenization, shorter inputs are padded on the left with zeros and longer inputs keep their last 128 mapped IDs.</p>
        <DataTable label="Exact counts by raw URL length" headings={headings} disclosure="Exact bin counts" rows={lengthBins.map((bin) => [
          lengthRange(bin),
          ...(cohort !== "malicious" ? [count(bin[2])] : []),
          ...(cohort !== "benign" ? [count(bin[3])] : []),
        ])} />
      </div>
    </FigureFrame>
  );
}

export function ScoreSeparation(props: FigureProps) {
  const [log, setLog] = useState(false);
  const [selected, setSelected] = useState(0);
  const patternId = useSvgId("pd-score-hatch");
  const countScale = linear([0, log ? Math.log10(2001) : 2000], [bottom, top]);
  const transform = (value: number) => log ? Math.log10(1 + value) : value;
  const y = Object.assign((value: number) => countScale(transform(value)), countScale);

  return (
    <FigureFrame
      {...props}
      width="column"
      badge="Recomputed test scores"
      caption="Scores from the released model, grouped by actual label. The vertical line marks the configured cutoff of 0.50."
      controls={<ControlButton pressed={log} onClick={() => setLog(!log)}>Log count scale</ControlButton>}
    >
      <div className="pd-body">
        <div className="pd-plot-heading"><span>{log ? "Log scale · log₁₀(1 + count)" : "Counts per 0.02 score bucket"}</span><ClassLegend /></div>
        <svg className="bi-diagram pd-chart pd-compact-plot" viewBox="0 0 420 211" role="group" aria-label="Held-out score histogram from zero to one, with configured cutoff at 0.50">
          <AxisLeft scale={y} at={left} values={log ? logTicks : countTicks} label="URLs" grid={right - left} format={count} />
          <Bars bins={scoreBins} leftFor={([lower]) => scoreX(lower)} rightFor={([, upper]) => scoreX(upper ?? 1)} heightFor={(value) => bottom - y(value)} cohort="both" selected={selected} patternId={patternId} />
          <AxisBottom scale={scoreX} at={bottom} values={[0, 0.25, 0.5, 0.75, 1]} format={(value) => value.toFixed(2)} label="Malicious score" />
          <line className="pd-reference" x1={scoreX(configuredThreshold)} x2={scoreX(configuredThreshold)} y1={top - 6} y2={bottom} />
          <text className="pd-plot-label" x={scoreX(configuredThreshold) + 5} y={18}>{configuredThreshold.toFixed(2)} configured</text>
          <PlotInspection bins={scoreBins.map((bin) => ({ left: scoreX(bin[0]), width: scoreX(bin[1] ?? 1) - scoreX(bin[0]), label: binDetail(scoreRange(bin), bin, "both") }))} active={selected} select={setSelected} top={top} height={bottom - top} />
        </svg>
        <p className="pd-readout">{binDetail(scoreRange(scoreBins[selected]), scoreBins[selected], "both")}</p>
        <dl className="pd-stat-grid">
          <div><dt>Benign median</dt><dd title={String(scoreMedians.benign)}>{scoreMedians.benign.toFixed(6)}</dd></div>
          <div><dt>Malicious median</dt><dd title={String(scoreMedians.malicious)}>{scoreMedians.malicious.toFixed(6)}</dd></div>
        </dl>
        <p className="pd-note">Buckets include the lower edge. Only the final bucket includes its upper edge, 1.00. The distributions show score separation on the original test split. Calibration requires a separate evaluation.</p>
        <DataTable label="Exact score buckets by actual class" headings={["Score range", "Benign", "Malicious"]} disclosure="Exact bin counts" rows={scoreBins.map((bin) => [scoreRange(bin), count(bin[2]), count(bin[3])])} />
      </div>
    </FigureFrame>
  );
}
