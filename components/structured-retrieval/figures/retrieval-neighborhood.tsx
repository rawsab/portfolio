"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { useTween } from "@/components/palitronica/use-tween";
import { cn } from "@/lib/utils";
import { Post, campaigns, creators, pct, posts, rate } from "../fixture";
import { PlatformMark, SvgPlatformMark } from "./marks";

type XY = [number, number];

const QUERY: XY = [200, 150];
const QUERY_TEXT = "TikTok engagement in the Cedar launch";

/** Hand-placed schematic positions. They are not a projection of measured embedding vectors. */
const LAYOUT: Record<string, { raw: XY; context: XY }> = {
  b1: { raw: [222, 132], context: [230, 150] },
  b2: { raw: [172, 170], context: [110, 214] },
  c1: { raw: [238, 178], context: [214, 140] },
  c3: { raw: [160, 118], context: [186, 162] },
  c5: { raw: [258, 112], context: [226, 172] },
  c2: { raw: [140, 196], context: [176, 124] },
  b3: { raw: [120, 120], context: [80, 90] },
  c7: { raw: [280, 200], context: [252, 196] },
  c4: { raw: [296, 140], context: [236, 116] },
  c6: { raw: [110, 90], context: [156, 186] },
  b4: { raw: [310, 232], context: [334, 250] },
  c8: { raw: [92, 222], context: [128, 206] },
};

const TOP = 5;

const dist = ([x, y]: XY) => Math.hypot(x - QUERY[0], y - QUERY[1]);

