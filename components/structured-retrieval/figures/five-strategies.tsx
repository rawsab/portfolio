"use client";

import { useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { cn } from "@/lib/utils";
import { StrategyId, creators, pct, postById, rate, strategies } from "../fixture";

type Level = "campaign" | "creator" | "post";

interface StrategySpec {
  indexed: Level[];
  creatorLine: string;
  campaignLine: string;
  postLine: string;
  metadata: boolean;
  context: boolean;
  units: string;
  embedded: string;
  filters: string;
  stages: string[];
  note: string;
}

const SPECS: Record<StrategyId, StrategySpec> = {
  A: {
    indexed: ["creator", "post"],
    creatorLine: "creator row",
    campaignLine: "not indexed",
    postLine: "post row",
    metadata: false,
    context: false,
    units: "Post and creator rows",
    embedded: "Each row's own fields",
    filters: "None",
    stages: ["Rank all rows"],
    note: "Every row is embedded on its own. The tree's relationships exist in the data but not in the vectors.",
  },
  B: {
    indexed: ["campaign"],
    creatorLine: "not indexed",
    campaignLine: "aggregate summary",
    postLine: "not indexed",
    metadata: false,
    context: false,
    units: "Campaign summaries",
    embedded: "Aggregates and platforms",
    filters: "None",
    stages: ["Rank summaries"],
    note: "A small, fast collection that matches broad questions. Post-level detail was never indexed, so no amount of summary text can return it.",
  },
  C: {
    indexed: ["creator", "post"],
    creatorLine: "row + descriptors",
    campaignLine: "not indexed",
    postLine: "+ descriptors",
    metadata: true,
    context: false,
    units: "Post and creator rows",
    embedded: "Row fields + descriptors",
    filters: "Campaign, platform, creator, format",
    stages: ["Filter by metadata", "Rank eligible rows"],
    note: "Descriptors appear in the embedded text and as stored metadata. The text nudges ranking; the filter decides eligibility.",
  },
  D: {
    indexed: ["campaign", "creator", "post"],
    creatorLine: "row + descriptors",
    campaignLine: "summary tier",
    postLine: "+ descriptors",
    metadata: true,
    context: false,
    units: "Enriched rows + campaign summaries",
    embedded: "Row fields + descriptors; summaries",
    filters: "Campaign, platform, creator, format",
    stages: ["Search summaries", "Scope to campaign", "Rank rows in scope"],
    note: "Summary search picks a campaign, then detailed search runs inside it. A wrong first choice sends the second stage to the wrong subset.",
  },
  E: {
    indexed: ["campaign", "creator", "post"],
    creatorLine: "creator-in-campaign",
    campaignLine: "campaign tier",
    postLine: "+ context",
    metadata: true,
    context: true,
    units: "Posts, creators, campaigns",
    embedded: "Post facts + creator and campaign context",
    filters: "Campaign, platform, creator, format",
    stages: ["Resolve scope", "Route to a tier", "Rank contextual posts"],
    note: "Each post carries compact parent context into its own embedding, and each level keeps its own entry point for broader questions.",
  },
};

const POSTS = [
  { id: "c1", x: 14, parent: "mara" },
  { id: "c2", x: 110, parent: "mara" },
  { id: "c3", x: 206, parent: "juno" },
  { id: "c4", x: 302, parent: "juno" },
] as const;
const CREATOR_BOXES = { mara: { x: 38, y: 92, w: 148, h: 42 }, juno: { x: 214, y: 92, w: 148, h: 42 } } as const;
const CAMPAIGN_BOX = { x: 118, y: 12, w: 164, h: 44 };
const POST_Y = 172;
const POST_W = 84;
const POST_H = 56;

const DETAIL_QUERY = "Which of Mara's Cedar TikTok posts had the higher interaction rate?";

const caption =
  "Five representations of the same synthetic analytics hierarchy. The tree and the example question stay fixed; only what is embedded, stored as metadata, and searched in stages changes.";

function VectorBadge({ x, y }: { x: number; y: number }) {
  return (
    <g className="sr-vector" transform={`translate(${x} ${y})`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 3.4} y={6 - [3, 6, 4, 5][i]} width={2.2} height={[3, 6, 4, 5][i] + 2} rx={0.6} />
      ))}
    </g>
  );
}

