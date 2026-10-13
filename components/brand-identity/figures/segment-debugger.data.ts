export type Segment =
  | { type: "UNCHANGED"; text: string }
  | { type: "MODIFIED"; original: string; revised: string }
  | { type: "ADDED"; text: string }
  | { type: "REMOVED"; text: string };

export interface Fixture {
  id: "primary" | "removed" | "crlf";
  label: string;
  original: string;
  revised: string;
  segments: Segment[];
}

/** The primary fixture is the JSON example printed in the article. */
export const fixtures: Fixture[] = [
  {
    id: "primary",
    label: "Article example",
    original: "Hello everyone.\n\nOur revolutionary platform helps teams.\n",
    revised: "Hello everyone.\n\nOur analytics workspace helps teams.\n",
    segments: [
      { type: "UNCHANGED", text: "Hello everyone.\n\n" },
      { type: "MODIFIED", original: "Our revolutionary platform", revised: "Our analytics workspace" },
      { type: "UNCHANGED", text: " helps teams.\n" },
    ],
  },
  {
    id: "removed",
    label: "Removed + added",
    original: "Hello everyone.\n\nOur platform helps teams. It is revolutionary.\n",
    revised: "Hello everyone.\n\nOur platform helps teams.\nRead the guide.\n",
    segments: [
      { type: "UNCHANGED", text: "Hello everyone.\n\nOur platform helps teams." },
      { type: "REMOVED", text: " It is revolutionary." },
      { type: "UNCHANGED", text: "\n" },
      { type: "ADDED", text: "Read the guide.\n" },
    ],
  },
  {
    id: "crlf",
    label: "CRLF",
    original: "Hello everyone.\r\n\r\nOur revolutionary platform helps teams.\r\n",
    revised: "Hello everyone.\r\n\r\nOur analytics workspace helps teams.\r\n",
    segments: [
      { type: "UNCHANGED", text: "Hello everyone.\r\n\r\n" },
      { type: "MODIFIED", original: "Our revolutionary platform", revised: "Our analytics workspace" },
      { type: "UNCHANGED", text: " helps teams.\r\n" },
    ],
  },
];

export const originalValue = (segment: Segment) =>
  segment.type === "MODIFIED" ? segment.original : segment.type === "ADDED" ? "" : segment.text;

export const revisedValue = (segment: Segment) =>
  segment.type === "MODIFIED" ? segment.revised : segment.type === "REMOVED" ? "" : segment.text;

export const renderRevised = (segments: Segment[]) => segments.map(revisedValue).join("");

export interface SegmentRanges {
  original: [number, number];
  revised: [number, number];
}

/** Zero-based, half-open ranges in JavaScript UTF-16 code units. */
export function computeRanges(segments: Segment[]): SegmentRanges[] {
  let originalAt = 0;
  let revisedAt = 0;
  return segments.map((segment) => {
    const o = originalValue(segment).length;
    const r = revisedValue(segment).length;
    const ranges: SegmentRanges = { original: [originalAt, originalAt + o], revised: [revisedAt, revisedAt + r] };
    originalAt += o;
    revisedAt += r;
    return ranges;
  });
}

export const caption =
  "Ordered segments reconstruct the revised string exactly, including its blank line and trailing newline. Whitespace markers are display-only and excluded from copied text.";