function rank(context: boolean, constrained: boolean) {
  return posts
    .filter((post) => !constrained || post.campaign === "cedar")
    .map((post) => ({ post, d: dist(LAYOUT[post.id][context ? "context" : "raw"]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, TOP)
    .map(({ post }) => post);
}

const provenance = (post: Post) => `${creators[post.creator]} · ${post.platform} · ${campaigns[post.campaign].name} · ${pct(rate(post))}`;

const describe = (context: boolean, constrained: boolean) =>
  rank(context, constrained)
    .map((post, i) => `${i + 1}. ${creators[post.creator]}, ${post.platform}, ${campaigns[post.campaign].name}`)
    .join("; ");

const caption =
  "Schematic retrieval neighborhoods before contextualization, after contextualization, and after scope filtering. Context changes the ranking; the constraint changes which records are eligible. Positions are hand-placed for explanation.";

export function RetrievalNeighborhood({ id, number, title }: { id: string; number: number; title: string }) {
  const [context, setContext] = useState(false);
  const [constrained, setConstrained] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const t = useTween(context ? 1 : 0, 750);

  const ranking = useMemo(() => rank(context, constrained), [context, constrained]);
  const birchInTop = ranking.filter((post) => post.campaign === "birch").length;
  const selectedPost = posts.find((post) => post.id === selected) ?? null;

  const position = (postId: string): XY => {
    const { raw, context: ctx } = LAYOUT[postId];
    return [raw[0] + (ctx[0] - raw[0]) * t, raw[1] + (ctx[1] - raw[1]) * t];
  };

  const announce = (nextContext: boolean, nextConstrained: boolean) => {
    const top = rank(nextContext, nextConstrained);
    const birch = top.filter((post) => post.campaign === "birch").length;
    setAnnouncement(
      `${nextContext ? "Hierarchical context added" : "Raw rows"}${nextConstrained ? " with the campaign constraint" : ""}. ${birch} of the top ${TOP} are from the Birch launch.`,
    );
  };

  const onKey = (event: KeyboardEvent<SVGGElement>, postId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected(postId);
    }
  };

  const status = constrained
    ? context
      ? "Context improves the order and the constraint removes Birch records entirely."
      : "The constraint removes Birch records, but the raw ordering still lets a Cedar Instagram post into the top five."
    : context
      ? `Cedar posts move closer, but ${birchInTop} Birch record still ranks in the top five. Context is a semantic signal, not a guarantee.`
      : `Shared vocabulary puts ${birchInTop} Birch records among the five nearest neighbors.`;

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Schematic"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <ControlButton
            pressed={context}
            onClick={() => {
              setContext(!context);
              announce(!context, constrained);
            }}
          >
            Add hierarchical context
          </ControlButton>
          <ControlButton
            pressed={constrained}
            onClick={() => {
              setConstrained(!constrained);
              announce(context, !constrained);
            }}
          >
            Apply campaign constraint
          </ControlButton>
        </>
      }
    >
      <p className="border-b border-zinc-800/50 px-4 py-2 font-mono text-[0.7rem] text-zinc-400">Conceptual layout; distances are illustrative.</p>
      <div className="grid gap-4 p-4 @2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 400 300" className="bi-diagram rounded-md border border-zinc-800/60 bg-black/20" role="group" aria-label="Schematic retrieval field. Select a point to inspect its provenance.">
          {[40, 80, 120].map((r) => (
            <circle key={r} cx={QUERY[0]} cy={QUERY[1]} r={r} className="sr-ring" />
          ))}
          {ranking.map((post) => {
            const [x, y] = position(post.id);
            return <line key={post.id} x1={QUERY[0]} y1={QUERY[1]} x2={x} y2={y} className="sr-neighbor-line" />;
          })}

          {posts.map((post) => {
            const [x, y] = position(post.id);
            const out = constrained && post.campaign !== "cedar";
            const r = ranking.indexOf(post);
            const isSelected = selected === post.id;
            return (
              <g
                key={post.id}
                role="button"
                tabIndex={0}
                aria-label={`${provenance(post)}${out ? ", ineligible" : r >= 0 ? `, rank ${r + 1}` : ""}`}
                aria-pressed={isSelected}
                onClick={() => setSelected(post.id)}
                onFocus={() => setSelected(post.id)}
                onKeyDown={(event) => onKey(event, post.id)}
                className="sr-point"
                data-tone={campaigns[post.campaign].tone}
                data-out={out || undefined}
                data-selected={isSelected || undefined}
              >
                <circle cx={x} cy={y} r={11} className="sr-point-hit" />
                <SvgPlatformMark platform={post.platform} x={x} y={y} r={5.5} className="sr-point-mark" />
                {r >= 0 && (
                  <text x={x + 9} y={y - 7} className="sr-point-rank">
                    {r + 1}
                  </text>
                )}
              </g>
            );
          })}

          <g className="sr-query" aria-hidden>
            <path d={`M${QUERY[0] - 7} ${QUERY[1]}H${QUERY[0] + 7}M${QUERY[0]} ${QUERY[1] - 7}V${QUERY[1] + 7}`} />
            <circle cx={QUERY[0]} cy={QUERY[1]} r={3} />
          </g>
        </svg>

        <div className="min-w-0 space-y-3">
          <div>
            <MonoLabel>Query</MonoLabel>
            <p className="mt-0.5 font-mono text-[0.75rem] text-zinc-300">“{QUERY_TEXT}”</p>
          </div>
          <div>
            <MonoLabel>Nearest {TOP}</MonoLabel>
            <ol className="mt-1.5 space-y-1">
              {ranking.map((post, i) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(post.id)}
                    aria-pressed={selected === post.id}
                    className={cn(
                      "bi-control flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-left text-[0.72rem] transition-colors duration-200",
                      selected === post.id ? "border-zinc-600 bg-white/5" : "border-zinc-800/70 hover:border-zinc-700",
                    )}
                  >
                    <span className="font-mono text-zinc-500">{i + 1}</span>
                    <PlatformMark platform={post.platform} tone={campaigns[post.campaign].tone} />
                    <span className="min-w-0 flex-1 truncate text-zinc-300">{creators[post.creator]}</span>
                    <span className="bi-tone-text font-mono text-[0.66rem]" data-tone={campaigns[post.campaign].tone}>
                      {campaigns[post.campaign].name.split(" ")[0]}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-[0.75rem] leading-relaxed text-zinc-400">{status}</p>
          <div className="min-h-[2.5rem] rounded-md border border-zinc-800/70 bg-black/20 px-2.5 py-1.5 font-mono text-[0.68rem] leading-snug text-zinc-400">
            {selectedPost ? provenance(selectedPost) : "Select a point to inspect its synthetic provenance."}
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-zinc-500" aria-label="Legend">
            <li className="inline-flex items-center gap-1">
              <PlatformMark platform="TikTok" tone="model" /> Cedar
            </li>
            <li className="inline-flex items-center gap-1">
              <PlatformMark platform="TikTok" tone="user" /> Birch
            </li>
            <li>● TikTok · ■ Instagram · ✛ query</li>
          </ul>
        </div>
      </div>
      <p className="sr-only">
        Before contextualization: {describe(false, false)}. After contextualization: {describe(true, false)}. After contextualization and scope filtering: {describe(true, true)}.
      </p>
    </FigureFrame>
  );
}