function TreeNode({
  box,
  title,
  lines,
  indexed,
  evidence,
  missing,
}: {
  box: { x: number; y: number; w: number; h: number };
  title: string;
  lines: string[];
  indexed: boolean;
  evidence?: boolean;
  missing?: boolean;
}) {
  const top = box.y + box.h / 2 - (lines.length * 13) / 2 - 1;
  return (
    <g className="bi-node" data-tone={missing ? "error" : "model"} data-state={missing ? "error" : evidence ? "active" : indexed ? "visited" : "muted"}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={6} />
      <text x={box.x + box.w / 2} y={top} textAnchor="middle" dominantBaseline="central" className="bi-node-title sr-tree-title">
        {title}
      </text>
      {lines.map((line, i) => (
        <text key={line} x={box.x + box.w / 2} y={top + 16 + i * 13} textAnchor="middle" dominantBaseline="central" className="bi-node-line sr-tree-line">
          {line}
        </text>
      ))}
      {indexed && <VectorBadge x={box.x + box.w - 18} y={box.y + 6} />}
    </g>
  );
}

function Tree({ strategy, detail }: { strategy: StrategyId; detail: boolean }) {
  const spec = SPECS[strategy];
  const has = (level: Level) => spec.indexed.includes(level);
  const postsMissing = detail && !has("post");
  return (
    <svg viewBox="0 0 400 258" className="bi-diagram" role="img" aria-label={`Strategy ${strategy}: ${spec.units} indexed. Embedded context: ${spec.embedded}. Filters: ${spec.filters}.`}>
      <g className="sr-tree-edges" data-context={spec.context || undefined}>
        {(["mara", "juno"] as const).map((key) => {
          const box = CREATOR_BOXES[key];
          const cx = box.x + box.w / 2;
          return <path key={key} d={`M${CAMPAIGN_BOX.x + CAMPAIGN_BOX.w / 2} ${CAMPAIGN_BOX.y + CAMPAIGN_BOX.h} V74 H${cx} V${box.y}`} className="sr-tree-edge pal-flow" data-running={spec.context || undefined} />;
        })}
        {POSTS.map((post) => {
          const box = CREATOR_BOXES[post.parent];
          return (
            <path
              key={post.id}
              d={`M${box.x + box.w / 2} ${box.y + box.h} V153 H${post.x + POST_W / 2} V${POST_Y}`}
              className="sr-tree-edge pal-flow"
              data-running={spec.context || undefined}
            />
          );
        })}
      </g>

      <TreeNode box={CAMPAIGN_BOX} title="Cedar launch" lines={[spec.campaignLine]} indexed={has("campaign")} />
      {(["mara", "juno"] as const).map((key) => (
        <TreeNode key={key} box={CREATOR_BOXES[key]} title={creators[key]} lines={[spec.creatorLine]} indexed={has("creator")} />
      ))}
      {POSTS.map((item, i) => {
        const post = postById[item.id];
        const evidence = detail && has("post") && item.parent === "mara";
        return (
          <g key={item.id}>
            <TreeNode
              box={{ x: item.x, y: POST_Y, w: POST_W, h: POST_H }}
              title={`Post ${i + 1}`}
              lines={[pct(rate(post)), spec.postLine]}
              indexed={has("post")}
              evidence={evidence}
              missing={postsMissing && item.parent === "mara"}
            />
            {spec.metadata && has("post") && (
              <g className="sr-meta">
                <rect x={item.x + 6} y={POST_Y + POST_H + 6} width={POST_W - 12} height={15} rx={7.5} />
                <text x={item.x + POST_W / 2} y={POST_Y + POST_H + 13.5} textAnchor="middle" dominantBaseline="central">
                  Cedar · TikTok
                </text>
              </g>
            )}
          </g>
        );
      })}
      {spec.context && (
        <text x={392} y={84} textAnchor="end" className="bi-note" data-tone="model">
          context ↓
        </text>
      )}
      {strategy === "A" && (
        <text x={392} y={84} textAnchor="end" className="bi-note">
          not embedded
        </text>
      )}
    </svg>
  );
}

