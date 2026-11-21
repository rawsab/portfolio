import type { ReactNode } from "react";

import { renderInline } from "@/components/article/article-blocks";
import { FigureFrame } from "@/components/brand-identity/figure-frame";
import { count } from "./figure-parts";
import { dense, embedding, paddingId, recurrentLayers, sequenceLength, totalParameters } from "./model.data";

const malicious = 29_769;
const benign = 38_228;

function MathText({ tex }: { tex: string }) {
  return renderInline([{ type: "math", value: tex }]);
}

function Group({ letter, title, children }: { letter: string; title: string; children: ReactNode }) {
  return (
    <section className="pd-arch-group" aria-labelledby={"pd-arch-heading-" + letter}>
      <h3 className="bi-figure-label" id={"pd-arch-heading-" + letter}>({letter}) {title}</h3>
      {children}
    </section>
  );
}

function Node({ title, children, tone }: { title: ReactNode; children?: ReactNode; tone?: "model" | "user" | "code" }) {
  return (
    <div className="pd-arch-node" data-tone={tone}>
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function Arrow({ edge, label }: { edge?: "left" | "right"; label?: string }) {
  return (
    <div className="pd-arch-arrow" data-edge={edge}>
      <svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true">
        <path d="M8 0v20m-4-4 4 4 4-4" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}

function Junction({ merge = false }: { merge?: boolean }) {
  return (
    <svg className="pd-arch-junction" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      {merge ? (
        <>
          <path d="M25 0v9h50V0M50 9v15" />
          <path className="pd-arch-arrowhead" d="m49.4 19 .6 5 .6-5" />
        </>
      ) : (
        <>
          <path d="M50 0v9H25v15m25-15h25v15" />
          <path className="pd-arch-arrowhead" d="M24.4 19 25 24 25.6 19M74.4 19 75 24 75.6 19" />
        </>
      )}
    </svg>
  );
}

function SourceMerge() {
  return (
    <div className="pd-arch-source-merge">
      <Junction merge />
      <svg className="pd-arch-side-merge" viewBox="0 0 22 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 25h9v50H0m9-25h13" />
        <path className="pd-arch-arrowhead" d="m17 47 5 3-5 3" />
      </svg>
    </div>
  );
}

const layerInputs = [
  "x_1,\\ldots,x_T",
  "y_1^{(1)},\\ldots,y_T^{(1)}",
  "y_1^{(2)},\\ldots,y_T^{(2)}",
];

function RecurrentLayer({ index, layer }: { index: number; layer: (typeof recurrentLayers)[number] }) {
  const width = layer.shape[layer.shape.length - 1];
  const output = layer.retainsSequence
    ? "y_t^{(" + (index + 1) + ")}=[h_t^{(f)};h_t^{(b)}]\\in\\mathbb{R}^{" + width + "}"
    : "z=[h_T^{(f)};h_1^{(b)}]\\in\\mathbb{R}^{" + width + "}";

  return (
    <div className="pd-arch-layer">
      <div className="pd-arch-layer-header">
        <h4>BiLSTM layer {index + 1}</h4>
        <p>{layer.units} units per direction · {count(layer.parameters)} parameters</p>
        <p>Dropout 0.3 · recurrent dropout 0.3</p>
      </div>
      <Node title={<MathText tex={layerInputs[index]} />} />
      <Junction />
      <div className="pd-arch-directions">
        <Node title="Forward LSTM" tone="model">
          <p><MathText tex="t=1\rightarrow T" /></p>
          <p><MathText tex="h_1^{(f)}\to\cdots\to h_T^{(f)}" /></p>
        </Node>
        <Node title="Backward LSTM" tone="user">
          <p><MathText tex="t=T\rightarrow 1" /></p>
          <p><MathText tex="h_1^{(b)}\gets\cdots\gets h_T^{(b)}" /></p>
        </Node>
      </div>
      <Junction merge />
      <Node title={layer.retainsSequence ? "Concatenate at every timestep" : "Concatenate final states only"}>
        <p className="pd-arch-equation"><MathText tex={output} /></p>
        <p>
          {layer.retainsSequence
            ? <>Return <MathText tex={layerInputs[index + 1]} /></>
            : "Final URL representation"}
        </p>
      </Node>
    </div>
  );
}

export function SystemArchitecture() {
  return (
    <FigureFrame
      id="phishing-system-architecture"
      title="Architecture of the phishing URL detector"
      badge="Recorded system design"
      caption="The URL pipeline produces a score. In the original URL-level split, validation loss selects a checkpoint, which is then used for held-out evaluation and Flask inference."
    >
      <div className="pd-architecture">
        <Group letter="a" title="Data & preprocessing">
          <div className="pd-arch-chain pd-arch-preprocessing">
            <div className="pd-arch-sources">
              <Node title="PhishTank export"><p>{count(malicious)} phishing URLs · label 1</p></Node>
              <Node title="Benign URL whitelist"><p>{count(benign)} URLs · label 0</p></Node>
            </div>
            <SourceMerge />
            <Node title="Deduplicate & label">
              <p>{count(benign + malicious)} unique URLs</p>
              <p>URL in both sources → benign</p>
            </Node>
            <Arrow />
            <Node title="Character tokenization">
              <p>Lowercase · {embedding.rows - 1}-character vocabulary</p>
              <p>ID {paddingId} reserved for padding</p>
            </Node>
            <Arrow />
            <Node title="Pad / truncate">
              <p>Left-pad to <MathText tex={"T=" + sequenceLength} /> tokens</p>
              <p>Keep the last {sequenceLength} IDs in longer inputs</p>
            </Node>
            <Arrow />
            <Node title="Train / validation / test split">
              <p>80% / 15% / 5%</p>
              <p>Fixed seed 42 for reproducibility</p>
            </Node>
          </div>
        </Group>
        <Arrow edge="right" />
        <Group letter="b" title="Character embedding">
          <div className="pd-arch-chain pd-arch-three pd-arch-reverse">
            <Node title={<>Token IDs <MathText tex="c_1,\ldots,c_T" /></>} />
            <Arrow />
            <Node title="Embedding layer" tone="model">
              <p><MathText tex={embedding.rows + "\\times" + embedding.dimension} /> lookup table · {count(embedding.parameters)} parameters</p>
              <p>{embedding.rows - 1} observed characters plus padding ID {paddingId}</p>
            </Node>
            <Arrow />
            <Node title={<MathText tex="x_1,x_2,\ldots,x_T" />}>
              <p><MathText tex={"x_t\\in\\mathbb{R}^{" + embedding.dimension + "}"} /> per input position</p>
            </Node>
          </div>
        </Group>
        <Arrow edge="left" />
        <Group letter="c" title="Bidirectional LSTM encoder">
          <div className="pd-arch-chain pd-arch-three pd-arch-layers">
            {recurrentLayers.map((layer, index) => (
              <LayerWithConnector key={index} layer={layer} index={index} />
            ))}
          </div>
        </Group>
        <Arrow edge="right" />
        <Group letter="d" title="Output layer">
          <div className="pd-arch-chain pd-arch-three pd-arch-reverse">
            <Node title={<MathText tex="z\in\mathbb{R}^{256}" />} />
            <Arrow />
            <Node title="Dense · one sigmoid unit">
              <p><MathText tex="\sigma(w^{\mathsf{T}}z+b)" /> · {count(dense.parameters)} parameters</p>
            </Node>
            <Arrow />
            <Node title="Phishing probability" tone="code">
              <p className="pd-arch-equation"><MathText tex="p=P(\text{phishing}\mid\text{URL})\in[0,1]" /></p>
              <p>Predicted probability of the phishing class</p>
            </Node>
          </div>
          <p className="pd-arch-total">{count(totalParameters)} model parameters</p>
        </Group>
        <Arrow edge="left" label="Predictions on training URLs feed the loss" />

        <Group letter="e" title="Training & evaluation">
          <div className="pd-arch-training">
            <div className="pd-arch-training-loop">
              <Node title="Model on the training split"><p>Predict scores from the current weights</p></Node>
              <div className="pd-arch-feedback">
                <Arrow label="Predictions to loss" />
                <Arrow label="Update weights" />
              </div>
              <Node title="Adam optimizer"><p>Binary cross-entropy loss</p></Node>
            </div>
            <Arrow label="After each epoch · validation split" />
            <Node title="Per-epoch validation loss">
              <p>Early stopping · patience 2</p>
            </Node>
            <Arrow />
            <Node title="Best saved checkpoint" tone="code">
              <p>Checkpoint selected by minimum validation loss</p>
            </Node>
          </div>
        </Group>

        <div className="pd-arch-lifecycle-fork">
          <Junction />
          <svg className="pd-arch-mobile-fork" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M100 0v10H0v14" />
          </svg>
        </div>
        <div className="pd-arch-lifecycle">
          <div className="pd-arch-test">
            <p className="bi-figure-label">Best checkpoint + held-out test split</p>
            <Node title="Held-out test evaluation">
              <p>Accuracy · precision · recall · F1 · ROC AUC</p>
              <p>The test split is used for scoring the selected checkpoint only.</p>
            </Node>
          </div>
          <Group letter="f" title="Serving">
            <div className="pd-arch-chain">
              <p className="bi-figure-label">Best checkpoint → inference</p>
              <Node title="Flask REST API"><p><code>POST /predict</code></p></Node>
              <Arrow />
              <Node title={<>Tokenize → BiLSTM → <MathText tex="p" /></>}>
                <p>Load <code>tokenizer.json</code> and apply the same vocabulary, padding and truncation as training.</p>
                <p>Run the saved embedding, BiLSTM and sigmoid layers.</p>
              </Node>
              <Arrow />
              <Node title="JSON response" tone="code">
                <p><code>malicious_probability</code></p>
                <p><MathText tex="\mathtt{is\_malicious}=(p\geq0.5)" /></p>
              </Node>
            </div>
          </Group>
        </div>
      </div>
    </FigureFrame>
  );
}

function LayerWithConnector({ index, layer }: { index: number; layer: (typeof recurrentLayers)[number] }) {
  return (
    <>
      {index > 0 && (
        <div className="pd-arch-layer-link">
          <Arrow />
          <svg viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-8 84H10V31H28m-4-1.3 4 1.3-4 1.3" />
          </svg>
        </div>
      )}
      <RecurrentLayer index={index} layer={layer} />
    </>
  );
}
