export type FeedbackOption = "technical" | "original" | "concise";

export const feedbackOptions: { value: FeedbackOption; label: string }[] = [
  { value: "technical", label: "Make this more technical" },
  { value: "original", label: "Keep more of the original" },
  { value: "concise", label: "Make it more concise" },
];

export type ReviewSegment =
  | { id: string; type: "UNCHANGED"; text: string }
  | {
      id: string;
      type: "MODIFIED";
      original: string;
      revised: string;
      label: string;
      guideline: string;
      explanation: string;
      feedback: Record<FeedbackOption, string>;
    }
  | { id: string; type: "REMOVED"; original: string; label: string; guideline: string; explanation: string };

export interface ReviewBlock {
  id: string;
  kind: "heading" | "paragraph";
  segments: ReviewSegment[];
}

/** A synthetic product announcement. Every string here is illustrative. */
export const documentBlocks: ReviewBlock[] = [
  {
    id: "b-heading",
    kind: "heading",
    segments: [
      { id: "s-heading-mark", type: "UNCHANGED", text: "# " },
      {
        id: "r-heading",
        type: "MODIFIED",
        label: "Heading",
        original: "Introducing our revolutionary analytics platform",
        revised: "Introducing the analytics workspace",
        guideline: "Voice & tone · direct, grounded",
        explanation: "Replaces a superlative with a plain description of what is launching.",
        feedback: {
          technical: "Introducing the analytics workspace for querying and sharing reports",
          original: "Introducing our new analytics platform",
          concise: "The analytics workspace",
        },
      },
    ],
  },
  {
    id: "b-claim",
    kind: "paragraph",
    segments: [
      { id: "s-intro", type: "UNCHANGED", text: "Teams can now build reports from the data they already collect. " },
      {
        id: "r-claim",
        type: "MODIFIED",
        label: "Second sentence",
        original: "It transforms reporting overnight and guarantees better decisions.",
        revised: "It helps teams understand their data and share what they find.",
        guideline: "Avoid · exaggerated claims",
        explanation: "Removes a guarantee the announcement cannot support and describes the outcome concretely.",
        feedback: {
          technical: "It lets teams query their data, build reports, and share the results.",
          original: "It changes how teams approach reporting and supports better decisions.",
          concise: "It helps teams understand their data.",
        },
      },
      {
        id: "r-removed",
        type: "REMOVED",
        label: "Removed sentence",
        original: " It is the most powerful tool on the market.",
        guideline: "Avoid · exaggerated claims",
        explanation: "Drops an unsupported comparison with other products.",
      },
    ],
  },
  {
    id: "b-audience",
    kind: "paragraph",
    segments: [
      {
        id: "r-audience",
        type: "MODIFIED",
        label: "Audience phrase",
        original: "Leverage synergies across every dashboard",
        revised: "Connect dashboards to the metrics your team already tracks",
        guideline: "Audience · technical teams",
        explanation: "Uses specific language for a technical audience in place of a general marketing phrase.",
        feedback: {
          technical: "Connect dashboards to the metrics and data sources your team already tracks",
          original: "Work across every dashboard",
          concise: "Connect dashboards to your metrics",
        },
      },
      { id: "s-share", type: "UNCHANGED", text: " and share reports with the people who need them." },
    ],
  },
  {
    id: "b-close",
    kind: "paragraph",
    segments: [{ id: "s-close", type: "UNCHANGED", text: "Read the setup guide to get started." }],
  },
];

export const reviewSummary =
  "Replaced superlatives and guarantees with concrete product language, and adjusted one phrase for a technical audience.";

export const reviewScore = 84;

export const reviewTrace = ["Context loaded", "Rewrite complete", "Segments generated", "Explanations attached", "Response rendered"];

export const feedbackTrace = ["Preserved regions", "Selected region revising", "Updated review"];

export const caption =
  "A simulated review: select a highlighted change to see the original wording and the guideline behind it, then reject it or request a targeted revision. Everything runs on a predefined fixture; there are no live HubSpot or model calls, and the score is an illustrative model estimate rather than measured accuracy.";
