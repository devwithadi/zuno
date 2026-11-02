# Content creation and humanizing

The worker uses a fixed editorial workflow. Application code owns collection,
queueing, validation and database writes. LangChain calls the configured chat model
through ordered writing, editing and verification stages; there are no autonomous
agents, host tools or delegation.

## Configure rewriting

Select `EDITOR_MODE=langchain` and an explicit `EDITOR_PROVIDER` in the root
`.env`. The default example remains free extractive mode.

### Amazon Bedrock

The Bedrock setup reuses Kairo's provider and region, with Nova Pro selected
for Zuno's writing, humanizing and verification stages:

```dotenv
EDITOR_MODE=langchain
EDITOR_PROVIDER=bedrock
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0
AWS_BEARER_TOKEN_BEDROCK=your-private-bedrock-token
```

LangChain's `ChatBedrockConverse` uses native Converse at the fixed AWS runtime
host for the configured region. `BEDROCK_API_KEY` is accepted as a credential
alias; credentials are required explicitly and never copied into versioned files
or the mobile app. This is billable AWS inference. Only selected public evidence
and editorial prompts go to the model; database and authentication credentials
are never included. No tracing is configured by Zuno.

### Local model

For a local OpenAI-compatible chat model server:

```dotenv
EDITOR_MODE=langchain
EDITOR_PROVIDER=local
LOCAL_MODEL_URL=http://127.0.0.1:11434/v1
LOCAL_MODEL_NAME=your-local-model
```

Local endpoints must be localhost. No paid provider is selected implicitly.
Run `npm run worker:once` or `npm run worker` for five-minute polling.
Each call has a 20-second request timeout, a bounded 30-second abort signal and no transport retries,
and bounded output. Bedrock's SDK also allows only one attempt. Application-level
429 handling retries at most twice after 10/20 seconds within the same card deadline;
Bedrock starts are spaced by three seconds across the editor's concurrent cards.
Each run checks
all eligible sources and attempts up to 30 edited briefs with three groups in
parallel. Evidence is leased only for the current three-entry wave, keeping its
model work below the ten-minute lease; completed source fetches release their
leases before editorial work. Kairo's longer request timeout is not copied. A complete card has a 90-second
budget, including at most one editorial revision. Thin or repetitive drafts can be
revised once using measured quality feedback. A rejected factual draft can instead
be revised once and must pass a new evidence review; an unchanged rejected draft
cannot be retried for approval. If the revision remains inadequate, it is withheld.
Model failure, malformed JSON or rejection returns the item to the retry queue;
it does not silently publish an unreviewed rewrite. Text-only Converse response
blocks and a single enclosing JSON code fence are normalized before JSON/schema
validation; tool content, surrounding prose and malformed JSON are rejected.
Older `EDITOR_MODE=deepagents` configuration must change to `langchain`.
Existing stored cards with that legacy mode remain readable.

## Fixed writing workflow

1. **Writer:** Draft an interesting, factual headline and five contextual
   bullets: what happened, context, and practical significance when supported.
2. **Humanizer:** Simplify the wording for a curious Gen Z reader. Repair missing
   context, cut filler and repetition, and keep a natural conversational voice.
3. **Verifier:** Review the headline and every bullet against the supplied
   evidence, returning approval and numbered source-excerpt references for each
   claim. Application code resolves these references to exact original quotes.
4. **Publishing boundary:** Validate the card schema, source identity, citations,
   quote coverage and numeric/date tokens before saving. Rewritten headlines need
   their own supported-claim review. Thin cards are held rather than padded.

The writer and humanizer return only the headline and bullets, validated against
their editable-field schema. They do not generate application metadata. Application code preserves
identity, links, image, topic and timestamps and recalculates reading time.
Headlines name the real change rather than hiding it behind clickbait. Bullets
use familiar words and explain unfamiliar terms only from supplied evidence.
Reader relevance must be supported; a sales claim remains attributed to its source.
No forced slang, fear, FOMO, invented benefits, advice or exaggerated certainty.
Edited briefs target 200–260 words. The publishing gate requires five
bullets, 180 total whitespace-separated words, and 28 words in each bullet.
Each point may contain up to 650 characters, allowing short explanatory paragraphs.
This is a depth floor, not a semantic-quality proof. The first three points must
explain the story because the feed previews those; remaining detail opens in the
full brief. Thin evidence is withheld rather than padded. Headlines use a concrete
change, distinctive fact or supported limitation instead of generic product labels.
All runtime editorial instructions live in `prompts/`.

## Skill references

Four reviewed MIT skill references are vendored in [`assets/skills/`](../assets/skills/README.md):
marketing-psychology, copywriting, copy-editing and humanizer. Their pinned commits,
licenses and checksums are recorded there. Zuno adapts clarity, reader relevance,
specific hooks and natural rhythm into its prompts. It does not load full upstream
marketing instructions at runtime or run downloaded scripts. News accuracy takes
precedence over persuasion tactics and style rules.

## No-model source excerpts

Unset `EDITOR_MODE` or set it to `extractive` to retain the free, no-model mode.
It selects up to five source sentences, keeps the source headline and original
links, and labels cards **Source excerpt**. It cannot rewrite awkward source prose.
Public article bodies and READMEs provide fuller evidence; headline-only HN
entries are excluded. Cards require at least three bullets totaling 220 characters.
Source covers retain attribution; absent images show an honest notice.

## Validation limits and existing content

Model review is fallible: exact quotes and valid structure do not prove that a
paraphrase follows from evidence. Evaluate the configured model on negation,
uncertainty, units, allegations and financial claims before public release.
Automated workflow tests use controlled model responses, not a quality benchmark.

Changes apply when the worker processes eligible evidence. Existing excerpt
cards can upgrade when their evidence is queued again; this is not a bulk rewrite
of the database. The `enrich` command remains an extractive evidence refresh.
Evidence is retained for replay. A video requires a legitimate transcript.

LangChain's direct chat-model interface:
https://docs.langchain.com/oss/javascript/integrations/chat/openai
https://docs.langchain.com/oss/javascript/integrations/chat/bedrock_converse
