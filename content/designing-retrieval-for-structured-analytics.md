# Rethinking Retrieval for Structured Analytics

A row of analytics data can contain the right number and still be poor evidence for a question. A view count needs a platform, a reporting period, and a relationship to a particular post. A creator's performance needs the campaign that gives the comparison meaning. When those relationships disappear during embedding, semantically similar records can become interchangeable even when they describe different things.

I encountered this problem while working on retrieval-augmented generation at Node App. I built the RAG system end to end, using MySQL, Pinecone, and the OpenAI API to make structured information accessible through natural-language questions. The service supported 2,000+ users, with P95 response latency under approximately 5.5 seconds. A backfill job brought roughly 30,000 records from existing customer data into the system.

That work led me to investigate how the representation of structured analytics changes retrieval. I personally ran the quantitative embedding and retrieval experiments discussed here on a controlled synthetic benchmark, separate from the production service and its customer data. I documented that work in a study titled **A Quantitative Comparative Analysis of Embedding Techniques for Social Media Campaign Analytics in Retrieval-Augmented Generation Systems**. Across five strategies, I compared what happened when retrieval had access to isolated rows, summaries, metadata, and progressively richer hierarchical context.

The strongest result came from representing the data at multiple levels of its existing hierarchy. I refer to this approach as **multi-tier hierarchical embeddings**: post-level evidence carries creator and campaign context, while separate representations support retrieval at each level of the hierarchy.

