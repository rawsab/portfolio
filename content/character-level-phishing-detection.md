# Training an NLP Model to Detect Phishing URLs

In the synthetic URL `https://secure-login.example/verify`, the hostname ends at the slash after `.example`. Everything that follows belongs to the path. A reader can make that distinction at a glance because punctuation carries structure. I built a phishing URL classifier in January 2024 to see how much of that structure a model could learn directly from the string.

When I returned to improve the repository and its documentation, I used the released checkpoint to reconstruct the evaluation. The classifier correctly labeled 99.18% of the URLs in the original test split. Looking at which sites those URLs came from revealed a limitation that the accuracy score alone could never show. This project was inspired by Zack Pettry.

## Why read a URL character by character?

URL text has a different rhythm from prose. Words run into digits, path segments can contain arbitrary strings, and delimiters like `.`, `/`, and `?` change how the text around them is interpreted. A word vocabulary would need rules for breaking up these strings and handling fragments it had never seen. A character vocabulary preserves the sequence, including the position of punctuation and the characters immediately around it, using a small set of reusable tokens.

That representation lets the classifier work from a URL alone. It can learn associations between a string and the labels it saw during training. The training data still defines which associations it has a chance to learn, a distinction that becomes important once the same hosts start showing up in both training and testing data.

## Building the corpus and fixing the input length

I combined verified phishing reports from an October 2018 PhishTank export with a whitelist of benign pages. The loader deduplicates exact URL strings and gives the benign label precedence if a string appears in both sources. There were zero cross-source matches in this snapshot. The result was **67,997 URLs**, of which **38,228 were benign (56.22%)** and **29,769 were malicious (43.78%)**.

A seeded random permutation with seed `42` assigned 54,399 URLs to training, 10,199 to validation, and 3,399 to test, following an 80/15/5 target. The vocabulary in the released pipeline was fitted on the full corpus. It has 69 characters and reserves ID `0` for padding, which gives the embedding table 70 rows. The tokenizer lowercases each URL, maps known characters to IDs, and skips characters outside its vocabulary. It left-pads shorter sequences with zeros and keeps the last 128 token IDs of longer sequences.

The median raw URL was 59 characters long and the mean was 83.4. **9,691 URLs (14.25%)** exceeded the 128-token input limit and were truncated. The raw-length count above 128 was the same in this corpus. Keeping the tail preserves the final part of the URL, but the model can lose some or all of the hostname if a path or query is long enough. That makes input width a choice about what the model can see.

> **[Figure 1 placeholder — URL length and the 128-character cutoff]**
>
> Raw lengths in the deduplicated corpus. The cutoff separates 145 URLs of exactly 128 characters from the 9,691 longer URLs.

<!--
Figure 1 / UrlLengthCutoff
Initial state — Show both classes on a common count scale with a clearly labeled line at length 128 and an exact-length-128 bin.
Interaction — Switch among Both, Benign, and Malicious. Hover, focus, or tap a bin to inspect its bounds and count. Update the shorter/exactly/longer breakdown and truncation count for the selected cohort. Treat an open-ended last bin as an overflow bin, and offer a readable table of exact counts.
Data — url_length_distribution.json. Plot raw-length histogram bins and use the tokenizer-based truncated fields for the truncation callout. Do not invent a density or within-bin observations.
Purpose — Show how often the fixed input window discards the beginning of a URL. Explain that the measured histogram uses raw length while truncation is applied after tokenization.
Fallback — Show both class distributions with the cutoff and counts in a static chart and table.
-->

## From characters to a single score

A character ID selects a row in a learned embedding table. Each row has 128 values that are adjusted during training along with the rest of the model. This produces one vector for each of the 128 input positions. The integer IDs are indices into that table, and their ordering does not tell us how a character affects the final score.

Three bidirectional LSTM layers process the embedded sequence. Each layer has one recurrent stream that reads forward and one that reads backward. In the first two layers, each stream produces 256 values per position. The model concatenates the streams into a 512-dimensional sequence and passes all 128 positions to the next layer. The third layer keeps only the final state from each direction, concatenating two 128-dimensional states into a single 256-dimensional representation of the input. A dense sigmoid layer turns that vector into a malicious score between zero and one.

> **[Figure 2 placeholder — From a URL to a phishing score]**
>
> Follow a synthetic URL through its actual token IDs and the checkpoint’s layer shapes. The animation illustrates the computation.

