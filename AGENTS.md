# Writing articles

Read STYLE.md before drafting or editing any article — it defines the voice (including the "Sounding like a person" rules and its pre-submit checklist), structure, metadata, and which illustration component fits which job. The checklist below is the mechanical part every new article must complete.

## Every new article needs a hero image

A freely licensed image that fits the essay's subject or mood, wired into the article's metadata:

1. Search Wikimedia Commons:
   `curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=<TERMS>&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1600"`
2. Pick a landscape JPEG/PNG photograph or painting (no maps, logos, screenshots, or text-heavy scans) whose `extmetadata.LicenseShortName.value` is Public domain, CC0, CC BY, or CC BY-SA. Never NC, ND, or fair use. NEVER generate an SVG (or any artwork) as the hero — every generated hero shipped so far has been replaced with a found photograph, and `og:image` previews cannot render SVG. If the first search finds nothing fitting, search again with different terms; a real photograph that fits the essay's mood always exists.
3. Download `imageinfo[0].thumburl` (ask for 1600px; the API usually serves a 1920px rendition — use whatever it returns) to `public/images/articles/<slug>.<ext>` and commit it with the article PR. The `upload-article-images` workflow uploads it to R2 and commits its removal from the PR branch before the PR is squash-merged. Do not use Git LFS.
4. Check the file is not already used by another article (`md5sum public/images/articles/*` — every hero must be unique).
5. Add to the article's `article` object, after `tags` (type `ArticleImage` in app/article.ts):

   ```ts
   image: {
     src: "/images/articles/<slug>.<ext>",
     alt: "<one sentence describing what is in the picture>",
     credit: {
       author: "<plain-text artist name, HTML stripped>",
       license: "<LicenseShortName, e.g. 'CC BY-SA 4.0'>",
       href: "<imageinfo[0].descriptionurl>",
     },
   },
   ```

The layout renders the hero with its credit automatically and emits it as `og:image`.

## Illustrations

Do not hand-roll bordered-card "diagrams". Pick from the shared components by job (see STYLE.md → Illustrations for the full decision list): `BarChart`/`LineChart` for numbers, `NumberLine` for values against a boundary or each other on one axis, `DataTable` for enumerable facts and matrices, `Compare` for attribute contrasts, `FlowSequence` for ordered progressions, `FeedbackLoop` for ordered cycles that feed back into their first stage, `AnnotatedCode` for line-anchored anatomy of one snippet, `MemoryBoxes` for records sharing or pointing at each other, `DiffReview` for a change under review, `MessageThread` for short dialogues, `SocialPost` for a static source-linked X or Bluesky post, `ImageFigure` for in-flow photographs — and, in an essay that is already joking, at most one genuinely fitting funny GIF (also `ImageFigure`, animated GIFs go to `public/images/articles/<slug>-<name>.gif`, alt text describing the motion, source page credited; see STYLE.md for the bar it must clear). A bespoke route-local figure is allowed only for genuinely spatial or skeuomorphic content no shared form can show, and its caption must describe what the visual actually renders.

## Validation

Run `pnpm typecheck` and `pnpm validate` before committing. Also check the two layout rules writers keep missing: the body must open with at least one paragraph of prose (the hero image is already the article's first visual — never a code block or figure directly under it), and non-prose blocks never stack back to back.

Run the STYLE.md pre-submit checklist as a separate editing pass over the finished draft — not from memory while writing. Drafts checked only during writing consistently ship extra contrast scaffolds ("X is not Y. It is Z." and its semicolon form); the count only comes out right when a second pass reads the finished text cold.

# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
