"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ControlButton, FigureFrame } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { usePrefersReducedMotion } from "@/components/brand-identity/use-reduced-motion";
import { count, DataTable, type FigureProps } from "./figure-parts";
import { dense, embedding, paddingId, recurrentLayers, sequenceLength, tokenIds, totalParameters } from "./model.data";

const fixtures = {
  normal: "https://secure-login.example/verify",
  long: "https://docs.example/" + "reference/".repeat(12) + "index",
};

function encode(url: string) {
  const raw = Array.from(url);
  const normalized = Array.from(url.toLowerCase());
  let offset = 0;
  const tokens = raw.flatMap((character, rawIndex) => {
    const nextOffset = offset + Array.from(character.toLowerCase()).length;
    const mapped = normalized.slice(offset, nextOffset).flatMap((normalizedCharacter) => {
      const id = tokenIds[normalizedCharacter];
      return id === undefined ? [] : [{ rawIndex, id, character: normalizedCharacter }];
    });
    offset = nextOffset;
    return mapped;
  });
  const discarded = Math.max(0, tokens.length - sequenceLength);
  const padding = Math.max(0, sequenceLength - tokens.length);
  const retained = tokens.slice(-sequenceLength);
  const input = [...Array<number>(padding).fill(paddingId), ...retained.map(({ id }) => id)];
  return { raw, tokens, discarded, padding, input };
}

const encoded = { normal: encode(fixtures.normal), long: encode(fixtures.long) };
const steps = ["Input", "Token IDs", "128 positions", "Embedding", "BiLSTM 1", "BiLSTM 2", "BiLSTM 3", "Sigmoid"];
const lastStep = steps.length - 1;
const shape = (dimensions: readonly (number | null)[]) => `(${dimensions.map((dimension) => dimension ?? "None").join(", ")})`;
const layers = [
  ["Input", "int32 token IDs", shape([null, sequenceLength]), "0", "128 positions"],
  ["Embedding", `${embedding.rows} × ${embedding.dimension} lookup table`, shape(embedding.shape), count(embedding.parameters), "128 vectors"],
  ...recurrentLayers.map((layer, index) => [
    `BiLSTM ${index + 1}`,
    `${layer.units} per direction`,
    shape(layer.shape),
    count(layer.parameters),
    layer.retainsSequence ? "All 128 positions" : "Two final states",
  ]),
  ["Dense", `${dense.units} unit, sigmoid`, shape([null, dense.units]), count(dense.parameters), "One score"],
];

function TokenStrip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pd-token-panel">
      <h3 className="pd-panel-title bi-figure-label">{label}</h3>
      <div className="pd-token-strip" role="group" aria-label={label}>{children}</div>
    </div>
  );
}

function RecurrentDirections({ playing, retainsSequence, units }: { playing: boolean; retainsSequence: boolean; units: number }) {
  return (
    <svg className="pd-chart pd-recurrent" viewBox="0 0 380 102" role="img" aria-label={`Forward and backward streams, ${units} units each. ${retainsSequence ? "Outputs are paired at each position." : "Only the two final states are joined."}`}>
      <text x="12" y="22">Forward · left to right</text>
      <path d="M14 35H363m-8-5 8 5-8 5" />
      <text x="12" y="69">Backward · right to left</text>
      <path d="M363 82H14m8-5-8 5 8 5" />
      <circle cx="20" cy="35" r="4" className="pd-forward" data-moving={playing || undefined} />
      <rect x="352" y="78" width="8" height="8" className="pd-backward" data-moving={playing || undefined} />
    </svg>
  );
}

