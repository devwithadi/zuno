# Zuno MVP

## Problem

Useful AI, technology, business and market updates are spread across many sites.
Readers want the important points quickly, with a way to check the original.

## Product promise

Open the app and scroll immediately. Each card is readable, concise, attributed
and easy to understand. Accuracy takes priority over wit or speed. The same
product runs on Android, iOS and the web, and its source is available under MIT.

## First-release scope

- Guest reading without an account; optional Clerk sign-in.
- Continuous scrolling, topic filters, refresh and stable pagination.
- Public, free, no-key content sources only.
- A scheduled worker that polls every five minutes, subject to source limits.
- Deduplication before editing, durable evidence, bounded retries and safe recovery.
- Clear source pointers, timestamps, reading time and original-source links.
- Owned topic illustrations when a permitted publisher image is unavailable.
- MongoDB persistence and explicit temporary-memory mode for tests or demos.

## Content modes

The usable default is a clearly labeled source excerpt. It works without a model
account and never claims to summarize unseen articles. A configured local Deep
Agents workflow creates plain-language pointers through draft, humanize and
verify stages. Every rewritten point needs an approved claim review, exact
supporting evidence quotes and preserved numeric/date facts.

The configured model's writing and verification quality still needs evaluation.
Five-hour-to-five-minute video compression needs additional evidence ingestion
and a legitimate transcript. Long-video support is a future product goal.

## Engineering acceptance

- Every authored code file is at most 100 physical lines; no minification workaround.
- Editorial prompts live in a separate, versioned `prompts/` folder.
- Module boundaries separate the client, API, worker, contracts and persistence.
- No source credentials, paid feeds or access-control bypasses are required.
- Failed sources do not block healthy sources or remove existing cards.
- Retried work cannot create duplicate published cards.
- Unsupported claims, bad citations and invalid model output do not publish.
- Tests cover storage, requests, retries, guest reading and topic pagination.
- Backend coverage meets an 80% floor; CI enforces types and file length.
- Clerk keys stay outside source control and server secrets stay outside the client.

## Validation before public launch

Run physical-device and authenticated sign-in checks, evaluate a local model,
review source reuse permissions, and resolve or explicitly assess upstream Expo
tooling advisories. Public launch and store submission require separate work.

## Later

Personalized recommendations, saved stories, notifications, live stock quotes,
portfolios, comments and user submissions are outside this MVP.
