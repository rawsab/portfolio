"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ControlButton, FigureFrame } from "@/components/brand-identity/figure-frame";
import { count, DataTable, percent, type FigureProps } from "./figure-parts";
import { configuredThreshold, maxBalancedAccuracy, maxF1, thresholdRows } from "./threshold.data";

const warning = "0.24 and 0.72 are descriptive test-set optima, not valid deployment threshold choices. Threshold selection should use validation/calibration data.";
const jumps = [
  { value: maxBalancedAccuracy.threshold, label: "test-grid max balanced accuracy" },
  { value: configuredThreshold, label: "configured" },
  { value: maxF1.threshold, label: "test-grid max F1" },
];
const comparisonTable = (
  <DataTable label="Named comparison thresholds" headings={["Threshold", "FP", "FN", "Balanced acc.", "F1"]} rows={jumps.map(({ value }) => {
    const row = thresholdRows[Math.round(value * 100)];
    return [value.toFixed(2), row.FP, row.FN, row.balanced_accuracy.toFixed(7), row.F1.toFixed(7)];
  })} />
);
const exactThresholdTable = (
  <DataTable label="Exact recomputed threshold metrics" headings={["Threshold", "TN", "FP", "FN", "TP", "Accuracy", "Precision", "Recall", "Specificity", "F1", "FPR", "Balanced accuracy"]} rows={thresholdRows.map((row) => [
    row.threshold.toFixed(2), row.TN, row.FP, row.FN, row.TP, row.accuracy, row.precision ?? "Undefined", row.recall, row.specificity, row.F1, row.false_positive_rate, row.balanced_accuracy,
  ])} disclosure="All 101 exact threshold rows" />
);

export function ThresholdExplorer(props: FigureProps) {
  const sliderId = useId();
  const [index, setIndex] = useState(Math.round(configuredThreshold * 100));
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const row = thresholdRows[index];
  const threshold = row.threshold.toFixed(2);

  useEffect(() => () => clearTimeout(timer.current), []);

  function select(next: number, settleImmediately = false) {
    const nextRow = thresholdRows[next];
    setIndex(next);
    clearTimeout(timer.current);
    const announce = () => setAnnouncement(`Threshold ${nextRow.threshold.toFixed(2)}. ${count(nextRow.FP)} false positives and ${count(nextRow.FN)} false negatives.`);
    if (settleImmediately) announce();
    else timer.current = setTimeout(announce, 400);
  }

  return (
    <FigureFrame
      {...props}
      badge="Recomputed test metrics"
      caption="Move the threshold through the recorded sweep to see where benign flags and malicious misses trade places."
      announcement={announcement}
    >
      <div className="pd-body">
        <div className="pd-threshold-control">
          <label className="bi-figure-label" htmlFor={sliderId}>Decision threshold <span className="pd-value">{threshold}</span></label>
          <input id={sliderId} className="pal-range pd-range" type="range" min={0} max={100} step={1} value={index} aria-valuetext={threshold} aria-describedby={`${sliderId}-policy`} onChange={(event) => select(event.currentTarget.valueAsNumber)} />
          <div className="pd-range-labels" aria-hidden="true"><span>0.00</span><span>0.50</span><span>1.00</span></div>
          <div className="pd-jumps" role="group" aria-label="Threshold anchors">
            {jumps.map(({ value, label }) => (
              <ControlButton key={value} pressed={row.threshold === value} onClick={() => select(Math.round(value * 100), true)}>
                <strong>{value.toFixed(2)}</strong> <span>{label}</span>
              </ControlButton>
            ))}
          </div>
          <p className="pd-warning" id={`${sliderId}-policy`}>{warning}</p>
        </div>

        <div className="pd-panes">
          <div>
            <h3 className="pd-panel-title bi-figure-label">Confusion matrix</h3>
            <table className="pd-table pd-matrix">
              <caption className="sr-only">Actual labels by predicted labels at threshold {threshold}</caption>
              <thead>
                <tr><th scope="col">Actual ↓ / Pred.</th><th scope="col">Benign</th><th scope="col">Malicious</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Benign</th><td>{count(row.TN)} <small>TN</small></td><td data-error>{count(row.FP)} <small>FP</small></td></tr>
                <tr><th scope="row">Malicious</th><td data-error>{count(row.FN)} <small>FN</small></td><td>{count(row.TP)} <small>TP</small></td></tr>
              </tbody>
            </table>
            <p className="pd-note">Predict malicious when the full-precision score is <code>≥</code> the threshold.</p>
          </div>
          <div>
            <h3 className="pd-panel-title bi-figure-label">Metrics on 3,399 test URLs</h3>
            <dl className="pd-stat-grid">
              <div><dt>Accuracy</dt><dd>{percent(row.accuracy)}</dd></div>
              <div><dt>Precision</dt><dd>{row.precision === null ? "Undefined" : percent(row.precision)}</dd></div>
              <div><dt>Recall</dt><dd>{percent(row.recall)}</dd></div>
              <div><dt>Specificity</dt><dd>{percent(row.specificity)}</dd></div>
              <div><dt>F1</dt><dd>{row.F1.toFixed(4)}</dd></div>
              <div><dt>False positives</dt><dd>{count(row.FP)}</dd></div>
              <div><dt>False negatives</dt><dd>{count(row.FN)}</dd></div>
            </dl>
          </div>
        </div>
        {comparisonTable}
        {exactThresholdTable}
      </div>
    </FigureFrame>
  );
}
