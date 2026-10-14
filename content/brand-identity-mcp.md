# Bringing HubSpot Brand Context into AI Tools

During my internship at HubSpot, I worked on Brand Identity and a problem that became more interesting as I moved through the stack: an AI model can write a convincing product announcement while knowing very little about the company it is writing for. Its choices about language, emphasis, and audience depend on the context available when it starts writing.

A company might prefer direct language, describe its products in a particular way, or adjust its tone for different audiences. [HubSpot's public Brand Identity features](https://knowledge.hubspot.com/branding/generate-your-brand-identity-context-with-ai) capture context such as voice, tone, ideal customer profile, products, and competitive information for use in AI-generated content. That gives writing tools a shared reference for decisions that would otherwise depend on whatever the user happens to include in a prompt.

The writing process also extends beyond the application where that context lives. A person might draft an email in an AI assistant and return to HubSpot later to prepare a campaign. [HubSpot's remote Model Context Protocol server](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server) provides a public foundation for connecting compatible AI clients to HubSpot data, with OAuth authentication and access governed by the user's permissions.

My work explored the Brand Identity side of that connection, from helping a model retrieve relevant context to building an interactive content-review prototype. The account below describes those engineering decisions using generalized tool names and illustrative data; the review prototype and its example interfaces describe the work I explored during the internship rather than a catalog of publicly available HubSpot features.

## Getting brand context into the conversation

Model Context Protocol, or MCP, gives an AI client a standard interface for discovering tools and invoking them. In a writing workflow, a tool can retrieve brand guidance before the model starts drafting, allowing that guidance to participate in the same conversation as the user's request.

The interaction begins with an ordinary prompt, such as “Write a launch email for our new analytics feature.” The client exposes the available tool definitions to the model, the model selects a context-retrieval tool, and the result supplies information that can guide the response. The conversation remains in the AI client while the connected service supplies the requested context.

> **[Figure 1 placeholder — Brand context across the MCP boundary]**
>
> A protocol and data-flow visualization showing a writing prompt, tool selection, a context request, and the returned brand guidance inside the AI client's working context.

<!-- VISUAL SPEC: figure-01 / McpContextFlow
Format: responsive inline SVG with a small DOM payload inspector; passive animation on first viewport entry, with Replay.
Static topology: AI client boundary containing Conversation, Tool registry, and Draft; connected service boundary labeled HubSpot / conceptual Brand Identity integration, containing a Context tool and Brand context store. Mark the transport boundary MCP. This is a conceptual overview, not a published deployment topology.
Sequence: prompt enters Conversation; selected tool highlights in registry; a labeled tools/call packet crosses the boundary; context store expands into Voice & tone, Audience, Products, and Messaging; a tool-result packet returns; Draft becomes active only after context arrives.
Representative payload: { "voice": "direct, grounded", "audience": "technical teams", "avoid": ["exaggerated claims"] }. Label Illustrative context throughout; these keys are not an internal or public API schema.
Inspector: request and result tabs show only the synthetic payload and generalized tool label. No endpoints, account identifiers, or credentials.
Fallback/alt: A writing assistant retrieves brand guidance through an MCP tool and uses the returned context when generating a draft.
-->

The first difficulty appeared at the selection step. A tool could be present in the client's registry and still be overlooked when the model decided how to answer. Retrieving context required the model to recognize that an apparently ordinary writing task depended on information held elsewhere.

That made the tool interface part of the writing workflow itself. Its name and description needed to connect the user's intent to the capability the tool provided.

## Designing an API for a model

A traditional API usually has a developer between its documentation and the decision to call it. The developer understands the application, reads the endpoint contract, and chooses where the call belongs. With a model selecting tools, that reasoning takes place against the definitions supplied in the current context.

In the behavior I observed, requests that explicitly mentioned brand voice or brand identity gave the model a clear reason to retrieve the relevant guidance. A request to write a launch email gave it a weaker signal, even though brand context was useful in both cases.

I first made the tool description more explicit about when the context should be loaded. It connected retrieval to content-generation tasks and explained why brand guidance mattered even when the user had omitted the phrase “brand voice.” Supporting instructions reinforced that relationship across the writing workflow.

The next iteration moved that intent into the tool name. A data-oriented label such as `retrieve_brand_identity` describes the information returned by a call. A workflow-oriented label such as `get_brand_context_before_writing` also gives the model a cue about when to use it. These are generalized examples of the distinction I was working toward.

> **[Figure 2 placeholder — Inspecting the tool-selection trace]**
>
> The same launch-email prompt runs through three illustrative interfaces: a data-oriented tool, a stronger description, and a workflow-oriented tool. Each state exposes the tool definition and the resulting selection path.

<!-- VISUAL SPEC: figure-02 / ToolSelectionDemo
Format: interactive DOM/SVG trace; controls 1 / 2 / 3, Play, Pause, and Reset.
Layout: fixed user prompt above a tool-definition panel, a selected-action lane, a context-result panel, and a miniature draft. Show actual representative name/description fields rather than abstract boxes.
State 1: retrieve_brand_identity with a data-only description; illustrate a possible direct-to-generation path.
State 2: same generalized name with description Retrieve brand guidance before creating or rewriting company content; context retrieval appears as the relevant action. Briefly show two overlapping context capabilities consolidating into one.
State 3: get_brand_context_before_writing with workflow description; tool call, context result, then generation. Keep the prompt identical across states.
Always label Scripted illustration. The trace demonstrates the design rationale; it is not a live model run, probability estimate, benchmark, or guarantee of selection behavior.
Optional inspector: click the definition to compare name and description changes. A compatibility annotation distinguishes discoverable tools from a retained legacy callable entry point, using generalized labels only.
Fallback/alt: Three tool definitions progressively make the connection between writing and brand-context retrieval more explicit.
-->

I also simplified the externally visible tool surface. Overlapping ways to retrieve similar guidance created another choice for the model, so I reduced that overlap while keeping existing callers supported. When the clearer interface replaced the previous name in discovery, the previous entry point remained callable for compatibility.

The distinction between discoverability and compatibility was useful here. New clients could see the interface we wanted them to use, while existing integrations retained a working path. Together, the naming, description, and tool-surface changes made the relationship between a writing request and its required context more explicit.

This work changed how I approached model-facing APIs. A tool definition provides a contract for execution and a cue for selection, so its wording deserves the same attention as the implementation behind it.

## Generation was only one side of the experience

Once brand context could participate in drafting, I started thinking about what a user needed when reviewing an existing document. A rewritten paragraph provides a candidate result, but the review also needs to explain how that result relates to the original.

A user may want to inspect the previous wording, understand the brand guidance behind a revision, reject a particular change, or ask for another pass on one sentence. Those decisions become harder to manage when the revised document and every explanation occupy a single stream of assistant text.

I began building an interactive Brand Voice Review prototype around that workflow. The conversation initiated the review, while an embedded interface represented the document and its changes. Selecting a revision could reveal the original wording and its explanation, with feedback actions attached to the change being inspected.

That interface required the backend to return a structured relationship between the original document, the revised document, and the explanations. A revised string alone left too much work for the display layer to reconstruct.

## Separating the rewrite from the diff

One possible implementation would ask a model to perform the entire review in one call: rewrite the document, identify every edit, classify the edits, preserve formatting, explain each change, produce a summary and score, and serialize the result for the frontend.

Those tasks have different requirements. Rewriting according to brand guidance involves interpretation, while comparing two known strings requires exact accounting of their contents. Asking the model to handle both makes the document contract depend on the same probabilistic process that produces the language choices.

I separated the review into three stages. The first model call rewrote the content using brand guidance. Application code compared the original and revised strings and produced an ordered set of segments. A second model call received the changed sections and the relevant guidance to generate explanations, an overall summary, and an alignment score.

> **[Figure 3 placeholder — An inspectable rewrite, diff, and explanation pipeline]**
>
> A miniature document moves through the review system, exposing the original and revised strings, the deterministic segment representation, and the optional explanations attached to changes.

<!-- VISUAL SPEC: figure-03 / ReviewPipeline
Format: main interactive architecture figure with inline SVG connectors, real text artifacts, and a DOM inspector. Controls: Play, Pause, stages 1–4, Reset.
Boundaries: connected review service containing Brand context, Rewrite model, Diff engine, Explanation model, and Response assembly; AI client containing an embedded review interface. Group by conceptual responsibility, without implying actual service deployment boundaries.
Artifacts: original Our revolutionary analytics platform transforms reporting. / revised Our analytics workspace helps teams understand their data. Use synthetic voice guidance favoring concrete product language.
Stages: (1) context + original enter rewrite; (2) original and revised both enter deterministic diff; (3) changed segments + brand guidance enter explanation stage; (4) structured review reaches client UI. Preserve a visible direct path from the segment result to response assembly because explanations are optional.
Show packet labels original + revised, changed segments, and optional enrichment; make each moving packet represent a concrete artifact.
Inspector: clicking Rewrite shows inputs and candidate text; Diff shows ordered segments and exact reconstruction property; Explanations shows per-change reasoning, summary, and score as optional outputs; Response shows revised text and segments. All payloads generalized and illustrative.
Motif: model stages muted blue; deterministic code sage; user interaction amber; failure rose; boundaries gray. Add text labels so color carries no exclusive meaning.
Fallback/alt: A model rewrites the document, deterministic code computes exact changes, and a second model adds optional explanations before the review is rendered.
-->

This division gave the model responsibility for language decisions and gave application code responsibility for the exact relationship between two documents. It also made the inputs to explanation generation more focused: the second call could reason about known changes instead of discovering them again.

The alignment score belonged to the same interpretive layer as the explanations. It summarized a model's assessment of the draft against the supplied guidance, so the interface needed to present it as a review aid rather than a measured probability of correctness.

## Giving the frontend a diff it could trust

The review represented the document with four segment types. Unchanged segments carried text through directly, added segments introduced new text, removed segments retained text that had been deleted, and modified segments paired original wording with its replacement.

The contract behind those categories was more important than the labels: rendering the segments in order had to reconstruct the revised content exactly, including whitespace and line breaks. That gave the frontend a reliable document representation while retaining enough information for inspection.

The following simplified example shows the relationship. The field names illustrate the contract rather than reproducing an implementation schema.

```json
[
  { "type": "UNCHANGED", "text": "Hello everyone.\n\n" },
  {
    "type": "MODIFIED",
    "original": "Our revolutionary platform",
    "revised": "Our analytics workspace"
  },
  { "type": "UNCHANGED", "text": " helps teams.\n" }
]
```

The unchanged values and the modified segment's revised value combine into the exact revised document. Added text contributes its new value, while removed text contributes an empty string to that reconstruction. Removed text remains available separately for the review interface.

```text
renderRevised(segments) === revisedContent
```

> **[Figure 4 placeholder — The segment debugger]**
>
> Three synchronized panes expose the original document, its ordered segments, and the reconstructed revision. A whitespace toggle makes paragraph boundaries and line endings visible.

<!-- VISUAL SPEC: figure-04 / SegmentDebugger
Format: compact interactive three-pane diagram, lighter than Figure 3. Controls: Text / Whitespace and Reconstruct.
Data: use the exact JSON fixture printed above. Original: Hello everyone.\n\nOur revolutionary platform helps teams.\n. Revised: Hello everyone.\n\nOur analytics workspace helps teams.\n.
Segment inspector: index, type, old value, new value, and zero-based half-open original/revised ranges. Label offsets as JavaScript UTF-16 code units, not bytes. Fixture ranges: unchanged original/revised [0,17); modified original [17,43), revised [17,40); final unchanged original [43,57), revised [40,54).
Whitespace mode: spaces become visible dots and newline characters become labeled markers, preserving the underlying fixture exactly. Include a secondary CRLF example with distinct CR and LF markers.
Reconstruct: combine the contributing revised values in order, then display reconstructed === revisedContent / true. Removed segments are shown as omitted from revised output in a selectable secondary fixture; added segments contribute their added values.
Keyboard selection links each segment to the corresponding original/revised ranges. Keep markers out of Copy text.
Fallback/alt: Ordered segments reconstruct the revised string exactly, including its blank line and trailing newline.
-->

Real documents contain headings, blank paragraphs, leading or trailing whitespace, and different line-ending conventions. A change to one sentence can sit beside any of those structures, and a segment renderer must preserve their relationship to the text around them. Consecutive edits and whitespace-only sections make that requirement especially visible.

I added tests for reconstruction across multi-paragraph content, leading and trailing whitespace, Windows line endings, whitespace-only input, and combinations of segment types. Those checks placed the exactness requirement in the backend contract, giving the frontend a representation it could render directly.

The diff established what changed, while the explanation stage interpreted why the change might fit the brand. Keeping those responsibilities separate made both easier to inspect.

## Treating explanations as enrichment

The staged pipeline also exposed a distinction between the result required for a review and the information that enriches it. The rewrite provides the candidate document, and the diff provides a trustworthy representation of its changes. Explanations add useful interpretation after those two pieces exist.

If explanation generation failed after the rewrite and diff succeeded, the system could still return the revised content and structured segments. The summary, explanations, and score could remain absent from that response, preserving the completed work for the user to inspect.

> **[Figure 5 placeholder — Required stages and optional enrichment]**
>
> A dependency graph shows how an explanation-stage failure produces a usable review with structured changes, while a failure in a required stage prevents completion of that review.

<!-- VISUAL SPEC: figure-05 / ReviewDependencies
Format: compact dependency DAG; one restrained scroll-triggered sequence and Replay. Optional Full review / Explanation unavailable toggle.
Nodes: Rewrite → Deterministic diff → Review result; optional branch Diff + Brand context → Explanations → enriched Review result. Required-stage failures lead to Review could not complete. An explanation failure leads to Revised text + segments / explanations unavailable.
Animate the successful required path first; mark explanation stage unavailable while completed upstream artifacts remain visible. Never show a fabricated score or explanation in the degraded result.
Secondary labels: required transformation, required document contract, optional enrichment. Use a dashed edge for enrichment and a text badge for unavailable state.
Fallback/alt: Successful rewriting and diffing still produce a usable review when optional explanation generation fails.
-->

This behavior followed the dependency structure of the workflow. An explanation failure affected the interpretation layer, while a rewrite failure left the review without a revised document. The response could therefore reflect the value that had actually been produced, and the interface could make missing enrichment visible without discarding a valid diff.

## Turning an MCP response into an application

Once the backend returned structured segments, the frontend could represent the review as an editable document with inspectable changes. Unchanged text remained visually quiet, modifications became selectable, and removed text could be inspected separately from the revised version.

I built the review interface in React. Selecting a modification opened a panel with the original wording and the associated explanation, while actions such as rejecting a change or requesting another revision operated on the selected part of the document. Copying the revised text needed to produce a clean document that excluded removed content and review annotations.

> **[Figure 6 placeholder — Interactive Brand Voice Review]**
>
> A working miniature review interface lets the reader inspect changes, reject a revision, copy the current document, and request a targeted follow-up. A compact trace shows the corresponding changes in review state.

<!-- VISUAL SPEC: figure-06 / BrandVoiceReviewDemo
Format: centerpiece React mini-application, nearly full article width; deterministic local fixture/state machine. This is a functional demo, not a video. Label Illustrative prototype / simulated review; no live HubSpot or model calls.
Initial document: a synthetic product announcement with at least four independently identifiable text regions, including a heading, two modified sentences, unchanged text, and a removed sentence.
Review action: progress trace context loaded → rewrite complete → segments generated → explanations attached → response rendered. Timings are presentation timing, not latency measurements.
UI: revised document, selectable modified/removed regions, Original and Why this changed inspector, guideline label, Reject change, Request changes, Show removed text, Copy revised text, and Reset. Use stable synthetic region IDs; normalize Markdown structure without altering the reconstructed text.
Score: optional 84 / 100 example with visible Model-estimated alignment / illustrative label; hide it in explanation-unavailable mode. Never present it as measured accuracy.
Reject: restore the selected region's original value and update copied current text. Keep review annotations distinct from the text itself.
Targeted feedback (shared with the next article section): select a changed region, choose Make this more technical / Keep more of the original / Make it more concise, then apply a predetermined revision only to that region. Show other approved regions as preserved. Trace: preserved regions → selected region revising → updated review. Keep the same demo state when linked from the targeted-feedback section; no duplicate large figure.
Acceptance: keyboard-operable selections and actions; visible focus; inspect heading and multiline fixtures; removed text excluded from copy; feedback updates only selected synthetic region; Reset returns to original fixture; unavailable explanations have a clear empty state.
Fallback/alt: A revised announcement with an original-versus-revised comparison, an explanation, and actions on one selected change; targeted feedback preserves the other approved regions.
-->

Rendering real documents revealed details that were easy to overlook in a single-paragraph example. Markdown headings needed to remain block elements, paragraph spacing had to survive segmentation, and a multiline change needed to stay associated with the correct selection target. The original and revised documents could also have different paragraph structures, so matching them by paragraph index produced fragile assumptions.

I added normalization in the React layer to handle those variations while keeping the underlying document contract intact. The interface could organize the review for display and still derive clean copied text from the actual revised values.

At that point, the tool response had become application state. The conversation provided a natural place to ask for a review, and the embedded interface provided controls suited to the decisions the user needed to make afterward.

## Revising one change while preserving the others

Interactive review introduces a continuity problem as soon as a user starts approving individual changes. If a review contains eight revisions and seven have been accepted, the next request should focus on the remaining revision while carrying those earlier decisions forward.

Running the original rewrite over the entire document gives the model scope to reconsider all eight changes. From the user's perspective, that broadens a local request into another document-wide review and makes their previous decisions harder to preserve.

I added a targeted feedback flow that carried the requested change alongside the content to preserve. The backend reused the review path while constraining the next pass around the part of the document that still needed work. Accepted content became part of the next request's constraints, giving the workflow a clearer relationship to the user's accumulated decisions.

> **[Figure 6 continuation — Request changes on one region]**
>
> In the review demo above, choose “Make this more technical” for one revision. The selected region moves through another simulated pass while the other approved regions remain fixed.

<!-- VISUAL ANCHOR: figure-06-targeted-feedback
Link this continuation to Figure 6's existing Request changes control and shared state. On entry, offer a Focus targeted feedback button that scrolls to or expands that part of the same demo. Use a compact document-state strip here only if needed: preserved / preserved / revising / preserved. This continuation does not count as an eighth figure.
The demo's deterministic preservation demonstrates intended interaction behavior; it must not be described as evidence that a model inherently guarantees preservation. The prose describes constraints supplied to the review flow, without inventing a validation mechanism.
-->

This made the interaction closer to document editing, where each pass builds on decisions already made. It also clarified the state the application needed to carry: the current revision, the selected region, the user's feedback, and the material that should remain preserved.

## Tool discovery has its own semantics

Another integration issue appeared before the model invoked a writing tool. Discovery tells a client which capabilities are available, while execution attempts to use one of those capabilities. A permission condition can have a different meaning in each operation.

In the path I investigated, a capability-specific permission check could turn discovery into an authorization error. For an otherwise valid connection whose user lacked access to that capability, the useful result was a successful discovery response with an empty available-tool set.

I traced that behavior through the configuration path and adjusted the handling so discovery could express capability availability, while tool execution continued to enforce authorization. The client could then distinguish a valid connection with no relevant tools from a connection or request that had actually failed.

> **[Figure 7 placeholder — Discovery and execution as a protocol trace]**
>
> A compact sequence diagram compares a capability check that aborts discovery with one that returns an empty tool list for a valid connection. A separate invocation lane shows execution-time authorization.

<!-- VISUAL SPEC: figure-07 / DiscoverySemantics
Format: compact SVG sequence diagram with Client, Capability configuration, and Tool execution lanes; Before / After control, optional short packet animation descending through the lanes. Default static state is fully legible.
Precondition banner: Valid authenticated connection; capability unavailable to this user.
Before: tools/list → capability check → capability-specific discovery error. Keep the error generic; do not invent a 401 HTTP status or imply the user is unauthenticated.
After: tools/list → availability check → { "tools": [] } returned successfully. For permitted access, optional alternate branch returns representative generalized tool definitions.
Separate trace: tools/call → execution authorization → allowed result or appropriate denied result. Empty discovery is not permission to execute an unavailable tool.
Scope annotation: diagram shows a capability-specific availability decision, not a rule that all authentication or discovery errors should become empty lists. Retain genuine authentication and request failures as failures.
All method names are representative MCP operations; service boundaries and payload snippets are illustrative.
Fallback/alt: A valid connection can successfully discover zero available tools; executing a tool still requires authorization.
-->

That distinction gave the client more useful information for its next decision. An empty tool list describes the capabilities of the current connection, while an error describes a failure that may require recovery. Both outcomes belong in the protocol, and each should retain its meaning.

The debugging work reinforced a pattern that ran through the project: the experience depends on the behavior surrounding the model call. Tool discovery, document contracts, partial failures, and feedback state all shape what a user can reliably do with the generated result.

## Deciding what belongs in the model

The project brought together several forms of reasoning with different requirements. Brand-aware rewriting involved interpretation, tool selection depended on a clear description of intent, and explanations connected language choices back to guidance. Exact document reconstruction belonged in deterministic code, while review decisions belonged with the user.

Making those responsibilities explicit gave the workflow a structure I could test and inspect. The model produced candidate language, the diff established its relationship to the original, and the interface let the user decide which changes to keep. Optional explanations could improve the review while the underlying document remained useful on its own.

I came away with a more concrete way to think about building around language models: define the contracts that the surrounding software can enforce, give the model the context needed for its interpretive work, and preserve the user's decisions as the workflow continues. For this project, that meant carrying brand guidance into the conversation and carrying a trustworthy document through every subsequent stage of review.

<!-- SHARED VISUAL IMPLEMENTATION NOTES
These are production specifications for the placeholders, not article body copy.

Inventory: seven figures total. Targeted feedback is part of Figure 6. Allocate most effort to Figure 3's inspectable pipeline and Figure 6's functional mini-app; keep Figures 4, 5, and 7 compact.

Visual language: use a restrained technical-document aesthetic with nested boundaries, SVG connectors, monospace payloads, subtle grid alignment, and visible intermediate artifacts. Model work = muted blue; deterministic software = sage; user actions = warm amber; unavailable/error states = muted rose; structure = neutral gray. Use text/icon distinctions as well as color. Small metadata stays secondary and readable, with accessible contrast. Every moving object should stand for a request, result, segment, or state transition.

Behavior: passive figures play once on viewport entry and settle into a readable final state; provide Replay where useful. Interactive figures expose manual steps and Pause. Honor prefers-reduced-motion with static states and direct step controls. Pause work when hidden; clean up observers, listeners, timers, and animation frames on unmount. Avoid decorative loops. Animation durations describe presentation choreography and must never be presented as measured processing latency.

Accessibility/responsiveness: keyboard-operable controls and inspectors, visible focus, concise alt descriptions, polite announcements of user-triggered state changes, legible mobile stacking, no essential hover-only content, and no motion or color as the sole carrier of meaning. Keep a static fallback and the caption for each figure. Copy actions use underlying text, excluding whitespace display markers and UI annotations.

Data: all examples use synthetic content. Tool labels, field names, payloads, traces, boundaries, scores, and region identifiers are illustrative. Preserve the distinction between documented public product framing and the internship review prototype; avoid internal package names, class names, repositories, service names, unreleased product claims, and unsupported performance metrics.

Editorial inspiration: borrow the qualities discussed in the prior conversation—embedded explanation, concrete technical artifacts, restrained interaction, and coherent visual rhythm—while developing original layouts, prose, and fixtures. Do not reuse another author's text, assets, or exact presentation.
-->