For company context, [Dulcedo acquired Node App](https://www.prnewswire.com/news-releases/dulcedo-group-acquires-ai-powered-influencer-marketing-startup-node-app-302247029.html), and the former Node App team has been working on Kickflo. [Kickflo's public description](https://www.linkedin.com/company/kickflo) presents it as a Dulcedo-backed platform using AI-powered tools to help creators and brands connect, collaborate, and develop their partnerships. The discussion here stays at the level of engineering concepts; every example record and proposed visual uses invented data.

## The data already had a hierarchy

The retrieval problem grew out of a practical analytics workflow. Creators upload screenshots of performance insights from platforms such as TikTok, YouTube, and Instagram. Flometrics turns those screenshots into structured spreadsheet reports, making the metrics easier to review and compare.

I contributed to the backend service behind that screenshot-to-spreadsheet workflow alongside other engineers. It involved platform detection, Tesseract OCR, structured interpretation through the OpenAI API, MySQL persistence, and ExcelJS spreadsheet generation. My contribution to that pipeline was part of a team effort, distinct from my end-to-end ownership of the RAG system.

Conceptually, the data has three connected levels. Individual posts contribute to a creator's results within a campaign, and those results contribute to the campaign's overall performance. A question may require evidence from any of those levels, sometimes together. Converting screenshots into rows makes the values accessible, but the retrieval system still has to preserve the relationships that make those values useful.

> **[Figure 1 placeholder — Screenshot to structured analytics]**
>
> Conceptual Flometrics workflow, illustrated with synthetic data. Validated metrics retain their post, creator, and campaign relationships.

<!-- VISUAL SPEC: figure-01 / ScreenshotPipeline
Initial state: Show a fabricated mobile analytics screen labeled “Synthetic example,” with views of 18,400 and interactions of 736. Beside it, show an empty sequence: platform detection → preprocessing and OCR → metric association and validation → structured storage → spreadsheet export. Place post, creator-within-campaign, and campaign cards beneath storage. These are conceptual entities, not a production schema.
Animate/interact: A keyboard-operable “Step through” control first identifies the example as a TikTok-style screen, then reveals text boxes and their positions, associates labels with values, and populates the structured cards. Branch the validated data into MySQL storage and an ExcelJS spreadsheet export. An expandable detail explains Tesseract's extraction role and the OpenAI API's interpretation role. Give validation a separate step and a visible “needs review” path for ambiguous fields.
Purpose: Text extraction, interpretation, validation, and export are separate operations. The hierarchy begins during ingestion and must survive into retrieval.
Static fallback: Show all stages and both output branches without animation.
-->

## OCR made the importance of context visible

The OCR experiments exposed an earlier version of the same problem. Recognizing a word such as “Followers” does little to resolve whether it belongs to a reach breakdown or an engagement breakdown. The screenshot's sections and spatial relationships supply that distinction.

The preprocessing reports described grayscale conversion and thresholding as useful for improving text visibility in the tested screenshots. They also recorded tradeoffs: blur could soften characters, excessive dilation could merge nearby text, and some transformations produced duplicate bounding boxes. Dividing an image into sections helped associate repeated labels with the correct surrounding content. The Tesseract work also used word positions to reconstruct phrases and relative proximity to associate labels with values.

A separate shared experiment combined Google Vision text extraction with language-model interpretation. Its error analysis recorded label swaps, missed icon-associated metrics, and confusion between related values. They were exploratory OCR findings from a small evaluation, and I use them here as supporting context rather than a general ranking of OCR systems.

> **[Figure 2 placeholder — A small preprocessing comparison]**
>
> Synthetic crop illustrating preprocessing tradeoffs and section-aware label association. The examples explain reported failure modes; they are not OCR benchmark results.

<!-- VISUAL SPEC: figure-02 / PreprocessingCompare
Initial state: Use one invented analytics crop with a faint label, a gradient background, and two sections containing “Followers.” Keep this figure compact. Show the original beside a selectable transformation, initially grayscale. Display the expected synthetic labels and values below both images.
Animate/interact: Offer grayscale, binary thresholding, adaptive thresholding, blur, and dilation. A slider varies the transformation strength. A separate “Show section boundaries” toggle reveals how repeated labels can be associated with different sections. If OCR is actually run on the fabricated image, identify the engine and display its measured output; otherwise label all output overlays “Illustrative extraction.” Do not invent confidence scores, accuracy percentages, or a sharpening improvement unsupported by the reports.
Purpose: Improving character visibility and preserving the association between a label and its value are separate concerns. Aggressive preprocessing can discard useful information or introduce artifacts.
Static fallback: Provide original, grayscale, and thresholded crops with text descriptions.
-->

The same problem reappeared in retrieval, as once analytics became a collection of serialized rows, relationships that were obvious in the screenshot or spreadsheet could disappear from the representation.

## Why embedding each row was a weak baseline

Consider an invented post with 18,400 views and 736 interactions. A serialized row can include those labels, the platform, and a campaign name, yet still provide little context about the creator's other posts or the campaign's overall distribution.

Now consider the question: “How did TikTok engagement in the Cedar launch compare with the participating creators' usual results?” A useful answer needs a clear definition of engagement, an appropriate comparison period, and evidence covering the relevant creators. A nearest-neighbor search over isolated rows may return several records that mention TikTok and engagement while missing the aggregates needed for the comparison.

There are two failure modes here. One concerns scope: a similar-looking record from the Birch launch may rank above an appropriate Cedar record. The other concerns completeness: even a relevant Cedar post may provide only a small part of the evidence needed to answer. Increasing the number of retrieved rows can add more material without resolving either issue.

For metric-heavy questions, semantic relevance also leaves arithmetic unresolved. “Highest,” “average,” and “total” require well-defined operations over the correct set of records. Retrieval can help locate the relevant evidence and concepts; exact calculations need structured data and deterministic computation.

> **[Figure 3 placeholder — A plausible retrieval with the wrong scope]**
>
> Synthetic failure case: related vocabulary retrieves a record from a different campaign. Filtering fixes scope; complete aggregation still requires the full eligible dataset.

<!-- VISUAL SPEC: figure-03 / WrongScope
Initial state: Display the synthetic query “Show TikTok engagement for the Cedar launch.” Use a small fixture containing Cedar/TikTok, Cedar/Instagram, Birch/TikTok, and Birch/Instagram records. Each card carries a platform, campaign, and invented metric. Initially, show the campaign labels collapsed and the raw-row strategy selected.
Animate/interact: “Retrieve” reveals a scripted ranking containing a Birch/TikTok record among the first results. Expanding provenance exposes the campaign mismatch. Switching to “Explicit campaign and platform constraints” removes ineligible records before ranking. In a second view, replace the query with a campaign-wide average and show why a few relevant rows are insufficient for complete aggregation. Label scripted rankings “Illustrative, not benchmark traces.”
Purpose: Similarity, scope, and evidence completeness require separate checks. A fluent answer can inherit an error introduced before generation.
Static fallback: Include both ranked lists as accessible text.
-->

## Five ways to represent the same analytics

I kept the embedding model fixed in the benchmark and changed the representation and retrieval policy. The five methods form a progression of design choices, although the summary-only method is an alternative granularity rather than a guaranteed improvement over raw rows.

### A. Raw row embeddings

The baseline serialized each post or creator row into text and embedded it independently. It retained the information present in that row but added no surrounding summaries or structured retrieval filters.

This representation was simple to build and inspect. Its weakness was that retrieval had to reconstruct broader context from independently ranked fragments. Rows with similar metric labels could be close in semantic space despite belonging to different campaigns.

### B. Campaign summaries alone

The second strategy embedded campaign summaries containing aggregate performance and platform information. This gave retrieval a representation closer to the level of a broad campaign question, with a much smaller collection to search.

The loss of detail was consequential. A summary can describe campaign performance while omitting the individual post needed for a specific question. In this benchmark's mixture of query types, summary-only retrieval scored below the row baseline. That result made granularity an explicit design decision: summarization preserves some questions while removing the evidence needed for others.

### C. Metadata-enriched rows

The third strategy enriched rows with structured descriptors, included those descriptors in the embedded text, and stored them as filterable metadata. Campaign, platform, creator, and content format could then help both semantic interpretation and candidate selection.

Metadata served two roles: including it in the embedded text could influence ranking, while using it as an explicit filter could restrict which records were eligible for retrieval at all.

Because this method changed both representation and filtering, its measured improvement reflects their combined effect. The comparison does not isolate the contribution of either change on its own.

### D. Dual-tier retrieval

The fourth strategy retained metadata-enriched rows and added a campaign-summary tier. Retrieval could first identify a relevant campaign through its summary, then search the detailed records within that scope.

This created a useful division of work. Summary retrieval operated at the level of the broader question, while row retrieval supplied specific evidence. It also introduced a routing dependency: if the first stage chooses an inappropriate campaign, the second stage searches the wrong subset. When a query already supplies an unambiguous, authorized campaign, that explicit scope should carry through directly.

### E. Multi-tier hierarchical embeddings

The final strategy represented posts, creators, and campaigns separately while adding parent context to each post representation. In conceptual terms:

```text
Post representation =
    post facts
  + scope and descriptive metadata
  + relevant creator context
  + relevant campaign context
```

This is a description of the information included, not an internal prompt template. The paper refers to this as "multi-tier contextual embeddings", however, I use "multi-tier hierarchical embeddings" here to make the relationship between levels explicit.

The distinguishing change from dual-tier retrieval was that a post carried surrounding context into its own embedding. A candidate could be retrieved as a specific observation within a larger performance pattern. Separate creator and campaign representations still supported questions at those broader levels.

The context needs careful scope. A creator's aggregate within one campaign and their history across campaigns describe different populations. Any cross-campaign context used in a production design must be explicitly labeled and remain within the reader's authorized scope.

> **[Figure 4 placeholder — The five-strategy progression]**
>
> Five representations of the same synthetic analytics hierarchy.

<!-- VISUAL SPEC: figure-04 / FiveStrategies
Initial state: Show A–E as five selectable tabs beside a fixed synthetic campaign tree. Select A and illuminate only the independent row representations. Keep the underlying fixture and example question unchanged across tabs.
Animate/interact: B replaces rows with one campaign summary. C restores rows, adds descriptive metadata, and reveals a candidate filter. D adds a separate summary-search stage before detailed retrieval. E adds creator and campaign representations and draws contextual links into each post's embedded representation. Mark each addition as “embedded information,” “stored metadata,” or “retrieval stage.” Include a detail-query toggle that shows what information B has discarded.
Purpose: Granularity, contextualization, and candidate selection are distinct design choices. More summary information cannot recover detail that was never indexed.
Static fallback: Use a comparison table showing indexed units, embedded context, filters, and retrieval stages for each method.
-->

## Context changes the retrieval neighborhood

The motivation for contextualizing a post was to make its relationships available when the embedding was created. With isolated rows, similarity can be driven by repeated metric labels and platform vocabulary. Adding creator and campaign context gives the embedding model information that can help distinguish otherwise similar observations.

That intuition needs a precise boundary. An embedding space does not acquire relational guarantees when a parent summary is added. The contextual text may improve ranking, and explicit constraints can enforce the eligible campaign set. The two mechanisms work together, but they solve different parts of the problem.

> **[Figure 5 placeholder — Neighborhood and eligible candidates]**
>
> Schematic retrieval neighborhoods before contextualization, after contextualization, and after scope filtering.

<!-- VISUAL SPEC: figure-05 / RetrievalNeighborhood
Initial state: Show a schematic two-dimensional field with a query marker and synthetic post markers. Color identifies campaign; shape identifies platform. Select raw-row representation and highlight a mixed-campaign nearest-neighbor list. State prominently: “Conceptual layout; distances are illustrative.”
Animate/interact: Use two independent controls: “Add hierarchical context” changes the illustrated ranking, while “Apply campaign constraint” makes out-of-scope markers ineligible. Animate the first as a change in relative positions and the second as masking candidates. Synchronize a ranked list beside the field and allow keyboard selection of each point to inspect its synthetic provenance. Never present the drawing as a projection of the measured embedding vectors.
Purpose: Contextualization influences semantic ranking; filtering constrains eligibility. The distinction remains visible even when both improve the final result.
Static fallback: Provide three labeled panels and their ranked lists; avoid numerical similarity scores.
-->

## What the controlled synthetic benchmark measured

For the controlled benchmark, I generated a synthetic dataset of 70 campaigns, 3,200 posts, and 780 creator-level records. The study allocated 60 campaigns to indexing and retrieval evaluation, five to an unindexed-campaign test, and five to contamination stress testing. The main comparison used 500 analytic queries spanning post-level questions, creator comparisons, and campaign summaries. Relevant evidence was determined from the underlying synthetic data.

All five methods used the same 1,536-dimensional embedding model, `text-embedding-ada-002`, with cosine-based retrieval. This describes the historical experiment configuration. The model was held constant so the comparison could examine the representation and retrieval choices.

The following values are the results from that controlled synthetic benchmark:

| Strategy | Accuracy@1 | Accuracy@3 | Accuracy@5 | MRR | Cross-campaign contamination |
| :--- | ---: | ---: | ---: | ---: | ---: |
| A — Raw rows | 0.41 | 0.57 | 0.64 | 0.54 | 0.28 |
| B — Campaign summaries only | 0.32 | 0.48 | 0.55 | 0.46 | 0.17 |
| C — Metadata-enriched rows | 0.67 | 0.82 | 0.89 | 0.78 | 0.06 |
| D — Dual tier | 0.74 | 0.88 | 0.93 | 0.84 | 0.03 |
| E — Multi-tier hierarchical | 0.81 | 0.92 | 0.96 | 0.89 | 0.01 |

Accuracy@k measures whether at least one relevant item appears in the first k retrieved results. MRR measures the reciprocal rank of the first relevant result, averaged across queries. Contamination measures the average fraction of the first five results belonging to another campaign. Lower contamination is better; higher values are better for the other columns.

Method E improved Accuracy@1 from 0.41 to 0.81 relative to raw rows, a gain of 40 percentage points. MRR rose from 0.54 to 0.89, while contamination fell from 0.28 to 0.01. The metadata-enriched method accounted for a substantial part of the improvement, and the two hierarchical methods improved further.

The summary-only result is equally informative. Its lower score shows the cost of removing granular evidence from a benchmark that includes detailed questions. The comparison supports maintaining representations at multiple levels of detail.

Latency also depended on the retrieval design. In the paper I reported median search latencies of 12.4, 6.3, 11.8, 8.1, and 7.4 milliseconds for A through E, respectively. Summary-only search was fastest in that measurement, alongside its lower retrieval accuracy. These are search-stage figures from the synthetic experiment. They are separate from query embedding, answer generation, and the production service's P95 response latency under approximately 5.5 seconds.

> **[Figure 6 placeholder — Benchmark results with metric definitions]**
>
> Results from the controlled synthetic study. Retrieval hits measure relevant evidence, not complete answer correctness. The aggregate results do not include confidence intervals.

<!-- VISUAL SPEC: figure-06 / BenchmarkResults
Initial state: Display a grouped bar chart for Accuracy@1, with A–E in a fixed order and a zero-based 0–1 axis. Keep “Controlled synthetic benchmark · 500 queries” visible above the chart. Place the complete numeric table below it.
Animate/interact: A metric selector switches between Accuracy@1, Accuracy@3, Accuracy@5, MRR, and contamination using exactly the table values above. Update the direction label and definition with each selection. A comparison control highlights A and E, showing a 0.40 absolute Accuracy@1 difference or a 0.27 absolute contamination difference as appropriate. A separate, secondary search-latency panel uses the reported A–E medians with a zero-based millisecond axis and the label “Reported median search stage; excludes full answer generation.” Keep it separate from the production P95 figure. Do not add invented error bars, raw query traces, or OCR scores.
Purpose: Retrieval quality, ranking, scope errors, and latency measure different properties. A smaller search space can be fast while lacking the evidence a question needs.
Static fallback: Preserve the full table and definitions without interaction.
-->

### What the benchmark does and doesn't show

These results informed my design choices within the evaluated workload. They do not establish the same gains on production campaign data, across embedding models, or under different query distributions. The comparison changes several parts of the system together, including filtering and representation, so it cannot attribute the entire gain to contextual text alone. The aggregate values in that paper also lack confidence intervals and per-query traces.

Accuracy@5 of 0.96 means the first five results contained at least one relevant item for 96% of benchmark queries. A comparison or aggregation question may require several pieces of evidence, so that metric leaves evidence completeness and final answer correctness unmeasured.

## Turning the hierarchy into a retrieval architecture

The benchmark led to the retrieval architecture I implemented in production. The benchmark informed the production architecture I implemented, with structured storage, hierarchical representations, and query orchestration handling distinct parts of the retrieval path.

During ingestion, validated post facts remain in structured storage alongside their conceptual relationships to creators and campaigns. Aggregates are computed from those facts, and compact summaries provide context for the embedding representations. Pinecone holds the searchable representations and filterable metadata; MySQL remains the source for exact values and calculations.

At query time, the service first establishes the authorized scope and resolves any campaign or platform constraints. A question with a known campaign can go directly to the appropriate scoped evidence. A broader question can use campaign or creator representations to identify relevant areas within that authorized scope, followed by more detailed retrieval when needed.

The distinction between retrieval and computation becomes especially useful here. A campaign total should be calculated over the complete eligible population in structured storage. A specific post lookup may require only a small amount of evidence. A comparative explanation can combine computed aggregates with retrieved detail, provided the answer identifies its scope, metric definitions, and supporting records.

> **[Figure 7 placeholder — Final multi-tier hierarchical retrieval architecture]**
>
> The production multi-tier retrieval architecture, illustrated with synthetic data. Scoped hierarchical retrieval stays tied to structured source data and deterministic aggregation.

<!-- VISUAL SPEC: figure-07 / RetrievalArchitecture
Initial state: Draw two connected lanes. The ingestion lane shows validated synthetic facts in MySQL → scoped aggregate computation → campaign, creator, and contextualized-post representations → OpenAI embedding generation → Pinecone. The query lane shows question → authorization and scope resolution → retrieval routing → source fetching and computation → evidence assembly → answer. Label the entire figure “Implemented architecture, illustrated with synthetic data.”
Animate/interact: Provide two synthetic questions. “Explain Cedar's TikTok performance” travels through authorized campaign representations, creator context, and detailed evidence. “What are Cedar's total TikTok views?” highlights deterministic aggregation over all eligible stored records. Add a third “Campaign unavailable” state that ends in a clear missing-data response. Selecting a node reveals its inputs, outputs, and validation checks at a conceptual level. Show authorization constraining both the vector search and the subsequent source fetch.
Purpose: Multiple retrieval granularities preserve context, while structured computation handles exact numeric operations. Authorization, source integrity, and absent-data handling remain explicit system responsibilities.
Static fallback: Include both query paths with numbered steps. Use no real identifiers, table definitions, endpoint names, or prompt text.
-->

Hierarchical context creates a maintenance cost as well as a retrieval benefit. If a campaign summary changes and that summary is included in many post representations, those embeddings may need updating. A practical implementation needs dependency tracking and representation versions so a query can avoid combining stale contextual descriptions with newer source values.

Context length also needs a budget. Repeating an entire campaign report inside every post representation would add duplication and could overwhelm the information specific to the post. I would keep parent context compact, preserve exact values in structured storage, and measure whether each addition improves retrieval on the query types it is intended to support.

## Engineering takeaways

The clearest lesson was that the unit being embedded determines what retrieval can preserve. An isolated row retains detail but gives little help with broader relationships. A campaign summary provides that broader view while losing detail. Metadata establishes useful constraints, and hierarchical representations make it possible to carry context into detailed retrieval while retaining separate entry points at other levels.

That progression changed how I approached structured RAG. I began with questions about which information belonged in each representation, how the service would establish scope, and which operations required complete structured data. Those choices made the retrieval behavior easier to evaluate and the resulting architecture easier to reason about.

The OCR work exposed the same underlying lesson earlier in the pipeline: preserving a value also means preserving the context that gives it meaning. That principle ultimately shaped the retrieval design.

> **[Figure 8 placeholder — From screenshot to grounded answer]**
>
> Illustrative screenshot-to-answer path using entirely synthetic data. Every handoff preserves scope and provenance.

<!-- VISUAL SPEC: figure-08 / GroundedAnswer
Initial state: Show a fabricated screenshot at the left and a question at the right: “What was the interaction rate for this Cedar TikTok post?” The screenshot contains 18,400 views and 736 interactions. State the example definition explicitly: interactions divided by views. All values and labels are synthetic.
Animate/interact: An explicit “Play” button follows the record through the conceptual OCR pipeline, validation, structured storage, contextual representation, authorized retrieval, source fetch, and calculation. Compute 736 ÷ 18,400 = 4.0%, then assemble an answer identifying the platform, campaign, and metric definition. A scrubber lets readers inspect each handoff. An “Ambiguous extraction” toggle stops the pipeline at review; a “Missing evidence” toggle ends with an unavailable-data response. Label the sequence as an illustrative walkthrough of the production design, using synthetic data.
Purpose: Grounding depends on preserved meaning across the full path from extraction to evidence selection and calculation.
Static fallback: Show numbered frames and the arithmetic as selectable text.
-->

<!-- SHARED VISUAL IMPLEMENTATION NOTES
Every visual should work without motion. Use labeled controls, keyboard navigation, text equivalents for graphical states, and symbols or patterns alongside color. Respect reduced-motion preferences and provide a complete static state on narrow screens. Keep the preprocessing comparison small and reserve the most space for the representation comparison, retrieval neighborhood, benchmark, and final architecture.

Build all visual fixtures from scratch. Use invented campaign names, creator labels, values, and screen layouts. Benchmark charts may use the reported aggregate results above because the benchmark itself is synthetic; illustrative demonstrations must remain visibly distinct from measured results. Do not include actual customer screenshots, customer identifiers, production schemas, internal endpoints, or prompt templates.
-->

---

## A note on the experiments

The benchmark results in this post come from my study, **A Quantitative Comparative Analysis of Embedding Techniques for Social Media Campaign Analytics in Retrieval-Augmented Generation Systems**, which used synthetic data modeled on the structure of Flometrics analytics. The OCR examples come from separate collaborative experiments around the screenshot-to-spreadsheet pipeline. Production scale and latency figures refer to the RAG service I built during my internship and are separate from the synthetic benchmark.