# Security status

The MVP accepts public reads only; no HTTP endpoint permits publication or
administrative changes. Authenticated identity is verified by Clerk on the
server. Source fetches are allowlisted and bounded. The fixed LangChain workflow uses explicitly configured local or Bedrock
inference with no tools, filesystem backend or delegation.

## Dependency review: 2 November 2026

`npm audit` currently reports 28 dependency entries: four high, 23 moderate and
one low. Direct advisory-bearing packages include node-forge, follow-redirects,
Zod, glob, minimatch and deepmerge; additional entries are dependency-path effects.
The audit reports fixes available. The architecture and contributor-guidance update adds no packages and does not
apply dependency upgrades or forced overrides.

Examples of the reported advisories:

- https://github.com/advisories/GHSA-86w9-cpqp-85rv: node-forge RSA verification.
- https://github.com/advisories/GHSA-mrhx-c7xc-m3w5: oversized Zod collections.
- https://github.com/advisories/GHSA-mrwp-f3q8-3g9p: follow-redirects.
- https://github.com/advisories/GHSA-g3hv-75wg-m249: minimatch.
- https://github.com/advisories/GHSA-gcqx-w48m-w2h4: deepmerge prototype poisoning.

The application directly uses patched Zod, while a nested version remains flagged.
Recheck the full audit before public release or signed updates; passing tests do
not resolve advisories. Counts reflect this check, not an assurance about future
advisory disclosures or other contributors' dependency changes.

## Verification limits

Clerk sign-in needs real app keys and redirect registration. LangChain inference needs a running compatible local model or valid Bedrock credentials. Automated tests verify their
boundary behavior using controlled doubles; they do not establish the quality
of an unconfigured external service. Native JavaScript exports do not replace
physical-device testing or signed store builds.
