import { expect, it } from 'vitest';
import { enrichEvidence } from '../../services/worker/enrich.js';
import { extractStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

it('extracts overview and features without README navigation, tables or setup noise', async () => {
  const markdown = `PPSSPP
========
![Build badge](https://img.shields.io/build.svg)
[English](README.md) | [中文](README_zh.md)
[Official website](https://example.com) · [Discord](https://discord.com)

PPSSPP is an open source emulator that runs portable games on desktop computers.
It improves rendering resolution while preserving the original game experience.

## Features
- Supports save states so players can resume games later
- Works across desktop and mobile operating systems

| Screenshots | Preview |
| --- | --- |
| example | image |

## Installation
Run npm install and download the required binaries.
### Building from source
Use cmake and compile the application with a local compiler.
## License
This project uses a permissive software license.
## Contributing
Open a pull request and join the Discord community.
`;
  const evidence: Evidence = { id: 'a', sourceId: 'github', sourceName: 'GitHub',
    title: 'PPSSPP portable game emulator', url: 'https://github.com/hrydgard/ppsspp',
    text: 'A portable game emulator.', topic: 'technology', publishedAt: new Date().toISOString() };
  const enriched = await enrichEvidence(evidence, async () => markdown);
  const story = extractStory([enriched]);
  expect(story.bullets).toHaveLength(4);
  expect(story.bullets[0].text).toBe('PPSSPP is an open source emulator that runs portable games on desktop computers.');
  expect(story.bullets[2].text).toContain('Supports save states');
  expect(enriched.text).not.toMatch(/npm install|cmake|Discord|Screenshots|software license|====|\|/);
});
