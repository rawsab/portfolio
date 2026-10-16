# Building Reliable RF Anomaly Detection at Palitronica

During my internship as a Machine Learning Engineer at Palitronica, I worked across Anvil’s RF-based electronics assurance pipeline. Here, I’ll focus on two projects: calibrating a one-class anomaly-detection model in the inference framework and building historical tracking around an existing RF data-drift calculation. Both dealt with how new measurements are interpreted relative to a reference. Calibration refined the detector’s operating point using labeled examples, while drift tracking made changes in incoming measurement groups visible over time.

## Electronics assurance through RF measurements

Palitronica, a [YC W22 company](https://www.ycombinator.com/companies/palitronica-inc), develops technology for verifying the physical integrity of electronics. Its [Anvil Checkpoint platform](https://www.palitronica.com/palitronica-anvil-checkpoint) uses radio-frequency reflectometry and machine learning to compare a device’s response with a nominal (known-good) profile. The public product description covers components, assemblies, and complete modules, with measurements taken through existing connectors or a test fixture. This black-box approach supports testing when the purchaser has limited access to the device’s schematics, bill of materials, or firmware.

That capability matters when electronics arrive through a third-party supply chain. A component substitution, an undocumented board revision, or tampering can change the physical device while its part number and apparent function remain familiar. Palitronica describes [supply-chain assurance applications](https://www.palitronica.com/palitronica-for-cyber-supply-chain) in incoming inspection, supplier validation, supply-chain security, and aerospace and defense electronics. Government procurement contexts present similar assurance needs for purchased hardware and mission-critical systems; the company’s public [CanadaBuys profile](https://canadabuys.canada.ca/en/node/preview/1501084) describes screening incoming commercial off-the-shelf electronics and assemblies. These are public use cases for the technology, rather than descriptions of customers or deployments I worked on.

An RF measurement captures how a device responds across a range of frequencies. Reflected and transmitted signals provide different views of its electrical structure, and a physical change can alter that response. Nominal devices also vary, so a useful verification system has to distinguish ordinary variation from departures that deserve investigation.

> **[Figure 1 placeholder — Measuring an RF fingerprint]**
>
> RF responses provide a measurable fingerprint of the electronics, with variation across both devices and measurement paths.

<!-- VISUAL SPEC: figure-01
Show: A simplified circuit board connected to an RF source and receiver through a fixture. Highlight one reflection path and one transmission path, with a synchronized frequency-response plot below the board. Use generic connector labels and synthetic response magnitude in dB. The horizontal axis is frequency, and the vertical axis is response magnitude.
Animate/interact: Play a frequency sweep while a cursor draws the response trace. A selector switches between reflection and transmission without implying that both have identical shapes. Overlay several synthetic nominal captures, then introduce a modified-device trace with a localized departure. Hovering over a frequency reveals the measured response on the selected path.
Purpose: Connect the physical measurement to the feature data used by ML. Label the board and traces as schematic and synthetic; the animation should illustrate signal flow rather than simulate electromagnetic propagation.
-->

## From RF traces to NND within Anvil’s inference framework

Anvil’s feature pipeline represents captures across RF paths, signal representations, and frequency bins. After feature extraction, the values associated with a particular path form a feature vector. A path can correspond to a reflection port or a transmission port combination, providing a distinct view of the device and its nominal variation.

The inference framework supported several anomaly-detection models for interpreting those features. One of the models I worked on was the Normal-distribution-based Novelty Detector (NND), which represented nominal measurements with a multivariate distribution and scored new measurements using Mahalanobis distance. The calibration project described here focused on this detector within the broader Anvil ML stack.

> **[Figure 2 placeholder — Anvil’s inference framework, with NND in focus]**
>
> Anvil’s inference framework supported multiple anomaly-detection models; this calibration project focused on NND.

<!-- VISUAL SPEC: figure-02
Show: An RF capture card with a synthetic frequency-response trace feeds a feature-array preview labeled captures × RF paths × representations × frequencies. Beneath it, an inference configuration card identifies the selected detector, alongside two compact model cards: NND and Other detectors. NND is selected initially; the other card establishes that the framework supported multiple anomaly-detection models, without naming them.
Animate/interact: Follow one synthetic capture through feature extraction into the selected model. Selecting NND expands its feature splits, including a reflection port and a transmission port pair, then reveals their fitted means, covariances, and distance outputs. The other card shows only that it stands in for additional detectors, with a generic scoring stage. Use a step control to pause at the feature representation, detector selection, and NND expansion.
Purpose: Establish that NND is one supported anomaly-detection model and scope the subsequent Mahalanobis and threshold discussion to it. Show model selection as configuration, rather than implying that every capture runs through every detector or an ensemble.
-->

NND learned its reference distribution from nominal measurements in a one-class setup. For each feature split, corresponding here to an RF path, it fitted a multivariate nominal model with a mean and covariance structure. Samples labeled Nominal and Anomaly were available for validation, while the underlying nominal model was fitted using the nominal group.

For path $i$, the squared Mahalanobis distance of a feature vector $x$ is

$$
q_i(x) = D_i^2(x) = (x-\mu_i)^\top\Sigma_i^{+}(x-\mu_i),
$$

where $\mu_i$ is the fitted nominal mean, $\Sigma_i$ is its covariance matrix, and $\Sigma_i^{+}$ denotes the covariance pseudoinverse. I use $q_i$ throughout to keep the squared distance distinct from its square root.

NND’s covariance accounts for the direction of a departure as well as its size. A feature can move substantially along a direction that varies naturally among nominal captures, while a smaller movement across a tightly concentrated direction can be more unusual. Correlations between features also matter: several frequency bins can move together as part of ordinary variation.

> **[Figure 3 placeholder — Covariance-aware distance in feature space]**
>
> The same numerical displacement can have different significance depending on the nominal covariance structure.

<!-- VISUAL SPEC: figure-03
Show: A synthetic two-dimensional Gaussian cloud with an angled covariance ellipse, its mean, and contours of constant squared Mahalanobis distance. Label the axes “illustrative feature 1” and “illustrative feature 2”; this is an explanatory slice, rather than an actual projection of production data. Place a numeric $q$ readout beside the plot.
Animate/interact: Move a test point equal Euclidean distances along the ellipse’s long and short axes, showing the different changes in $q$. Allow the reader to drag the point and toggle covariance contours against a Euclidean circle. An optional whitening view transforms the nominal ellipse into a circle while preserving the Mahalanobis interpretation.
Purpose: Explain why covariance-aware distance is appropriate for correlated RF features before introducing NND threshold calibration. Compute every displayed contour and readout from the same synthetic covariance matrix.
-->

## Why calibrate a statistically derived boundary?

The existing NND implementation used a statistically derived threshold based on the nominal model. That produced one distance threshold shared across the path submodels. Each path had its own fitted mean and covariance, while the decision boundary did not come from labeled examples.

This gave the one-class detector a principled decision boundary, but it did not use labeled Nominal and Anomaly examples to choose its operating point. Those validation examples still described classification behavior: which nominal samples fell beyond the boundary and which anomaly samples remained inside it.

My NND tuning work added a calibration step that evaluated the labeled distances separately for each split and selected a threshold for each one. The fitted nominal model continued to supply the distance; calibration supplied the decision boundary. This made it possible to express the desired false-positive/false-negative tradeoff using observed validation behavior.

At inference time, the Mahalanobis distance is compared with the calibrated threshold to determine whether the sample remains within the nominal boundary.

> **[Figure 4 placeholder — From a nominal model to a calibrated boundary]**
>
> Calibration uses labeled validation distances to choose a boundary for each RF path.

<!-- VISUAL SPEC: figure-04
Show: A four-stage interactive NND figure with Play, Pause, Reset, and numbered step controls. Initially show a smooth normal-distribution curve with nominal observations on a signed illustrative feature axis, linked to the same observations on a nonnegative squared-Mahalanobis-distance axis. The distance view includes a dashed statistically derived threshold and a card labeled “Nominal model + statistical threshold.” Keep the feature and distance views explicitly labeled: squared Mahalanobis distances do not generally have a normal distribution.
Animate/interact: (1) Show the fitted nominal distribution, nominal observations, and its statistically derived threshold in the linked views. (2) Reveal validation points labeled Nominal and Anomaly, including a synthetic anomaly sample accepted by the initial threshold. (3) Move the candidate threshold through the labeled distances, updating FP, FN, total errors, and the requested FP/FN target from the displayed samples. (4) Expand to three RF-split rows and transform the single shared threshold into separate calibrated thresholds. Preserve point identities between views and distinguish fit samples from validation samples with filled and outlined markers.
Purpose: Explain why tuning was useful: the original threshold encoded a nominal statistical model, while calibration incorporated labeled anomaly behavior and a chosen error tradeoff. Use the annotation “Labeled validation examples now participate in boundary selection.”
Implementation detail: Use deterministic synthetic datasets and discrete candidate steps so counts change only when a boundary crosses an observation. Offer clean-separation and overlap presets, with a static final frame and reduced-motion mode.
-->

## Choosing a threshold when the classes separate

For one path, let $N$ contain the squared distances of labeled nominal examples and $A$ contain those of labeled anomaly examples. When

$$
\max(N)<\min(A),
$$

the observations leave a gap between the two classes. The tuner places the threshold within that gap using a configurable interpolation position $g$:

$$
\tau=\max(N)+g\bigl(\min(A)-\max(N)\bigr).
$$

An interior choice, $0<g<1$, separates all observed examples. The interpolation controls the boundary’s position between the most distant nominal example and the nearest anomaly example; it does not establish how unseen samples will behave.

The exact NND boundary rule matters here. NND classifies a sample as Anomaly only when

$$
q>\tau.
$$

Equality remains nominal. Consequently, the observed zero-error interval is $[\max(N),\min(A))$. The nominal endpoint is valid under this rule, while the Anomaly-class endpoint would accept the nearest anomaly observation.

> **[Figure 5 placeholder — The clean-separation gap and its endpoints]**
>
> A clean gap provides several valid thresholds, with endpoint behavior determined by the classifier’s comparison rule.

<!-- VISUAL SPEC: figure-05
Show: A distance strip with nominal values `[0.8, 1.1, 1.5, 2.0]` and anomaly values `[3.0, 3.6, 4.2]`. Shade the interval from 2.0 to 3.0, using a closed marker at 2.0 and an open marker at 3.0. Display $g$, $\tau$, FP, and FN.
Animate/interact: A slider moves the threshold through the gap; $g=0.5$ produces $\tau=2.5$ and zero observed errors. Enable endpoint inspection: $g=0$ still produces zero errors, while $g=1$ produces one false negative because the anomaly at 3.0 equals the threshold. Highlight that sample and display the evaluated expression `3.0 > 3.0 → false`.
Purpose: Make interpolation and strict boundary semantics concrete, including the endpoint that breaks separation.
-->

## Choosing a tradeoff when the classes overlap

Overlapping distances require a different decision. Lowering the threshold flags more anomalies, but it can also reject more nominal measurements. Raising it accepts more nominal variation while allowing more anomaly examples through. For the strict comparison used by NND, the relevant counts are

$$
\operatorname{FP}(\tau)=\#\{n\in N:n>\tau\},\qquad
\operatorname{FN}(\tau)=\#\{a\in A:a\leq\tau\}.
$$

The tuning routine evaluated candidate boundaries and compared their observed FP/FN ratios with a configurable target. The extreme settings directly prioritized minimizing false positives or false negatives; finite targets selected the candidate closest to the requested FP/FN ratio. These are counts on the supplied labeled data, so the balance of nominal and anomaly examples affects the ratio.

After selecting a candidate operating point, the routine placed the boundary in an adjacent interval between observations. An interior threshold preserves a classification partition while avoiding unnecessary coincidence with a sample value. When two differently labeled examples have exactly the same distance, threshold movement alone cannot separate them, so the strict comparison must apply consistently to both.

This calibration changes which mistakes NND prefers on the available validation data. Its performance on future measurements still depends on how representative those examples are. The useful outcome of the project was an explicit, deterministic calibration mechanism, rather than an assumed universal improvement in production error rates.

> **[Figure 6 placeholder — Inspecting overlapping distances]**
>
> Overlap makes threshold selection a choice about the observed balance of false positives and false negatives.

<!-- VISUAL SPEC: figure-06
Show: Two labeled point lanes on a shared $q$ axis, a draggable threshold, and a live confusion matrix. Use nominal values `[0.8, 1.4, 2.1, 2.8, 3.2]` and anomaly values `[1.8, 2.5, 3.0, 3.6]`. At $\tau=2.3$, display FP = 2, FN = 1, TP = 3, TN = 3, and FP/FN = 2.0.
Animate/interact: Manual mode permits continuous dragging. Calibration mode visits candidate partitions and displays each tradeoff before highlighting the chosen interval. Provide presets for minimizing FP, minimizing FN, and targeting a finite ratio. Show “∞” when FN is zero and FP is positive, and “undefined; zero errors” when both are zero. Keep the clean-separation branch distinct.
Purpose: Present tuning as an inspectable decision procedure. Include an equality toggle that adds differently labeled points at the same distance and demonstrates why they move together.
Implementation detail: Recompute all counts from the displayed arrays using `q > threshold`.
-->

Within NND, the architectural change connected calibration to the existing path submodels. Before calibration, NND used a shared threshold across those submodels. Calibration allowed each RF path to use a threshold informed by its own validation behavior. A threshold still belongs to the path whose fitted mean and covariance produced its distances.

> **[Figure 7 placeholder — NND shared threshold to per-split calibration]**
>
> Per-split NND calibration changes the decision boundaries while retaining the fitted nominal distance models.

<!-- VISUAL SPEC: figure-07
Show: Inference rows for three generic paths, A, B, and C. Include both a reflection port and a transmission port pair among the rows. Each row contains its feature slice, fitted $(\mu_i,\Sigma_i)$, computed $q_i$, and the comparison $q_i>\tau_i$. The before view has one shared threshold feeding all comparisons; the after view shows a separate calibrated threshold for each path. Do not depict an ordered array or another internal storage format.
Animate/interact: Toggle before/after while keeping features, fitted parameters, and distances fixed. Animate only the threshold assignments and resulting comparisons. Hovering a path’s threshold highlights that path. Add a separate calibration lane that consumes labeled distances and assigns a threshold to each path.
Purpose: Show where calibration enters NND inference: a shared threshold before, and a threshold informed by each path’s validation behavior after. End at path-level outputs; avoid inventing a device-level aggregation policy.
-->

## Following the measurement distribution over time

NND calibration refined how individual measurements were classified, while the second project looked at how groups of incoming RF measurements changed relative to a reference over time. A detector can retain a well-defined threshold while the data reaching it gradually shifts, making that history useful context for interpreting its behavior.

The existing drift calculation already compared two groups of RF-derived features and summarized their separation for each RF path. Unlike NND, which evaluates an individual measurement against a fitted nominal distribution, drift compares groups using their average responses and observed variation. My contribution was the tracking system around that calculation: identifying new measurement groups, resolving suitable references, reconstructing comparable inputs, and retaining the results over time.

The drift metric increases as the average RF responses separate relative to their spread, with larger departures contributing more strongly. It is not an anomaly probability or universal acceptance threshold, and its interpretation depends on comparing compatible RF paths, representations, and frequency grids.

> **[Figure 8 placeholder — Comparing RF traces for drift]**
>
> The drift summary measures separation between group-average RF traces relative to the groups’ per-frequency variation.

<!-- VISUAL SPEC: figure-08
Show: Baseline and current mean traces with shaded variation bands on a shared synthetic frequency grid, and a path drift readout. Label the bands as spread within each group, rather than confidence intervals. Do not show a per-frequency formula or the terms used to combine means and spreads.
Animate/interact: A displacement slider shifts the current mean trace in a selected frequency region. A separate spread slider changes variability while holding that gap fixed. The drift readout grows when the averages separate relative to the shaded spread. A linked hover shows the frequency and both means. Switching paths recomputes the display.
Purpose: Show that drift summarizes how far two group-average traces separate relative to the variation within the groups. Include an equal-centroid preset to illustrate that matching averages can leave other differences between the groups unsummarized.
-->

## Building a reproducible history

Turning a one-shot drift calculation into a monitoring system raised a different set of engineering questions:

- Which new datasets should be evaluated?
- Which historical data should be considered the reference?
- How do you ensure both groups use compatible feature extraction?
- What happens if the tracker misses several days?
- Can somebody reproduce a suspicious drift point later?

I built a tracker around these concerns. The prototype recorded how far evaluation had progressed, evaluated new data incrementally, and could replay missed daily windows to preserve the temporal meaning of the history.

Each comparison also needed a suitable reference dataset and compatible feature extraction. Because a drift value depends on both, the tracker preserved enough provenance to reconstruct how each historical point was produced.

The early implementation kept tracker state and outputs in a form that made replay and reference reconstruction easy to test. The resulting drift metrics were later integrated into Prometheus and Grafana, giving the team a monitoring view of RF drift over time.

> **[Figure 9 placeholder — Historical drift-tracking architecture]**
>
> Each historical drift evaluation connects a time window, a current dataset, a reference dataset, and the settings used to compare them.

<!-- VISUAL SPEC: figure-09
Show: A systems flow: new measurements, select reference, reconstruct comparable features, calculate drift, store the historical result with its provenance, then Prometheus and Grafana. Use synthetic labels such as “device family A” and “fixture 1.” Show sample counts separately because the groups can have different sizes. Do not name internal state fields, manifests, reference-resolution branches, source-card types, or a persistence format.
Animate/interact: Replay three windows in sequence. Selecting a result shows its time bounds, the current and reference datasets, extraction settings, and path summaries. A “reference changed” state swaps in a different reference and annotates the resulting history point, without naming an internal resolution order.
Purpose: Make the provenance of each historical value visible and distinguish incremental discovery from reconstructing a comparable comparison.
Implementation detail: Draw tracking and the later monitoring destination as separate areas. Connect historical drift evaluations to Prometheus and Grafana; do not imply a specific exporter, storage backend, retry guarantee, or production scheduling policy.
-->

## Validating the tracking workflow

I built helper tooling to inspect historical collections and models, find device/setup groups with usable data, and replay the tracker with a controlled notion of the present. Replay used separate state so historical runs could advance without overwriting the active tracker state.

Another helper reconstructed baseline and current feature arrays for a selected comparison and ran the same drift calculation directly. This provided a way to inspect the inputs independently of the window-discovery workflow. I also verified that historical comparisons could be reconstructed from their stored provenance.

These tools made the surrounding system easier to inspect. A suspicious history point could be traced back to its inputs, while a missing point could be investigated through collection availability, reference selection, and retrieval. The historical value became something the team could examine, rather than a scalar detached from the measurements that produced it.

> **[Figure 10 placeholder — Synthetic Prometheus/Grafana drift monitoring]**
>
> A drift history supplies temporal context, with source details available for investigating changes.

<!-- VISUAL SPEC: figure-10
Show: A Grafana-style time-series panel with a small Prometheus data-source badge for one synthetic device/setup group, with separate maximum-reflection and maximum-transmission drift series. Use relative dates such as Day 1–Day 14, an axis labeled “spread-normalized drift,” and a persistent “synthetic data” badge. Include the reference used and current/reference sample counts in a linked detail panel, without naming an internal reference-resolution order.
Animate/interact: Hovering reveals the evaluation window, both drift values, the paths producing their maxima, and the reference used. Clicking opens the trace comparison from Figure 8. A time-range control explores gradual movement and a sudden change; a reference-change annotation explains a discontinuity. Missing evaluations appear as gaps with their status, never as zero.
Purpose: Demonstrate how historical drift supports investigation without turning it into an anomaly probability or an automatic acceptance decision. Use neutral colors for the primary series and omit a universal red/green threshold. Any optional alert line must be labeled as an illustrative configuration.
-->

## What I took away from the work

These two projects improved different parts of the same measurement pipeline. Threshold tuning used labeled examples to make NND’s operating point explicit for each RF path, while drift tracking connected recurring group comparisons to a reproducible history and monitoring view. Their value depended on details that could easily disappear behind a single score: the exact inequality at the boundary, which threshold belonged to which RF path, the chosen reference, and the configuration used to reconstruct the data.

Working on both reinforced how much ML engineering depends on making those details inspectable. A statistical model provides a foundation, labeled calibration defines an operating choice, and historical monitoring gives the team context as measurements evolve. For electronics assurance, that connection between physical measurements, decisions, and their provenance was one of the most interesting engineering problems I worked on during the internship.

<!-- Visual implementation convention: all traces, labels, identifiers, dates, feature vectors, thresholds, and dashboard values must be synthetic. Reuse a restrained palette across figures: nominal circles, anomaly crosses, a dashed statistical threshold, and a solid calibrated threshold. Pair color with shape and text. Provide keyboard controls, descriptive accessible text, reduced-motion behavior, and a meaningful static fallback for every animation. The visual specifications describe future portfolio artifacts, not additional claims about the production system. -->
