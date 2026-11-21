"use client";

import { ReactNode, useRef, useState } from "react";
import { Database, FileSpreadsheet } from "lucide-react";
import { ControlButton, FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { campaigns, creators, num } from "../fixture";

const STEPS = [
  { label: "Platform detection", summary: "The screen's layout and markers identify it as a TikTok-style insights view, which selects the expected fields." },
  { label: "Preprocessing and OCR", summary: "The image is cleaned up and Tesseract returns words with their positions. Positions matter as much as the characters." },
  { label: "Association and validation", summary: "Labels are paired with nearby values and interpreted into fields, then checked before anything is stored." },
  { label: "Structured storage", summary: "Validated values are stored in MySQL with their post, creator-within-campaign, and campaign relationships." },
  { label: "Spreadsheet export", summary: "The same validated data is exported as a spreadsheet report through ExcelJS." },
];

const METRICS = [
  { label: "Views", value: 18400 },
  { label: "Interactions", value: 736 },
  { label: "Likes", value: 612 },
  { label: "Comments", value: 41 },
  { label: "Shares", value: 83, ambiguous: "8З" },
];

const caption =
  "Conceptual Flometrics workflow, illustrated with synthetic data. Validated metrics retain their post, creator, and campaign relationships. Entity cards are conceptual, not a production schema.";

type StageState = "idle" | "active" | "visited";

export function ScreenshotPipeline({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: STEPS.length, stepMs: 2200, rootRef: ref, threshold: 0.45 });
  const [ambiguous, setAmbiguous] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const step = sequence.step;
  const current = STEPS[Math.max(step, 0)];

  const stageState = (index: number): StageState => (step < index ? "idle" : step === index ? "active" : "visited");
  const detected = step >= 0;
  const boxed = step >= 1;
  const paired = step >= 2;
  const stored = step >= 3;
  const exported = step >= 4;

  const storedMetrics = METRICS.filter((metric) => !(ambiguous && metric.ambiguous));

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <ControlButton
            pressed={ambiguous}
            onClick={() => {
              setAmbiguous((value) => !value);
              setAnnouncement(
                ambiguous
                  ? "All fields read cleanly."
                  : "The shares value is ambiguous. Validation routes it to review instead of storing it.",
              );
            }}
          >
            Ambiguous field
          </ControlButton>
          <SequenceControls
            sequence={sequence}
            steps={STEPS}
            name="the screenshot pipeline"
            onStep={(index) => setAnnouncement(`Step ${index + 1}: ${STEPS[index].label}. ${STEPS[index].summary}`)}
          />
        </>
      }
    >
      <div className="grid gap-4 p-4 @2xl:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="sr-phone mx-auto w-full max-w-[14rem] rounded-[1.4rem] border p-2.5">
          <div className="rounded-[1rem] bg-black/40 px-3 pt-3 pb-2.5">
            <div className="flex items-center justify-between">
              <span className={cn("sr-ocr rounded px-1 text-[0.7rem] text-zinc-300", detected && "sr-ocr-detected")} data-on={detected || undefined}>
                ♪ Post insights
              </span>
              <span className="font-mono text-[0.6rem] text-zinc-600">Last 7 days</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {METRICS.map((metric, index) => {
                const flagged = ambiguous && metric.ambiguous && paired;
                return (
                  <div key={metric.label} className="flex items-center gap-1.5 text-[0.75rem]">
                    <span className="sr-ocr rounded px-1 text-zinc-400" data-on={boxed || undefined} style={{ transitionDelay: `${index * 60}ms` }}>
                      {metric.label}
                    </span>
                    <span className="sr-pair h-px flex-1" data-on={paired || undefined} data-flagged={flagged || undefined} />
                    <span
                      className={cn("sr-ocr rounded px-1 font-mono text-zinc-100 tabular-nums", ambiguous && metric.ambiguous && "sr-smudge")}
                      data-on={boxed || undefined}
                      data-flagged={flagged || undefined}
                      style={{ transitionDelay: `${index * 60 + 30}ms` }}
                    >
                      {ambiguous && metric.ambiguous ? metric.ambiguous : num(metric.value)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 border-t border-zinc-800/80 pt-2 text-center font-mono text-[0.6rem] tracking-tight text-zinc-600 uppercase">Synthetic example</p>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <ol className="grid gap-1.5 @xl:grid-cols-5" aria-label="Pipeline stages">
            {STEPS.map((stage, index) => (
              <li key={stage.label} className="pal-card flex items-start gap-2 rounded-md border px-2.5 py-2 @xl:flex-col @xl:gap-1" data-state={stageState(index)} data-tone="code">
                <span className="font-mono text-[0.68rem] text-zinc-500">{index + 1}</span>
                <span className="text-[0.75rem] leading-snug text-zinc-300">{stage.label}</span>
              </li>
            ))}
          </ol>

          <div className="grid gap-2 @xl:grid-cols-3">
            <EntityCard label="Post" on={stored}>
              <Row k="platform" v="TikTok" />
              {storedMetrics.slice(0, 2).map((metric) => (
                <Row key={metric.label} k={metric.label.toLowerCase()} v={num(metric.value)} />
              ))}
              {ambiguous && <Row k="shares" v="needs review" tone="user" />}
            </EntityCard>
            <EntityCard label="Creator in campaign" on={stored}>
              <Row k="creator" v={creators.mara} />
              <Row k="campaign" v={campaigns.cedar.name} />
              <Row k="posts" v="3" />
            </EntityCard>
            <EntityCard label="Campaign" on={stored}>
              <Row k="name" v={campaigns.cedar.name} />
              <Row k="creators" v="3" />
              <Row k="platforms" v="2" />
            </EntityCard>
          </div>

          <div className="grid gap-2 @xl:grid-cols-2">
            <div className="pal-card flex items-center gap-2.5 rounded-md border px-3 py-2" data-state={stored ? (step === 3 ? "active" : "visited") : "idle"} data-tone="code">
              <Database className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              <div className="min-w-0">
                <MonoLabel>MySQL</MonoLabel>
                <p className="text-[0.72rem] leading-snug text-zinc-500">Validated facts and relationships</p>
              </div>
            </div>
            <div className="pal-card flex items-center gap-2.5 rounded-md border px-3 py-2" data-state={exported ? "active" : "idle"} data-tone="code">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              <div className="min-w-0">
                <MonoLabel>ExcelJS export</MonoLabel>
                <p className="text-[0.72rem] leading-snug text-zinc-500">
                  {ambiguous ? `${storedMetrics.length} of ${METRICS.length} fields exported; 1 held for review` : "Spreadsheet report for review and comparison"}
                </p>
              </div>
            </div>
          </div>

          <details className="rounded-md border border-zinc-800/80 bg-black/20">
            <summary className="bi-focusable rounded-md px-3 py-2">
              Who does what: Tesseract and the OpenAI API
            </summary>
            <div className="grid gap-3 px-3 pb-3 text-[0.75rem] leading-relaxed text-zinc-500 @xl:grid-cols-2">
              <p>
                <span className="text-zinc-300">Tesseract</span> extracts text and word positions from the preprocessed image. It reads characters; it does not decide what a
                number means.
              </p>
              <p>
                <span className="text-zinc-300">The OpenAI API</span> interprets the extracted text into named fields. Validation then checks those fields before storage,
                so an uncertain reading stops at review instead of becoming a stored fact.
              </p>
            </div>
          </details>
        </div>
      </div>

      <p className="min-h-[2.75rem] border-t border-zinc-800/50 px-4 py-3 text-sm leading-relaxed text-[#8F8F8F]" aria-hidden>
        <span className="text-zinc-200">{current.label}.</span> {ambiguous && step === 2 ? "The shares value does not read cleanly, so it is flagged for review and withheld from storage." : current.summary}
      </p>
    </FigureFrame>
  );
}

function EntityCard({ label, on, children }: { label: string; on: boolean; children: ReactNode }) {
  return (
    <div className="pal-card rounded-md border p-3" data-state={on ? "visited" : "muted"}>
      <MonoLabel>{label}</MonoLabel>
      <dl className={cn("mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 font-mono text-[0.7rem] transition-opacity duration-300", !on && "opacity-0")}>
        {children}
      </dl>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "user" }) {
  return (
    <>
      <dt className="text-zinc-600">{k}</dt>
      <dd className={cn("truncate text-zinc-300", tone && "bi-tone-text")} data-tone={tone}>
        {v}
      </dd>
    </>
  );
}
