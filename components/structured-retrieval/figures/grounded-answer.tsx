"use client";

import { ReactNode, useRef, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { campaigns, creators, num, pct } from "../fixture";

const VIEWS = 18400;
const INTERACTIONS = 736;
const QUESTION = "What was the interaction rate for this Cedar TikTok post?";

type Frame = { label: string; body: ReactNode; tone?: "error" | "user" };

const mono = "font-mono text-[0.75rem] leading-relaxed";

function frames(ambiguous: boolean, missing: boolean): Frame[] {
  const all: Frame[] = [
    {
      label: "Screenshot",
      body: (
        <p className={mono}>
          TikTok-style insights · Views <span className="text-zinc-100">18,400</span> · Interactions <span className="text-zinc-100">{ambiguous ? "7З6" : "736"}</span>
        </p>
      ),
    },
    {
      label: "OCR",
      body: (
        <pre className={cn(mono, "whitespace-pre-wrap")}>
          {`"Views"         x 24   y 88\n"18,400"        x 196  y 88\n"Interactions"  x 24   y 112\n"${ambiguous ? "7З6" : "736"}"${ambiguous ? "         " : "           "}x 196  y 112`}
        </pre>
      ),
    },
    ambiguous
      ? {
          label: "Validation",
          tone: "user",
          body: (
            <p className={mono}>
              views: 18400 <span className="bi-tone-text" data-tone="code">✓</span>
              <br />
              interactions: “7З6” <span className="bi-tone-text" data-tone="user">needs review</span>, not an integer
              <br />
              <span className="text-zinc-500">The record stops here. Nothing downstream sees an unverified value.</span>
            </p>
          ),
        }
      : {
          label: "Validation",
          body: (
            <p className={mono}>
              views: 18400 <span className="bi-tone-text" data-tone="code">✓ integer</span>
              <br />
              interactions: 736 <span className="bi-tone-text" data-tone="code">✓ integer, ≤ views</span>
            </p>
          ),
        },
    {
      label: "Storage",
      body: (
        <p className={mono}>
          post → {creators.mara} → {campaigns.cedar.name}
          <br />
          platform TikTok · views {num(VIEWS)} · interactions {num(INTERACTIONS)}
        </p>
      ),
    },
    {
      label: "Context",
      body: (
        <p className={mono}>
          post facts + scope (Cedar launch, TikTok)
          <br />+ {creators.mara} context within Cedar
          <br />+ Cedar campaign context
        </p>
      ),
    },
    missing
      ? {
          label: "Retrieval",
          tone: "error",
          body: (
            <p className={mono}>
              scope: {campaigns.cedar.name} · TikTok · authorized
              <br />
              match: <span className="bi-tone-text" data-tone="error">no eligible post in scope</span>
              <br />
              <span className="text-zinc-500">Answer: “I don&apos;t have data for that post in the Cedar launch.”</span>
            </p>
          ),
        }
      : {
          label: "Retrieval",
          body: (
            <p className={mono}>
              scope: {campaigns.cedar.name} · TikTok · authorized
              <br />
              match: {creators.mara} post, contextual tier
            </p>
          ),
        },
    {
      label: "Fetch",
      body: (
        <p className={mono}>
          MySQL · authorization re-checked
          <br />
          views {num(VIEWS)} · interactions {num(INTERACTIONS)}
        </p>
      ),
    },
    {
      label: "Calculation",
      body: (
        <p className={mono}>
          interaction rate = interactions ÷ views
          <br />
          <span className="text-zinc-100">
            {INTERACTIONS} ÷ {num(VIEWS)} = {pct(INTERACTIONS / VIEWS)}
          </span>
        </p>
      ),
    },
    {
      label: "Answer",
      body: (
        <p className="text-[0.85rem] leading-relaxed text-zinc-200">
          The Cedar launch TikTok post by {creators.mara} had an interaction rate of <span className="font-mono">{pct(INTERACTIONS / VIEWS)}</span>, defined as interactions divided by
          views ({INTERACTIONS} ÷ {num(VIEWS)}).
        </p>
      ),
    },
  ];
  const last = ambiguous ? 2 : missing ? 5 : all.length - 1;
  return all.slice(0, last + 1);
}

const caption = "Illustrative screenshot-to-answer path through the proposed design, using entirely synthetic data. Every handoff preserves scope and provenance.";

export function GroundedAnswer({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const [ambiguous, setAmbiguous] = useState(false);
  const [missing, setMissing] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const list = frames(ambiguous, missing);
  const sequence = useSequence({ length: list.length, stepMs: 1500, rootRef: ref, autoplay: false });
  const step = Math.min(Math.max(sequence.step, 0), list.length - 1);
  const frame = list[step];
  const ended = list.length < 9;

  const toggle = (kind: "ambiguous" | "missing") => {
    const nextAmbiguous = kind === "ambiguous" ? !ambiguous : false;
    const nextMissing = kind === "missing" ? !missing : false;
    setAmbiguous(nextAmbiguous);
    setMissing(nextMissing);
    sequence.reset();
    setAnnouncement(
      nextAmbiguous
        ? "Ambiguous extraction: the walkthrough stops at validation for review."
        : nextMissing
          ? "Missing evidence: the walkthrough ends at retrieval with an unavailable-data response."
          : "Complete path restored.",
    );
  };

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Illustrative walkthrough"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <ControlButton pressed={ambiguous} onClick={() => toggle("ambiguous")}>
            Ambiguous extraction
          </ControlButton>
          <ControlButton pressed={missing} onClick={() => toggle("missing")}>
            Missing evidence
          </ControlButton>
          <SequenceControls sequence={sequence} steps={list} name="the walkthrough" showSteps={false} />
        </>
      }
    >
      <div className="border-b border-zinc-800/50 px-4 py-2.5">
        <MonoLabel>Question</MonoLabel>
        <p className="mt-0.5 font-mono text-[0.8rem] text-zinc-200">“{QUESTION}”</p>
      </div>
      <div className="space-y-4 p-4">
        <ol className="grid grid-cols-3 gap-1.5 @xl:grid-cols-9" aria-label="Handoffs">
          {Array.from({ length: 9 }, (_, i) => {
            const available = i < list.length;
            const label = available ? list[i].label : ["Screenshot", "OCR", "Validation", "Storage", "Context", "Retrieval", "Fetch", "Calculation", "Answer"][i];
            const state = !available ? "muted" : sequence.step < 0 ? "idle" : i === step ? "active" : i < step ? "visited" : "idle";
            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    sequence.goTo(i);
                    setAnnouncement(`Handoff ${i + 1}: ${label}.`);
                  }}
                  className="pal-card bi-control w-full cursor-pointer rounded-md border px-2 py-1.5 text-left disabled:cursor-default"
                  data-state={state}
                  data-tone={available && list[i].tone ? list[i].tone : "code"}
                >
                  <span className="block font-mono text-[0.62rem] text-zinc-500">{i + 1}</span>
                  <span className="block truncate text-[0.7rem] text-zinc-300">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between">
            <MonoLabel>Inspect handoff</MonoLabel>
            <span className="font-mono text-[0.7rem] text-zinc-400">
              {step + 1} / {list.length}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={list.length - 1}
            value={step}
            onChange={(event) => sequence.goTo(Number(event.target.value))}
            aria-valuetext={`Handoff ${step + 1}: ${frame.label}`}
            className="pal-range"
          />
        </label>

        <div className="pal-card rounded-md border px-3.5 py-2 text-zinc-400" data-state="active" data-tone={frame.tone ?? "code"}>
          <MonoLabel>
            {step + 1} · {frame.label}
          </MonoLabel>
          <div className="mt-2">{frame.body}</div>
        </div>
        {ended && (
          <p className="text-[0.75rem] leading-snug text-zinc-500">
            {ambiguous
              ? "An ambiguous value is routed to review rather than guessed. The pipeline never produces a number it cannot trace back to a validated field."
              : "With no eligible evidence in scope, the answer says so instead of borrowing a similar post from another campaign."}
          </p>
        )}
      </div>
    </FigureFrame>
  );
}