<!--
Figure 2 / CharacterModelWalkthrough
Initial state — Show the labeled synthetic input https://secure-login.example/verify broken into selectable character cells. Open on the input stage with a visible step rail for Token IDs, 128 positions, Embedding, BiLSTM 1–3, and Sigmoid.
Interaction — Step, go back, play/pause, and reset. Hover, focus, or tap a character to connect its index, saved token ID, position after padding, and selected embedding row. Collapse the zero run into a labeled span with an expansion control. Offer a longer synthetic example so the reader can inspect discarded prefix tokens and the retained 128. In each BiLSTM stage show forward and backward arrows traveling in opposite directions. Display units per direction, output shape, parameters, and sequence retention in the layer selector.
Data — character_vocabulary.json and model_architecture.json. Embedding [batch,128,128], 8,960 params. BiLSTM 1 and 2 [batch,128,512], 788,480 and 1,574,912 params. BiLSTM 3 [batch,256], 656,384 params. Dense [batch,1], 257 params. Total 3,028,993. Use indexed schematic cells for learned weights and a symbolic output score.
Purpose — Show how fixed-size character input becomes contextual states and then a single prediction. Embedding rows are learned vectors.
Fallback — Discrete steps and a complete textual layer table with no directional animation. The typography and diagram composition should match the site's existing article figures.
-->

The model has **3,028,993 parameters**, most of them in the recurrent layers. The second BiLSTM is the largest because it reads 512 input features per step, the concatenated output of the first layer. Each BiLSTM applies dropout of 0.3 to its inputs and recurrent dropout of 0.3 to its recurrent connections during training.

## Training and checkpoint selection

I trained the released model in Google Colab on an NVIDIA T4 GPU with batches of 256, using Adam and binary cross-entropy. Validation loss controlled both checkpointing and early stopping. The checkpoint was saved whenever validation loss reached a new minimum, and early stopping was configured with a patience of two epochs and to restore the best weights.

Validation loss fell from about 0.1958 in epoch 1 to 0.0152 in epoch 10, the lowest of the ten recorded epochs. Over the same interval, validation accuracy rose from 92.47% to 99.47%. Training loss fell from 0.3541 to 0.0172, while training accuracy rose from 84.19% to 99.43%. Those curves describe improvement on the validation examples produced by this split. The saved checkpoint went on to a separate set of URL strings for the test evaluation.

> **[Figure 3 placeholder — Training and validation across ten epochs]**
>
> Recorded training and validation metrics. The checkpoint at epoch 10 had the lowest validation loss.

<!--
Figure 3 / TrainingProgress
Initial state — Open on Loss with both Training and Validation visible. Label epoch 10 as the checkpoint selected by validation loss.
Interaction — Switch among Loss, Accuracy, Precision, Recall, and AUC. Toggle training and validation independently. Hover, focus, or tap an epoch to inspect both recorded values. Draw straight segments between recorded points and allow the exact points to be read in a table.
Data — All ten rows from training_history.json. Confirm epoch 10 with audit.json. AUC in this chart is the training-time Keras metric.
Purpose — Connect the learning curves to the checkpoint decision and distinguish validation monitoring from final test evaluation.
Fallback — Show the loss plot and a table of recorded epochs.
-->

## What the model scored on held-out URLs

I ran inference with the saved checkpoint and tokenizer on the same 3,399 test URLs. At the configured threshold of 0.50, the recomputed results matched the saved report exactly. Of 1,895 benign URLs, the model flagged 16. Of 1,504 malicious URLs, it missed 12. Accuracy was **99.18%**, precision **98.94%**, recall **99.20%**, and specificity **99.16%**. F1 was **0.9907**, with a test ROC AUC of **0.9994**.

The underlying scores were strongly separated on this split. The median malicious score was 0.000108 for benign URLs and 0.999869 for malicious URLs. In the first score bucket, from 0.00 up to 0.02, there were 1,852 benign URLs and only three malicious ones. This is a comparison of score distributions by actual class. Calibration would require checking how often an example is malicious at a given score on representative data.

> **[Figure 4 placeholder — Held-out score distribution]**
>
> Scores from the released model, grouped by actual label. The vertical line marks the configured cutoff of 0.50.

<!--
Figure 4 / ScoreSeparation
Initial state — Show benign and malicious counts over all 50 bins on the same 0–1 score axis. Mark 0.50 and label the class medians.
Interaction — Hover, focus, or tap to inspect both counts for each bin. Offer an optional log-scaled count view with explicit labeling and zero handling, or a tail inset. Preserve every measured bin and make near-zero counts accessible.
Data — probability_distribution.json, 0.02-wide buckets and both class summaries. The last bucket includes 1.00.
Purpose — Explain why the reported cutoff separates most examples on this split. The figure measures score separation. Calibration needs a separate analysis.
Fallback — Show the static distributions, median labels, and a bucket table.
-->

