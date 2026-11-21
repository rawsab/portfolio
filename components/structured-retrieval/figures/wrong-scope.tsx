"use client";

import { useRef, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { Post, campaigns, creators, pct, postById, posts, rate } from "../fixture";
import { PlatformMark } from "./marks";

type Query = "lookup" | "average";
type Strategy = "raw" | "constrained";

const QUERIES: Record<Query, string> = {
  lookup: "Show TikTok engagement for the Cedar launch.",
  average: "What was the average TikTok engagement rate across the Cedar launch?",
};

/** Scripted rankings; illustrative, not benchmark traces. */
const RANKINGS: Record<Query, Record<Strategy, string[]>> = {
  lookup: { raw: ["b1", "c1", "c3", "b2"], constrained: ["c1", "c3", "c5", "c2"] },
  average: { raw: ["c1", "b1", "c3", "c5"], constrained: ["c1", "c3", "c5", "c4"] },
};

const eligible = (post: Post) => post.campaign === "cedar" && post.platform === "TikTok";
const ELIGIBLE = posts.filter(eligible);

function pooled(list: Post[]) {
  const interactions = list.reduce((sum, post) => sum + post.interactions, 0);
  const views = list.reduce((sum, post) => sum + post.views, 0);
  return interactions / views;
}

const STEPS = [{ label: "Candidates" }, { label: "Ranked results" }];

const caption =
  "Synthetic failure case: related vocabulary retrieves a record from a different campaign. Filtering fixes scope; complete aggregation still requires the full eligible dataset. Rankings are illustrative, not benchmark traces.";

export function WrongScope({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: STEPS.length, stepMs: [1400, 600], rootRef: ref, threshold: 0.5 });
  const [query, setQuery] = useState<Query>("lookup");
  const [strategy, setStrategy] = useState<Strategy>("raw");
  const [provenance, setProvenance] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const ranked = sequence.step >= 1;
  const ranking = RANKINGS[query][strategy].map((postId) => postById[postId]);
  const constrained = strategy === "constrained";
  const mismatches = ranking.filter((post) => !eligible(post)).length;
  const retrievedRate = pooled(ranking);
  const fullRate = pooled(ELIGIBLE);

  const describe = (q: Query, s: Strategy) =>
    RANKINGS[q][s]
      .map((postId, i) => {
        const post = postById[postId];
        return `${i + 1}. ${creators[post.creator]}, ${post.platform}, ${campaigns[post.campaign].name}, ${pct(rate(post))}`;
      })
      .join("; ");

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
          <SegmentedControl
            label="Query"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setAnnouncement(`Query: ${QUERIES[value]}`);
            }}
            options={[
              { value: "lookup", label: "Lookup" },
              { value: "average", label: "Average" },
            ]}
          />
          <SegmentedControl
            label="Retrieval strategy"
            value={strategy}
            onChange={(value) => {
              setStrategy(value);
              if (!ranked) sequence.goTo(1);
              setAnnouncement(
                value === "raw"
                  ? "Raw row ranking. Every record is a candidate."
                  : "Explicit campaign and platform constraints. Only Cedar TikTok records are eligible before ranking.",
              );
            }}
            options={[
              { value: "raw", label: "Raw rows" },
              { value: "constrained", label: "Constraints" },
            ]}
          />
          <ControlButton
            pressed={provenance}
            onClick={() => {
              setProvenance((value) => !value);
              setAnnouncement(provenance ? "Campaign labels collapsed." : `Campaign labels shown. ${mismatches} of the top results belong to another campaign.`);
            }}
          >
            Provenance
          </ControlButton>
          <SequenceControls sequence={sequence} steps={STEPS} name="retrieval" showSteps={false} />
        </>
      }
    >
      <div className="border-b border-zinc-800/50 px-4 py-3">
        <MonoLabel>Query</MonoLabel>
        <p className="mt-1 font-mono text-[0.8rem] text-zinc-200">“{QUERIES[query]}”</p>
        {constrained && (
          <p className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-[0.68rem]">
            <span className="sr-chip rounded border px-1.5 py-px" data-tone="code">
              campaign = Cedar launch
            </span>
            <span className="sr-chip rounded border px-1.5 py-px" data-tone="code">
              platform = TikTok
            </span>
          </p>
        )}
      </div>

      <div className="grid gap-4 p-4 @2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <MonoLabel>Candidate records</MonoLabel>
            <span className="text-[0.68rem] text-zinc-600">{constrained ? `${ELIGIBLE.length} of ${posts.length} eligible` : `${posts.length} candidates`}</span>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 @xl:grid-cols-3">
            {posts.map((post) => {
              const out = constrained && !eligible(post);
              const rank = ranking.indexOf(post);
              return (
                <li
                  key={post.id}
                  className={cn("pal-card rounded-md border px-2 py-1.5", ranked && rank >= 0 && "sr-record-ranked", out && "sr-record-out")}
                  data-tone={campaigns[post.campaign].tone}
                >
                  <div className="flex items-center gap-1.5">
                    <PlatformMark platform={post.platform} tone={campaigns[post.campaign].tone} />
                    <span className="truncate text-[0.7rem] text-zinc-300">{creators[post.creator]}</span>
                    {ranked && rank >= 0 && <span className="ml-auto font-mono text-[0.62rem] text-zinc-400">#{rank + 1}</span>}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1 font-mono text-[0.64rem] text-zinc-500">
                    <span>{pct(rate(post))}</span>
                    <span className={cn("truncate", provenance || out ? "bi-tone-text" : "text-zinc-700")} data-tone={provenance || out ? campaigns[post.campaign].tone : undefined}>
                      {out ? (post.campaign !== "cedar" ? "out: campaign" : "out: platform") : provenance ? campaigns[post.campaign].name.split(" ")[0] : "campaign ▸"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <MonoLabel>Top 4 · {constrained ? "filtered, then ranked" : "nearest rows"}</MonoLabel>
            <span className="text-[0.68rem] text-zinc-600">illustrative</span>
          </div>
          <ol className={cn("mt-2 space-y-1.5 transition-opacity duration-300", !ranked && "opacity-30")}>
            {ranking.map((post, i) => {
              const wrong = !eligible(post);
              return (
                <li key={post.id} className="pal-card sr-result flex items-center gap-2.5 rounded-md border px-2.5 py-1.5" data-wrong={(provenance && wrong) || undefined}>
                  <span className="font-mono text-[0.68rem] text-zinc-500">{i + 1}</span>
                  <PlatformMark platform={post.platform} tone={campaigns[post.campaign].tone} />
                  <span className="min-w-0 flex-1 truncate text-[0.75rem] text-zinc-300">{creators[post.creator]}</span>
                  <span className="font-mono text-[0.7rem] text-zinc-400">{pct(rate(post))}</span>
                  <span className={cn("w-[5.5rem] text-right font-mono text-[0.66rem]", provenance ? "bi-tone-text" : "text-zinc-700")} data-tone={provenance ? (wrong ? "error" : "code") : undefined}>
                    {provenance ? (wrong ? "× Birch" : "✓ Cedar") : "·"}
                  </span>
                </li>
              );
            })}
          </ol>

          {query === "lookup" ? (
            <p className="mt-3 text-[0.75rem] leading-relaxed text-zinc-500">
              {constrained
                ? "Every candidate is a Cedar TikTok record before ranking begins, so similarity only orders eligible evidence."
                : provenance
                  ? `${mismatches} of the top 4 come from the Birch launch. They share the vocabulary of the question, not its scope.`
                  : "The list reads plausibly. Expand provenance to check which campaign each record came from."}
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="pal-card rounded-md border p-2.5" data-state="visited">
                <MonoLabel>Retrieved rows</MonoLabel>
                <p className="mt-1 font-mono text-sm text-zinc-200">{pct(retrievedRate)}</p>
                <p className="text-[0.68rem] leading-snug text-zinc-500">
                  {ranking.length - mismatches} of {ELIGIBLE.length} eligible{mismatches ? ` + ${mismatches} out of scope` : ""}
                </p>
              </div>
              <div className="pal-card rounded-md border p-2.5" data-state="active" data-tone="code">
                <MonoLabel>Full eligible set</MonoLabel>
                <p className="mt-1 font-mono text-sm text-zinc-200">{pct(fullRate)}</p>
                <p className="text-[0.68rem] leading-snug text-zinc-500">all {ELIGIBLE.length} Cedar TikTok rows, computed in SQL</p>
              </div>
              <p className="col-span-2 text-[0.72rem] leading-snug text-zinc-500">Engagement rate here is total interactions divided by total views. Filtering fixes scope; only the full set gives the average.</p>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only">
        Raw-row ranking for the lookup query: {describe("lookup", "raw")}. Constrained ranking: {describe("lookup", "constrained")}.
      </p>
    </FigureFrame>
  );
}
