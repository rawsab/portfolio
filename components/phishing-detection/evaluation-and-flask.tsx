"use client";

import { useRef, useState } from "react";
import { ControlButton, FigureFrame } from "@/components/brand-identity/figure-frame";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { count, DataTable, type FigureProps } from "./figure-parts";
import { candidateSplits, mixedLabelGroups, quarantined } from "./hosts.data";

const protocol = [
  { title: "Group by registrable domain", split: null, note: "Freeze normalized keys across labels. Keep each mixed-label group together, group canonical IP literals separately, and quarantine entries without a reliable key." },
  { title: "Allocate grouped splits", split: null, note: "Assign each group to train, validation, or test once. The candidate uses one of 20 grouped folds for test and three distinct folds for validation." },
  { title: "Fit the tokenizer", split: "Train", note: "Build the vocabulary on training URLs only, then freeze it for validation and test." },
  { title: "Train from fresh initialization", split: "Train", note: "Use training URLs to fit a freshly initialized model with the frozen tokenizer." },
  { title: "Select checkpoint and threshold", split: "Validation", note: "Use validation groups for checkpoint, hyperparameter, and threshold selection." },
  { title: "Score frozen groups once", split: "Test", note: "Apply the fixed tokenizer, checkpoint, and threshold to the frozen test groups." },
] as const;

export function GroupedEvaluationPlan(props: FigureProps) {
  const [step, setStep] = useState(0);
  const current = protocol[step];

  return (
    <FigureFrame
      {...props}
      width="column"
      badge="Future experiment · not yet run"
      caption="Future experiment. The candidate counts describe a split-sizing check only."
    >
      <div className="pd-body">
        <ol className="pd-protocol">
          {protocol.map(({ title, split }, index) => (
            <li key={title}>
              <ControlButton pressed={index === step} onClick={() => setStep(index)}>
                <span><span className="pd-step-index">{index + 1}</span> {title}</span>
                {split && <span className="pd-split-tag">{split} only</span>}
              </ControlButton>
            </li>
          ))}
        </ol>
        <p className="pd-readout" aria-live="polite">{current.note}</p>
        {step < 2 && (
          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">Synthetic group · cedar.example</h3>
            <p className="pd-note"><code>docs.cedar.example</code> and <code>help.cedar.example</code> go to the same split.</p>
          </div>
        )}
        <p className="pd-note">Before fitting, verify pairwise disjoint groups, canonical hosts, and exact URL strings. Confirm each eligible URL was assigned once.</p>
        <div className="pd-diagram-panel">
          <h3 className="pd-panel-title bi-figure-label">Candidate allocation · split sizing only</h3>
          <DataTable label="Candidate domain-or-IP grouped splits" headings={["Split", "URLs", "Benign", "Malicious", "Groups"]} rows={candidateSplits.map(([name, ...values]) => [name, ...values.map(count)])} />
          <p className="pd-note">Quarantined {count(quarantined.benign)} benign and {count(quarantined.malicious)} malicious URLs. Kept {count(mixedLabelGroups)} mixed-label groups intact.</p>
        </div>
        <details className="pd-details">
          <summary className="bi-focusable rounded-sm">Complete grouped evaluation protocol</summary>
          <ol className="pd-protocol-notes">
            {protocol.map(({ title, note, split }) => (
              <li key={title}>
                <strong>{title}{split && ` · ${split} only`}:</strong> <span className="pd-step-note">{note}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </FigureFrame>
  );
}

const flaskStages = [
  { title: "Validate the JSON request", note: "Require a nonempty URL string, trim whitespace, and enforce the service’s length limit." },
  { title: "Load saved encoding and model", note: "The saved tokenizer maps characters to a 128-position input. The released checkpoint scores that input." },
  { title: "Read a symbolic score", note: "The sigmoid emits p, a score from 0 to 1 for this illustration." },
  { title: "Apply the inclusive 0.50 rule", note: "Classify as malicious when the unrounded p is at least 0.50." },
  { title: "Return the response fields", note: "Round the displayed score to four decimals after classifying the full-precision score." },
];
const request = '{ "url": "https://docs.example/reference" }';
const response = `{
  "malicious_probability": round(p, 4),
  "is_malicious": p >= 0.50,
  "verdict": p >= 0.50
    ? "The URL is likely to be malicious."
    : "The URL is not likely to be malicious."
}`;

export function FlaskPredictionPath(props: FigureProps) {
  const rootRef = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: flaskStages.length, stepMs: 1400, rootRef, threshold: 0.35 });
  const shown = sequence.step + 1;
  const done = shown === flaskStages.length;

  return (
    <FigureFrame
      {...props}
      ref={rootRef}
      width="column"
      badge="Illustrative"
      caption="An illustrative request follows the same tokenizer, checkpoint, and cutoff used by the service."
      controls={
        <ControlButton onClick={() => sequence.goTo(done ? -1 : shown)}>
          {done ? "Reset request" : "Next step"}
        </ControlButton>
      }
    >
      <div className="pd-body">
        <p className="pd-note"><code>GET /health</code> · service status</p>
        <div className="pd-diagram-panel">
          <h3 className="pd-panel-title bi-figure-label"><code>POST /predict</code> · synthetic request</h3>
          <pre className="pd-code">{request}</pre>
          <p className="pd-note">This local illustration only displays the request and response path.</p>
        </div>
        <ol className="pd-flask-rail">
          {flaskStages.map(({ title, note }, index) => (
            <li key={title} data-active={shown === index + 1 || undefined}>
              <p>
                <span className="pd-step-index">{index + 1}</span> {title}
                {index < shown && <>: <span className="pd-step-note">{note}</span></>}
              </p>
              {done && index === flaskStages.length - 1 && <pre className="pd-code" aria-label="Symbolic response fields">{response}</pre>}
            </li>
          ))}
        </ol>
        <details className="pd-details">
          <summary className="bi-focusable rounded-sm">Complete request-to-response flow</summary>
          <ol className="pd-protocol-notes">
            {flaskStages.map(({ title, note }) => (
              <li key={title}><strong>{title}:</strong> <span className="pd-step-note">{note}</span></li>
            ))}
          </ol>
          <pre className="pd-code" aria-label="Symbolic response fields">{response}</pre>
        </details>
      </div>
    </FigureFrame>
  );
}