## What moves when the threshold moves?

A score becomes a decision when it meets or exceeds the threshold. Lowering that threshold flagged 18 benign URLs and missed seven malicious URLs at 0.24. Raising it to 0.72 cut false positives to eight and increased misses to 15. Which error matters more depends on what happens after a flag, such as whether it sends a URL for review or blocks access automatically.

At 0.50, the 16 false positives had a median raw URL length of 169.5 characters, compared with 65 for the correctly classified benign URLs. The false-positive group is small, and the length aggregates alone cannot tell us why the model flagged those examples.

Across the 101 test thresholds, 0.24 maximized balanced accuracy, the average of recall and specificity, at 0.9929235. The highest F1, 0.9923359, occurred at 0.72. Both are observations made after seeing the final test results. For a new evaluation, I would select a threshold on validation or separate calibration data, freeze it, and then score the test set. Choosing it from the displayed sweep would let the final test labels influence the reported operating point.

> **[Figure 5 placeholder — Explore the decision threshold]**
>
> Move the threshold through the recorded sweep to see where benign flags and malicious misses trade places.

<!--
Figure 5 / ThresholdExplorer
Initial state — Start at 0.50. Show actual classes as rows and predicted classes as columns, with [[1879,16],[12,1492]]. Display accuracy, precision, recall, specificity, F1, FP, and FN.
Interaction — Use a keyboard- and touch-operable range input from 0.00 to 1.00 in 0.01 steps. Add clickable markers for 0.24, 0.50, and 0.72 with labels for the two test-grid maxima and configured cutoff. Cards and confusion counts update from the exact row. Show “Undefined” for null precision at 1.00. Keep the following warning adjacent to the control at every size: “0.24 and 0.72 are descriptive test-set optima, not valid deployment threshold choices. Threshold selection should use validation/calibration data.”
Data — threshold_metrics.json, all 101 recomputed rows, with inclusive comparison score >= threshold.
Purpose — Make the consequences of a cutoff tangible and keep retrospective analysis distinct from threshold selection.
Fallback — Keep the 0.50 matrix and named comparison rows visible in an accessible table.
-->

The ROC curve summarizes this tradeoff as the false-positive rate and true-positive rate change across the observed scores. Its area of 0.9994 indicates strong ranking on this split. The operating point still comes from a chosen cutoff, which is why the confusion counts are the more direct description of how the API behaves at 0.50.

> **[Figure 6 placeholder — ROC curve for the original test split]**
>
> Each operating point plots malicious recall against the fraction of benign URLs flagged. The highlighted point starts at the 0.50 cutoff.

<!--
Figure 6 / TestRoc
Initial state — Use a compact equal-axis 0–1 plot, diagonal chance reference, full ROC trace, AUC rounded to 0.9994, and a labeled operating point at 0.50.
Interaction — If shared state fits the article, move the marker using the threshold explorer row’s exact FPR and recall. An optional upper-left inset can make the low-FPR region readable.
Data — All 3,235 points from roc_curve.json with exact AUC 0.9993886136529502. Use threshold_metrics.json for the operating-point marker.
Purpose — Give the ranking metric a visual interpretation without putting a second large evaluation dashboard on the page.
Fallback — Static full trace and text with AUC and the configured operating point.
-->

## How much of the test set came from familiar sites?

The benign corpus contained 1,404 exact hosts and 1,203 registrable domains across 38,228 URLs. Under the analysis convention, hostnames are normalized and `www.` is retained. The ten most common exact hosts accounted for **78.72%** of all benign URLs, and the top 25 accounted for **94.72%**. With many pages drawn from a few hosts, a shuffle of individual URLs will often put pages from the same site on both sides of the split.

For **1,834 of the 1,895 benign test URLs (96.78%)**, at least one training URL had the same exact host. The corresponding count for malicious examples was **921 of 1,504 (61.24%)**. Grouping by registrable domain brings related subdomains together and raises those shares to **97.47%** for benign URLs and **70.55%** for malicious URLs. Each comparison checks against all training URLs, regardless of their class, and uses all test URLs of that class as its denominator.

The original split measures performance on held-out strings from this corpus. A model that has seen other pages from a host may encounter familiar URL structure, a familiar label distribution, or both. The overlap counts tell us how often that exposure was possible. How much of the measured performance came from it remains an empirical question.