export function CharacterModelWalkthrough(props: FigureProps) {
  const root = useRef<HTMLElement>(null);
  const [fixture, setFixture] = useState<keyof typeof fixtures>("normal");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedRaw, setSelectedRaw] = useState<number | null>(0);
  const [lastCharacter, setLastCharacter] = useState(0);
  const [expandedPadding, setExpandedPadding] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const { raw, tokens, discarded, padding, input } = encoded[fixture];
  const tokenIndex = selectedRaw === null ? -1 : tokens.findIndex(({ rawIndex }) => rawIndex === selectedRaw);
  const token = tokens[tokenIndex];
  const position = selectedRaw === null ? 0 : tokenIndex >= discarded ? padding + tokenIndex - discarded : null;
  const selectedId = position === null ? undefined : input[position];
  const layer = recurrentLayers[step - 4];
  const advancing = playing && !reducedMotion;

  useEffect(() => {
    const target = root.current;
    if (!target || !advancing) return;
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    observer.observe(target);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, [advancing]);

  useEffect(() => {
    if (!advancing) return;
    const timer = setTimeout(() => {
      const next = Math.min(step + 1, lastStep);
      setStep(next);
      if (next === lastStep) setPlaying(false);
    }, 1650);
    return () => clearTimeout(timer);
  }, [advancing, step]);

  function chooseStep(next: number) {
    setPlaying(false);
    setStep(next);
  }

  function reset(nextFixture: keyof typeof fixtures = "normal") {
    setFixture(nextFixture);
    setSelectedRaw(0);
    setLastCharacter(0);
    setExpandedPadding(false);
    chooseStep(0);
  }

  function chooseCharacter(index: number) {
    setSelectedRaw(index);
    setLastCharacter(index);
  }

  function moveCharacter(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const end = raw.length - 1;
    const next = {
      ArrowLeft: Math.max(0, index - 1),
      ArrowRight: Math.min(end, index + 1),
      Home: 0,
      End: end,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-character="${next}"]`)?.focus();
  }

  function togglePlayback() {
    if (reducedMotion) {
      chooseStep(lastStep);
      return;
    }
    if (!playing && step === lastStep) setStep(0);
    setPlaying(!playing);
  }

  return (
    <FigureFrame
      {...props}
      ref={root}
      badge="Synthetic input · recorded architecture"
      caption="Follow a synthetic URL through its actual token IDs and the checkpoint’s layer shapes. The animation illustrates the computation."
      controls={
        <>
          <SegmentedControl label="Synthetic example" value={fixture} onChange={reset} options={[
            { value: "normal", label: "Short URL" }, { value: "long", label: "Truncation" },
          ]} />
          <div className="pd-step-nav" role="group" aria-label="Walkthrough playback">
            <ControlButton onClick={() => chooseStep(step - 1)} disabled={step === 0}>Previous</ControlButton>
            <ControlButton onClick={() => chooseStep(step + 1)} disabled={step === lastStep}>Next</ControlButton>
            <ControlButton onClick={togglePlayback}>{reducedMotion ? "Show final step" : playing ? "Pause" : "Play"}</ControlButton>
            <ControlButton onClick={() => reset(fixture)}>Reset</ControlButton>
          </div>
        </>
      }
    >
      <div className="pd-body">
        <div className="pd-step-nav" role="group" aria-label="Model stage">
          {steps.map((label, index) => <ControlButton key={label} pressed={step === index} onClick={() => chooseStep(index)}>{label}</ControlButton>)}
        </div>

        <div className="pd-diagram-panel">
          <p className="pd-panel-title bi-figure-label">Synthetic URL</p>
          <code className="pd-synthetic-url">{fixtures[fixture]}</code>
          <TokenStrip label="Raw characters">
            {raw.map((character, index) => (
              <ControlButton key={index} aria-label={`Character ${index + 1}, ${character}`} pressed={index === selectedRaw}
                data-character={index} tabIndex={index === lastCharacter ? 0 : -1}
                onFocus={() => chooseCharacter(index)}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") chooseCharacter(index); }}
                onClick={() => chooseCharacter(index)}
                onKeyDown={(event) => moveCharacter(event, index)}
              >{character}</ControlButton>
            ))}
          </TokenStrip>
          <p className="pd-readout" aria-live={advancing ? "off" : "polite"}>
            {selectedRaw === null
              ? `Padding ID ${paddingId} · input index 0 · embedding row ${paddingId}`
              : <>Character {selectedRaw + 1} <code>{raw[selectedRaw]}</code>
                {token ? ` → normalized ${token.character}, ID ${token.id}` : " · unknown character dropped"}
                {position === null ? (token && " · discarded from the prefix") : ` → input index ${position} → embedding row ${selectedId}`}</>}
          </p>
          <p className="pd-note">{count(tokens.length)} mapped IDs · {count(padding)} left-pad positions · {count(discarded)} leading IDs discarded. Input indices start at zero.</p>
        </div>

        {step >= 1 && step <= 3 && (
          <TokenStrip label="Normalized token IDs">
            {tokens.map(({ rawIndex, id }, index) => (
              <span data-selected={rawIndex === selectedRaw || undefined} data-discarded={index < discarded || undefined} key={index}>{id}</span>
            ))}
          </TokenStrip>
        )}

        {step >= 2 && step <= 3 && (
          <TokenStrip label="128-position input">
            {padding > 0 && (
              <ControlButton
                aria-expanded={expandedPadding}
                onClick={() => { setSelectedRaw(null); setExpandedPadding(!expandedPadding); }}
              >{expandedPadding ? "Collapse padding" : `0 × ${padding} · expand padding`}</ControlButton>
            )}
            {input.slice(expandedPadding ? 0 : padding).map((id, index) => {
              const inputIndex = index + (expandedPadding ? 0 : padding);
              return <span key={inputIndex} data-selected={inputIndex === position || undefined}>{id}</span>;
            })}
          </TokenStrip>
        )}

        {step === 0 && <p className="pd-note">The input starts as Unicode characters. The saved tokenizer lowercases the string and drops characters outside its vocabulary.</p>}
        {step === 3 && (
          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">Embedding lookup · {embedding.rows} rows × {embedding.dimension} dimensions</h3>
            <div className="pd-embedding-grid">
              {[...new Set([paddingId, selectedId])].filter((id) => id !== undefined).map((id) => (
                <div data-selected={id === selectedId || undefined} className="pd-embedding-row" key={id}>
                  <span>Row {id}{id === paddingId ? " · padding" : ""}</span>
                  <svg viewBox="0 0 156 20" aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((cell) => <rect key={cell} x={cell * 22 + (cell === 5 ? 26 : 0)} y="2" width="17" height="16" rx="2" />)}
                    <text x="111" y="13">…</text>
                  </svg>
                </div>
              ))}
            </div>
            <p className="pd-note">Cells are a schematic of each learned 128-value vector. ID 0 also selects a learned lookup row. Output {shape(embedding.shape)} · {count(embedding.parameters)} parameters.</p>
          </div>
        )}

        {layer && (
          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">{steps[step]} · {layer.units} units per direction</h3>
            <RecurrentDirections key={step} playing={advancing} retainsSequence={layer.retainsSequence} units={layer.units} />
            <div className="pd-concat" aria-label="Directional states concatenated">
              <span>{layer.retainsSequence ? "Forward at position t" : "Final forward state"}</span>
              <span>{layer.retainsSequence ? "Backward at position t" : "Final backward state"}</span>
              <strong><span aria-hidden="true">→ </span>{layer.units * 2} joined values</strong>
            </div>
            <p className="pd-readout">{layer.retainsSequence
              ? "At each position, concatenate forward and backward outputs into 512 features. Keep all 128 positions."
              : "Concatenate only the two final 128-value states into a single 256-value representation."}</p>
            <p className="pd-note">Output {shape(layer.shape)} · {count(layer.parameters)} parameters</p>
          </div>
        )}

        {step === lastStep && (
          <div className="pd-diagram-panel">
            <h3 className="pd-panel-title bi-figure-label">Dense · 1 sigmoid unit</h3>
            <p className="pd-readout">256-value representation → dense unit → <code>p = sigmoid(z)</code></p>
            <p className="pd-note">Symbolic score between 0 and 1 · output (None, 1) · {count(dense.parameters)} parameters</p>
          </div>
        )}

        <p className="pd-note">{count(totalParameters)} parameters total. <code>None</code> is the variable batch size.</p>
        <DataTable label="Recorded layer shapes, units, parameters and retained output" headings={["Stage", "Units / settings", "Output shape", "Parameters", "Keeps"]} rows={layers} disclosure="All layer dimensions and parameter counts" />
      </div>
    </FigureFrame>
  );
}
