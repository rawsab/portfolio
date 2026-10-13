import type { Tone } from "../diagram";

export type Mode = "before" | "after" | "permitted";

export const modes: { value: Mode; label: string; summary: string }[] = [
  { value: "before", label: "Before", summary: "The capability check aborts discovery, so a valid connection looks like a failed one." },
  { value: "after", label: "After", summary: "Discovery succeeds with an empty tool list: the connection is valid and has no relevant tools." },
  { value: "permitted", label: "After · with access", summary: "When the user has access, discovery returns representative tool definitions." },
];

export const lanes = ["Client", "Capability configuration", "Tool execution"];
export const narrowLanes = ["Client", "Capability config", "Execution"];

export interface Message {
  id: string;
  from: number;
  to: number;
  y: number;
  label: string;
  sublabel?: string;
  tone?: Tone;
}

export interface Note {
  lane: number;
  y: number;
  label: string;
  tone?: Tone;
}

export const discovery = (mode: Mode): { messages: Message[]; note: Note } => ({
  messages: [
    { id: "list", from: 0, to: 1, y: 88, label: "tools/list" },
    mode === "before"
      ? { id: "response", from: 1, to: 0, y: 168, label: "discovery error", sublabel: "capability-specific", tone: "error" }
      : mode === "after"
        ? { id: "response", from: 1, to: 0, y: 168, label: '{ "tools": [] }', sublabel: "returned successfully", tone: "code" }
        : { id: "response", from: 1, to: 0, y: 168, label: '{ "tools": [ … ] }', sublabel: "representative definitions", tone: "code" },
  ],
  note: { lane: 1, y: 120, label: mode === "before" ? "capability check" : "availability check", tone: mode === "before" ? "error" : "code" },
});

export const execution: { messages: Message[]; note: Note } = {
  messages: [
    { id: "call", from: 0, to: 2, y: 244, label: "tools/call" },
    { id: "outcome", from: 2, to: 0, y: 320, label: "allowed result or denied", sublabel: "authorization enforced", tone: "model" },
  ],
  note: { lane: 2, y: 274, label: "execution authorization", tone: "model" },
};

export const layouts = {
  wide: { width: 600, height: 348, lanes: [80, 300, 520], laneNames: lanes, boxWidth: 168 },
  narrow: { width: 344, height: 348, lanes: [58, 172, 286], laneNames: narrowLanes, boxWidth: 108 },
};

export const caption =
  "A valid connection can successfully discover zero available tools, and executing a tool still requires authorization. The diagram shows a capability-specific availability decision, not a rule that every discovery error becomes an empty list. Method names are representative MCP operations; boundaries and payloads are illustrative.";
