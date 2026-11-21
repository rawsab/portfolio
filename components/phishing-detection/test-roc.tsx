import { FigureFrame } from "@/components/brand-identity/figure-frame";
import { AxisBottom, AxisLeft, linear, linePath } from "@/components/palitronica/plot";
import { percent, type FigureProps } from "./figure-parts";
import { configuredThreshold, thresholdRows } from "./threshold.data";
import { initialRocPoint, rocAuc, rocRates } from "./roc.data";

const x = linear([0, 1], [52, 240]);
const y = linear([0, 1], [216, 28]);
const ticks = [0, 0.25, 0.5, 0.75, 1];
const curve = linePath(rocRates.map(([fpr, tpr]) => [x(fpr), y(tpr)]));
const row = thresholdRows[Math.round(configuredThreshold * 100)];
const markerX = x(row.false_positive_rate);
const markerY = y(row.recall);

export function TestRoc(props: FigureProps) {
  return (
    <FigureFrame
      {...props}
      width="column"
      badge="Recomputed test ROC"
      caption="Each operating point plots malicious recall against the fraction of benign URLs flagged. The highlighted point starts at the 0.50 cutoff."
    >
      <div className="pd-body pd-roc">
        <div className="pd-roc-summary">
          <div><span className="pd-panel-title bi-figure-label">Rank-based ROC AUC</span><strong className="pd-value">{rocAuc.toFixed(4)}</strong></div>
          <p className="pd-note">{rocRates.length.toLocaleString("en-US")} exported points on the original URL-level test split.</p>
        </div>
        <svg className="pd-chart" viewBox="0 0 266 256" role="img" aria-label={`ROC curve with AUC ${rocAuc.toFixed(4)} and a marker at the configured 0.50 cutoff. The dotted diagonal is chance.`}>
          <AxisLeft scale={y} values={ticks} at={52} label="True-positive rate" grid={188} />
          <AxisBottom scale={x} values={ticks} at={216} label="False-positive rate" />
          <line className="pd-guide" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
          <text className="pd-plot-label" x={x(0.6)} y={y(0.6) + 16}>Chance</text>
          <path className="pd-roc-trace" d={curve} />
          <circle cx={markerX} cy={markerY} r="4" className="pd-roc-marker" />
          <path className="pd-guide" d={`M${markerX + 5},${markerY + 4} L${markerX + 20},${markerY + 23} h16`} />
          <text className="pd-plot-label" x={markerX + 40} y={markerY + 27}>0.50 configured</text>
        </svg>
        <p className="pd-readout">At 0.50 · FPR {percent(row.false_positive_rate)} · TPR {percent(row.recall)}</p>
        <details className="pd-details">
          <summary className="bi-focusable rounded-sm">Exact AUC, operating point and ROC coordinates</summary>
          <p className="pd-note">AUC {rocAuc} · At 0.50, FPR {row.false_positive_rate} and TPR {row.recall}. The initial threshold is {String(initialRocPoint.threshold)} (positive infinity).</p>
          <pre className="pd-roc-rates" tabIndex={0} aria-label="Exported ROC rates in source order">{`FPR,TPR\n${rocRates.map((point) => point.join(",")).join("\n")}`}</pre>
        </details>
      </div>
    </FigureFrame>
  );
}