> **[Figure 7 placeholder — What crossed the split boundary]**
>
> Measured overlap counts are paired with a synthetic view of how individual URL shuffling can spread one domain across multiple splits.

<!--
Figure 7 / HostOverlapInspector
Initial state — Show the measured exact-host match counts for benign and malicious test URLs beside a compact conceptual strip of synthetic URL groups across Train, Validation, and Test. Keep the counts visibly separate from the schematic.
Interaction — Toggle Exact host / Registrable domain to update both measured shares. Reveal cumulative top-10 and top-25 benign coverage as ranked, anonymous blocks. Switch the schematic to Group by domain to move each synthetic family together into one split. Leave the original measured statistics labeled as the URL-level baseline and present the grouped state as a proposal with no new performance values.
Data — split_host_overlap.json, all_training_labels and all-URL denominators. host_distribution.json, benign exact-host coverage with www. retained. Use synthetic .example families in the schematic and aggregate-only bars.
Purpose — Show why distinct test strings can still share sites with training. Overlap measures exposure. Its effect on model performance remains unknown.
Fallback — Present the exact-host and registrable-domain rows as a table beside two static split sketches.
-->

## A stronger test would hold out whole domains

For the next experiment, I would group URLs by their registrable domain before assigning them to a split. Every URL from the same group would move together, including groups that contain both benign and malicious URLs. The feasibility analysis found 1,203 benign registrable domains and 11,560 malicious registrable domains, with 101 mixed-label groups under the grouping policy, which also uses exact IP keys. One candidate test allocation contains **1,207 benign and 1,401 malicious URLs**. That establishes a workable test size. Model performance on those groups has yet to be measured.

I would fit a tokenizer on the new training URLs alone and train a freshly initialized model. The saved tokenizer saw the full corpus, and the saved model may already have trained on URLs from the candidate holdout domains. Validation groups would determine the checkpoint and any threshold. Once those choices were fixed, I would score the frozen test groups once. A random URL split trained with the same training-only tokenizer protocol and a comparable training budget would give the comparison a cleaner baseline.

> **[Figure 8 placeholder — How a domain-disjoint evaluation would work]**
>
> Future experiment. The candidate counts describe a split-sizing check only.

<!--
Figure 8 / GroupedEvaluationPlan
Initial state — Show Group by registrable domain as the first selected step and a compact table of feasible train, validation, and test counts.
Interaction — Step through grouped allocation, fit tokenizer on training only, train a fresh model, select checkpoint and threshold with validation, and score frozen test groups once. Highlight which split may supply data at each step. Keep holdout verification visible before training.
Data — domain_disjoint_plan.md and audit.json. Use the candidate allocation and quarantine counts exactly. Label the sequence “Future experiment · not yet run.”
Purpose — Make the evidence boundary clear. The sizing check verifies that the split can retain examples of both labels. It yields no model score.
Fallback — Show the ordered protocol and the candidate split table.
-->

## Serving a URL score

The repository also packages the tokenizer and checkpoint behind a Flask REST API. `GET /health` reports whether the service is up. `POST /predict` accepts a URL string and sends it through the same encoding and scoring path as evaluation. The service compares the unrounded score with 0.50, then returns the displayed probability, a Boolean classification, and a readable verdict. The service scores the submitted text directly, without visiting the page.

> **[Figure 9 placeholder — A prediction through Flask]**
>
> An illustrative request follows the same tokenizer, checkpoint, and cutoff used by the service.

<!--
Figure 9 / FlaskPredictionPath
Initial state — Show a synthetic request against POST /predict, with the response collapsed and GET /health shown separately as a small status-route label.
Interaction — A single step-through control reveals request validation, saved tokenizer and checkpoint, symbolic sigmoid score, the >= 0.50 rule, and response fields. Use a conditional JSON-shaped field view or an explicitly illustrative fixture. The page should make no live request.
Data — Public API and detector code. Example URL is synthetic. Surface malicious_probability, is_malicious, and verdict.
Purpose — Connect the inference path to a service boundary and show where the score becomes a decision.
Fallback — Static request-to-response flow with the same labels.
-->

Revisiting the project made the split feel as consequential as the architecture. The model learned to separate the classes in the original test set, and the host analysis showed how much of that set came from familiar sites. A domain-disjoint evaluation would narrow the question to unfamiliar domains within this corpus. Given the age of the phishing export, a separate time-forward test would be needed to measure performance on contemporary data. Each test would tell me something different about where a classifier that reads URL strings can be trusted. You can find the repository [here](https://github.com/rawsab/nlp-phishing-detection).
