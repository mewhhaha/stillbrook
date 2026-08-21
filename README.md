# Still Brook

A small editorial blog built with Vite, React Router framework-mode RSC, file routes, Tailwind CSS, and Cloudflare Workers.

> React Router currently marks framework-mode React Server Components as experimental. Keep `react-router`, `@react-router/dev`, React, and `@vitejs/plugin-rsc` upgrades together and run the complete validation suite.

## Develop

Requirements: Node.js 24 and the pnpm version pinned in `package.json`.

```sh
pnpm install
pnpm dev
```

Useful commands:

```sh
pnpm build          # production Vite/React Router Worker build
pnpm typecheck      # route type generation and TypeScript
pnpm lint           # ESLint
pnpm validate       # article contract, lint, types, and build
pnpm run deploy     # build, then wrangler deploy
```

The workspace enforces `minimumReleaseAge: 1440`, so dependency updates select the newest releases that are at least one day old. Commit `pnpm-lock.yaml` with dependency changes.

## Add an article

1. Copy `app/routes/articles.first-light/route.tsx` to `app/routes/articles.your-kebab-case-slug/route.tsx`. The filename automatically creates `/articles/your-kebab-case-slug` through `@react-router/fs-routes`.
2. Export an `article` object with `title`, `description`, `published` (RFC 3339 UTC timestamp like `2026-07-11T14:30:00Z`), a non-empty `author`, and at least one lowercase kebab-case tag, ending with `as const satisfies ArticleMeta`.
3. Export `ServerComponent`. Article routes are server components by default; do not add `"use client"` to the route module. However, you are free to create any client components you need in the same folder.
4. Wrap the content in `ArticleLayout` and `Prose` from `app/components` so every article shares the same shell, headings, and text treatment. Custom sections can still sit next to the `Prose` block.
5. Put article-specific interactive UI in a separate component under `app/components/` whose first line is `"use client"`, then import it into the article. Keep browser APIs and hooks inside that client component.
6. Run `pnpm validate`. The homepage discovers every `articles.<slug>/route.tsx` module at build time, sorts metadata newest-first by publication time, features the newest article, and puts older entries in the archive automatically.

Write in the voice described in [STYLE.md](STYLE.md) — it covers titles, structure, and how to use the components and code blocks well.

Minimal route shape:

```tsx
import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Prose } from "../../components";

export const article = {
  title: "A precise title",
  description: "A complete sentence describing the article.",
  published: "2026-07-11T09:00:00Z",
  author: "Your name",
  tags: ["software"],
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>Write here.</p>
      </Prose>
    </ArticleLayout>
  );
}
```

## Article component library

`app/components/index.ts` exports the shared building blocks. Layout and typography stay identical across articles; interactions stay free.

| Component | Purpose |
|-----------|---------|
| `ArticleLayout` | Page shell: reading-progress bar, back link, dateline, title, description, author/tags footer. |
| `Prose` | The article measure — typographic rhythm, headings, lists, quotes, inline code, `kbd`. |
| `H2` / `H3` | Section headings with hover-revealed `#` anchor links (slug derived from the text). |
| `CodeBlock` | Server-highlighted code. Props: `lang` (`ts`, `tsx`, `js`, `jsx`, `rust`, `json`, `css`, `html`, `sh`, `diff`, `text`), `title` (filename bar with copy button), `highlight` (`"2,5-7"` line emphasis), `lineNumbers`. Snippets are dedented automatically. |
| `CodeTabs` | Tabbed panels for variants of one instruction (pnpm/npm, before/after). Client island; panels stay server-rendered. |
| `Callout` | Aside with `note`, `tip`, or `caution` variants. |
| `PullQuote` | Centered statement quote with optional attribution. |
| `Figure` | Image/demo wrapper with a consistent caption. |
| `Divider` | Quiet `· · ·` section break. |
| `CopyButton` | Client island used by `CodeBlock`; reusable for other copyable text. |
| `ReadingProgress` | Scroll progress bar; already included by `ArticleLayout`. |
| `ThemeToggle` | Light/dark switch; included by `ArticleLayout` and the homepage header. |

## Dark mode

The site follows the operating system's `prefers-color-scheme` by default. The `ThemeToggle` button writes a `theme=dark|light` cookie and sets `data-theme` on `<html>`; a tiny inline script in `app/root.tsx` re-applies the cookie before first paint, so there is no flash of the wrong theme. Clearing the cookie returns the site to the system preference. The `dark:` variant is defined in `app/styles.css` (`@custom-variant dark`) so an explicit override always beats the media query.

The syntax highlighter (`app/components/highlight.ts`) is a dependency-free regex scanner that runs inside the server component, so highlighted code ships as plain HTML — no highlighting JavaScript reaches the reader. `articles.the-shape-of-a-code-block.tsx` demonstrates the full toolkit.

The pull-request workflow performs a frozen install, validates article structure, lints, typechecks, builds, and asks Wrangler for a deployment dry run. A successful merge therefore guarantees that the generated route manifest and production Worker bundle are valid.

Non-draft pull requests opened by the repository owner are squash-merged automatically once those checks pass, and the branch is deleted. Keep a pull request in draft until you're done, then undraft it.
