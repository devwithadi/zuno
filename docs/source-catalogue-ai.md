# AI source catalogue

Checked **31 October 2026** using direct HTTPS GET requests with redirects disabled,
the Zuno identifying user-agent, and XML parsing. All 20 enabled feed URLs returned
HTTP 200, contained entries, and decoded to less than the existing 1,000,000-byte
fetch cap. Counts describe the whole fetched feed; Zuno selects at most ten entries.
Availability is a point-in-time observation, not a promise of uptime or reuse rights.

| Source and public feed | Feed entries / bytes | Latest observed item | Evidence and attribution boundary |
| --- | ---: | --- | --- |
| [Google AI](https://blog.google/innovation-and-ai/technology/ai/rss/) | 20 / 30,700 | 26 Oct 2026 | Short feed descriptions; ordinary public `blog.google` articles may provide context. Attribute Google's product and research claims. |
| [OpenAI News](https://openai.com/news/rss.xml) | 1,341 / 816,763 | 30 Oct 2026 | Public feed descriptions only. The sampled linked article returned 403; no workaround or claim to read it. Thin items are withheld. |
| [Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/rss/) | 20 / 30,743 | 27 Oct 2026 | Canonical Google feed with public `blog.google` articles. First-party model announcements require attribution. |
| [Hugging Face Blog](https://huggingface.co/blog/feed.xml) | 894 / 264,083 | 30 Oct 2026 | Some feed items have little text; public `huggingface.co` articles may supply it. Distinguish staff, partner and community authors and their claims. |
| [AWS Machine Learning](https://aws.amazon.com/blogs/machine-learning/feed/) | 20 / 575,352 | 30 Oct 2026 | Substantial feed bodies. Vendor tutorials and case studies are not independent performance verification. |
| [NVIDIA AI](https://blogs.nvidia.com/blog/category/deep-learning/feed/) | 18 / 222,573 | 15 Oct 2026 | Substantial feed bodies. Preserve benchmark setup, availability and vendor attribution. |
| [Google Research](https://research.google/blog/rss/) | 100 / 78,553 | 27 Oct 2026 | Short descriptions; sampled public research article was readable. Announced research is not proof of production readiness. |
| [Microsoft Research](https://www.microsoft.com/en-us/research/feed/) | 10 / 315,339 | 30 Oct 2026 | Full feed text supports research explanations; preserve study scope and Microsoft attribution. |
| [MIT News AI](https://news.mit.edu/rss/topic/artificial-intelligence2) | 50 / 530,605 | 30 Oct 2026 | Full institutional reporting. Distinguish papers, awards and prototypes from deployed capabilities. |
| [The Gradient](https://thegradient.pub/rss/) | 15 / 591,428 | 18 Feb 2026 | Long-form analysis and research explainers; identify author arguments as analysis. Infrequent publication is not breaking news. |
| [Import AI](https://importai.substack.com/feed) | 20 / 447,321 | 26 Oct 2026 | Newsletter text supplied in the public feed. Preserve secondary-reporting attribution and quoted research qualifications. |
| [Interconnects](https://www.interconnects.ai/feed) | 20 / 546,893 | 30 Oct 2026 | Expert analysis in public feed text. Predictions and opinions stay attributed; paid-only text is not fetched. |
| [Lilian Weng](https://lilianweng.github.io/index.xml) | 53 / 79,640 | 4 Jul 2026 | Technical research explanations; preserve dates and distinguish surveyed papers from the author's interpretation. Infrequent publication. |
| [Simon Willison](https://simonwillison.net/atom/everything/) | 30 / 139,575 | 30 Oct 2026 | Atom content includes notes, links and experiments. A linked item is not the linked article's full evidence. |
| [One Useful Thing](https://www.oneusefulthing.org/feed) | 20 / 922,268 | 20 Oct 2026 | Public newsletter text on practical AI use and research. Personal observations and predictions remain attributed. Close to the size cap; fail safely if the feed grows. |
| [fast.ai](https://www.fast.ai/index.xml) | 20 / 12,934 | 17 Aug 2026 | Short descriptions; ordinary public `www.fast.ai` articles may provide context. Expert argument and opinion are not consensus facts. |
| [CMU Machine Learning](https://blog.ml.cmu.edu/feed/) | 1 / 46,499 | 10 Aug 2026 | Long research text in the feed. Infrequent academic publication; preserve experimental conditions and limitations. |
| [Mistral AI](https://mistral.ai/news/rss) | 93 / 27,293 | 29 Oct 2026 | Short descriptions; sampled public `mistral.ai` article was readable. Attribute model-performance and security claims. |
| [PyTorch Blog](https://pytorch.org/blog/feed/) | 10 / 339,700 | 28 Oct 2026 | Full release and engineering text in the feed. Explain practical changes without inventing end-user benefits. |
| [Vicki Boykis](https://vickiboykis.com/index.xml) | 20 / 349,997 | 29 Oct 2026 | Engineering explanations and professional observations. Keep author attribution; some entries are short links rather than complete reports. |

## Article access and coverage

`articleHosts` is deliberately explicit and limited to ordinary public article
hosts for sources whose feed text is sparse: Google AI/DeepMind, Hugging Face,
Google Research, fast.ai and Mistral. Redirects and access restrictions still
fail closed. The sampled pages on these hosts returned HTTP 200; page availability
does not establish any right to copy an article or image wholesale. Zuno keeps
links and creates evidence-bound, cited briefs rather than copying full articles.

Other sources above usually carry substantial feed text; only that supplied text
is used. A public newsletter feed may contain a preview instead of a whole post:
never retrieve subscriber-only content or imply that an unseen post was read.
The quality gate may withhold short or unsupported items even when their feed is
healthy. Twenty configured sources therefore does not promise twenty publishable
cards per cycle, equal freshness, or independent confirmation of every claim.

## Deliberately excluded during this check

- The old `deepmind.google/blog/rss.xml` feed worked, but sampled article links
  redirected. The catalogue uses the canonical Google DeepMind feed instead.
- The Microsoft AI feed returned 410. IBM Research and AllenAI candidate feeds
  returned 404; they were not replaced with guessed or unofficial mirrors.
- Stanford AI Lab could not be fetched in this environment. BAIR's feed worked,
  but sampled story links used HTTP and do not satisfy the public HTTPS contract.
- arXiv `cs.AI` decoded to 1,340,636 bytes; Latent Space to 1,267,230 bytes;
  Normal Technology to 1,460,971 bytes; Ahead of AI to 2,586,619 bytes. All exceed
  the current fetch cap and are not silently enabled. arXiv research would also
  need explicit preprint/non-peer-reviewed attribution.
- TensorFlow's feed worked but its newest item was August 2025. Chip Huyen's
  sampled feed's newest item was January 2025; more current sources were preferred.
- Databricks' feed worked, but its short description plus the current article
  extractor's empty sampled result would provide weak evidence. PyTorch's full
  feed text was preferred.

Public feeds are discovery and evidence inputs, not authority to republish paid
content, sidestep a 403, execute source instructions or trust vendor marketing
without qualification. Source text remains untrusted data throughout the workflow.
