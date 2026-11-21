"use client";

import { useState } from "react";
import { ControlButton, FigureFrame } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { AxisBottom, AxisLeft, linear, linePath } from "@/components/palitronica/plot";
import { DataTable, type FigureProps } from "./figure-parts";
import { PlotInspection } from "./plot-inspection";
import { checkpointEpoch, training, type Metric } from "./training.data";

const metrics: { value: Metric; label: string; ticks: number[] }[] = [
  { value: "loss", label: "Loss", ticks: [0, 0.1, 0.2, 0.3, 0.4] },
  { value: "accuracy", label: "Accuracy", ticks: [0.8, 0.85, 0.9, 0.95, 1] },
  { value: "precision", label: "Precision", ticks: [0.8, 0.85, 0.9, 0.95, 1] },
  { value: "recall", label: "Recall", ticks: [0.8, 0.85, 0.9, 0.95, 1] },
  { value: "auc", label: "AUC", ticks: [0.9, 0.925, 0.95, 0.975, 1] },
];

const series = [
  { key: "training", label: "Training", valueIndex: 1 },
  { key: "validation", label: "Validation", valueIndex: 2 },
] as const;
const left = 46;
const right = 392;
const top = 31;
const bottom = 170;
const x = linear([1, 10], [left, right]);

export function TrainingProgress(props: FigureProps) {
  const [metric, setMetric] = useState<Metric>("loss");
  const [shown, setShown] = useState({ training: true, validation: true });
  const [selected, setSelected] = useState(checkpointEpoch - 1);
  const rows = training[metric];
  const [epoch, train, validation] = rows[selected];
  const { ticks, label } = metrics.find(({ value }) => value === metric)!;
  const y = linear([ticks[0], ticks[ticks.length - 1]], [bottom, top]);

  return (
    <FigureFrame
      {...props}
      width="column"
      badge="Recorded training history"
      caption="Recorded training and validation metrics. The checkpoint at epoch 10 had the lowest validation loss."
      controls={<SegmentedControl label="Recorded metric" value={metric} onChange={setMetric} options={metrics} />}
    >
      <div className="pd-body">
        <div className="pd-plot-heading">
          <span>Google Colab · NVIDIA T4 · Batch 256</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Visible series">
            {series.map(({ key, label }) => (
              <ControlButton key={key} pressed={shown[key]} onClick={() => setShown((current) => ({ ...current, [key]: !current[key] }))}>
                <i className={`pd-swatch pd-${key}`} />{label}
              </ControlButton>
            ))}
          </div>
        </div>
        <svg className="bi-diagram pd-chart pd-compact-plot" viewBox="0 0 420 212" role="group" aria-label={`${label} over the ten recorded epochs`}>
          <AxisLeft scale={y} at={left} values={ticks} grid={right - left} label={label} />
          <AxisBottom scale={x} at={bottom} values={rows.map(([epoch]) => epoch)} label="Recorded epoch" />
          <line className="pd-reference" x1={x(checkpointEpoch)} x2={x(checkpointEpoch)} y1={top - 6} y2={bottom} />
          <text className="pd-plot-label" x={x(checkpointEpoch)} y={16} textAnchor="end">Epoch 10 checkpoint</text>
          <line className="pd-guide" x1={x(epoch)} x2={x(epoch)} y1={top} y2={bottom} />
          {series.filter(({ key }) => shown[key]).map(({ key, valueIndex }) => (
            <g key={key} className={`pd-series-${key}`} aria-hidden="true">
              <path d={linePath(rows.map((row) => [x(row[0]), y(row[valueIndex])]))} />
              {rows.map((row) => key === "training" ? (
                <circle key={row[0]} cx={x(row[0])} cy={y(row[valueIndex])} r={row[0] === epoch ? 4 : 2.6} />
              ) : (
                <rect key={row[0]} x={x(row[0]) - 2.6} y={y(row[valueIndex]) - 2.6} width={5.2} height={5.2} />
              ))}
            </g>
          ))}
          <PlotInspection bins={rows.map(([epoch, train, val]) => ({
            left: x(epoch) - 15,
            width: 30,
            label: `Epoch ${epoch}. Training ${label} ${train}. Validation ${label} ${val}.`,
          }))} active={selected} select={setSelected} top={top} height={bottom - top} />
        </svg>
        <p className="pd-readout">Epoch {epoch} · Training {train} · Validation {validation}</p>
        <p className="pd-note">
          Epoch 10 was selected by minimum validation loss ({training.loss[checkpointEpoch - 1][2]}).
          {metric === "auc" && " This is Keras’s threshold-grid AUC metric from training."}
        </p>
        <DataTable label={`Exact recorded ${label.toLowerCase()} by epoch`} headings={["Epoch", "Training", "Validation"]} rows={rows} disclosure="Exact epoch values" />
      </div>
    </FigureFrame>
  );
}