export function FiveStrategies({ id, number, title }: { id: string; number: number; title: string }) {
  const [strategy, setStrategy] = useState<StrategyId>("A");
  const [detail, setDetail] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const spec = SPECS[strategy];
  const name = strategies.find((item) => item.id === strategy)!.name;
  const detailLost = detail && !spec.indexed.includes("post");

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Strategy"
            value={strategy}
            onChange={(value) => {
              setStrategy(value);
              setAnnouncement(`Strategy ${value}, ${strategies.find((item) => item.id === value)!.name}. ${SPECS[value].note}`);
            }}
            options={strategies.map((item) => ({ value: item.id, label: item.id }))}
          />
          <ControlButton
            pressed={detail}
            onClick={() => {
              setDetail((value) => !value);
              setAnnouncement(detail ? "Detail query cleared." : `Detail query: ${DETAIL_QUERY}`);
            }}
          >
            Detail query
          </ControlButton>
        </>
      }
    >
      <div className="grid gap-4 p-4 @2xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Tree strategy={strategy} detail={detail} />
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.7rem] text-zinc-500" aria-label="Legend">
            <li className="inline-flex items-center gap-1.5">
              <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden className="sr-vector">
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={i * 3.4} y={[5, 2, 4, 3][i]} width={2.2} height={[5, 8, 6, 7][i]} rx={0.6} />
                ))}
              </svg>
              embedded information
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="sr-chip rounded-full border px-1.5 py-px font-mono text-[0.6rem]" data-tone="code">
                tag
              </span>
              stored metadata
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="rounded border border-zinc-700 px-1 font-mono text-[0.6rem] text-zinc-400">1</span>
              retrieval stage
            </li>
          </ul>
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <MonoLabel>Strategy {strategy}</MonoLabel>
            <p className="mt-0.5 text-sm text-zinc-100">{name}</p>
          </div>
          <dl className="pal-manifest">
            <dt>indexed</dt>
            <dd>{spec.units}</dd>
            <dt>embedded</dt>
            <dd>{spec.embedded}</dd>
            <dt>filters</dt>
            <dd className={cn(spec.metadata && "bi-tone-text")} data-tone={spec.metadata ? "code" : undefined}>
              {spec.filters}
            </dd>
          </dl>
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="Retrieval stages">
            {spec.stages.map((stage, i) => (
              <li key={stage} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="text-zinc-700" aria-hidden>→</span>}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-black/20 px-2 py-1 text-[0.7rem] text-zinc-300">
                  <span className="font-mono text-zinc-500">{i + 1}</span>
                  {stage}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[0.78rem] leading-relaxed text-zinc-400">{spec.note}</p>
          {detail && (
            <div className={cn("rounded-md border p-2.5 text-[0.72rem] leading-snug", detailLost ? "sr-alert" : "border-zinc-800 bg-black/20 text-zinc-400")}>
              <span className="font-mono text-zinc-500">Q · </span>
              {DETAIL_QUERY}
              <span className="mt-1 block">
                {detailLost ? "The summary reports Cedar's totals; neither post exists in the index." : "Posts 1 and 2 are indexed and can be retrieved as evidence."}
              </span>
            </div>
          )}
        </div>
      </div>

      <details className="border-t border-zinc-800/50">
        <summary className="bi-focusable px-4 py-2.5">
          Compare all five
        </summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full border-collapse text-[0.72rem]">
            <thead>
              <tr className="border-b border-zinc-800/60 text-left font-mono text-[0.64rem] text-zinc-600 uppercase">
                {["", "Indexed units", "Embedded context", "Filters", "Stages"].map((head) => (
                  <th key={head} scope="col" className="pr-3 pb-2 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-400">
              {strategies.map((item) => {
                const row = SPECS[item.id];
                return (
                  <tr key={item.id} className={cn(item.id === strategy && "bg-white/[0.04]")}>
                    <th scope="row" className="py-1.5 pr-3 text-left font-mono font-normal text-zinc-300">
                      {item.id}
                    </th>
                    <td className="py-1.5 pr-3">{row.units}</td>
                    <td className="py-1.5 pr-3">{row.embedded}</td>
                    <td className="py-1.5 pr-3">{row.metadata ? "Yes" : "No"}</td>
                    <td className="py-1.5">{row.stages.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </FigureFrame>
  );
}
