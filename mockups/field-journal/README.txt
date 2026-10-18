STILL BROOK — FIELD JOURNAL MOCKUP

Open index.html directly in a browser. No install, build, or server needed.
Optional local server, from the repository root:
  python3 -m http.server 4173 --directory mockups/field-journal
Then open http://localhost:4173/index.html

Includes the homepage, six real essay excerpts, topic filters, search,
URL-addressable reading previews, and mobile navigation. Full essays link
to the existing journal. This is an isolated design prototype.

ART
concepts.png — two design directions, generated with the built-in image_gen tool.
assets/brook-machine.webp — generated homepage illustration, same tool.
prompts.json — the complete final prompts for both generations.

assets/cabinet.webp — the existing article image, downloaded from
https://stillbrook.dev/images/articles/the-cabinet-of-impossible-machines.jpg
and converted to WebP. Domenico Remps, Public domain.
Source: https://commons.wikimedia.org/wiki/File:Domenico_Remps_-_Cabinet_of_Curiosities.jpg

Fonts are copies of the project's existing self-hosted Lora and Inter fonts.
Essay metadata and excerpts are embedded in index.html from the corresponding
app/routes/articles.<slug>/route.tsx files. The packet code is retained for context.
The generated illustration is site decoration; production article heroes and
article metadata have not been modified.

VERIFICATION
Inspected desktop, mobile, and reading-view screenshots in screenshots/.
Chromium checks passed at 320, 390, 768, 1024, and 1440 pixels without page overflow.
Checked filters, multiword search, empty/reset states, reading permalinks,
reload, browser history, keyboard mobile menu, direct-file use, and asset loading.
JavaScript syntax check passed. No page or HTTP errors during browser checks.
This static prototype does not exercise the production app build or full gate.
