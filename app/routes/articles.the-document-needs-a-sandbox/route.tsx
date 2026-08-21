import { articleMeta, type ArticleMeta } from "../../article";
import {
  AnnotatedCode,
  ArticleLayout,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The document needs a sandbox",
  description:
    "PDF preserves the page by making every reader parse a programmable container, infer missing semantics, and defend itself against malformed or active content.",
  published: "2026-07-18T13:40:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-document-needs-a-sandbox.jpg",
    alt: "A researcher in safety glasses examines a small sample held in tweezers through the sealed glove ports of a laboratory glovebox.",
    credit: {
      author: "UCL Mathematical & Physical Sciences",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Glovebox_(9360191038).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const catalog = `
  1 0 obj
  << /Type /Catalog
     /Pages 2 0 R
     /AcroForm 8 0 R
     /Names << /EmbeddedFiles 9 0 R >>
     /StructTreeRoot 10 0 R
     /OpenAction 11 0 R
  >>
  endobj
`;

const readerRows = [
  [
    "Painted text",
    "Words, Unicode, selection boundaries, and reading order",
    "Columns interleave or copied text arrives in file order",
  ],
  [
    "Tagged structure",
    "Headings, lists, tables, alternative text, and focus order",
    "Assistive technology receives a flat or misleading document",
  ],
  [
    "Scanned pages",
    "OCR, language detection, and confidence about inferred text",
    "The apparent document remains a sequence of pictures",
  ],
  [
    "Actions and attachments",
    "Viewer policy, prompts, scripting, URL handling, and file handling",
    "Useful features disappear or active content becomes attack surface",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I hate PDFs most when someone sends three paragraphs inside one. You click what should be text and a
          second application wakes up inside the browser, complete with its own zoom, search, selection model,
          print path, keyboard behavior, and accessibility tree. The page can look finished while the document
          underneath is missing.
        </p>
        <p>
          A PDF is an application container shaped like a page. The format won by freezing appearance across
          printers and operating systems, then kept absorbing forms, scripts, attachments, signatures, encryption,
          layers, annotations, and logical structure until opening a memo became a parser problem and a security
          boundary.
        </p>

        <H2>The page outranks the reading</H2>
        <p>
          Adobe&apos;s own{" "}
          <a href="https://opensource.adobe.com/dc-acrobat-sdk-docs/library/accessibility/index.html">
            accessibility documentation
          </a>{" "}
          separates rendering order from logical order. Characters can be painted in one sequence and read in
          another, so Tagged PDF carries an additional structure tree for headings, tables, links, form fields, and
          the order assistive technology should follow. Untagged files leave Acrobat inferring that structure “to
          some extent,” with results Adobe describes as less satisfactory.
        </p>
        <p>
          The current W3C{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF3">
            reading-order technique for PDF
          </a>{" "}
          warns that complex layouts can convert with the wrong tag order and may need manual repair in Acrobat Pro.
          A lunch menu should not need remediation software. Yet a two-column page can look flawless while a screen
          reader alternates lines between columns because the semantic document was never finished.
        </p>
        <DataTable
          head={["PDF carries", "Software must expose or infer", "Failure when it cannot"]}
          rows={readerRows}
          caption="The visible page and the usable document depend on different layers of the file and different reader subsystems."
        />
        <p>
          So whether a given PDF is readable depends on everything that happened upstream — how the source was
          structured, which export settings were used, whether anyone checked the tags. The{" "}
          <a href="https://pdfa.org/resource/iso-14289-pdfua/">PDF/UA standard</a>{" "}
          defines a disciplined accessible subset, and good tools can produce it. But the <code>.pdf</code>{" "}
          extension looks the same either way, and you learn which kind you were sent after you open it.
        </p>

        <H2>The file grew verbs</H2>
        <p>
          A PDF catalog can point at the page tree and also at forms, embedded files, a logical structure tree, and
          an action to run when the document opens. This representative object is enough to show why a viewer grows
          into a runtime:
        </p>
        <AnnotatedCode
          lang="text"
          title="representative PDF catalog"
          code={catalog}
          notes={[
            { line: 3, note: "The page tree leads to the content that gets painted." },
            { line: 4, note: "AcroForm adds interactive fields and their behavior." },
            { line: 5, note: "The names tree can expose files carried inside the PDF." },
            { line: 6, note: "The structure tree supplies semantics separately from page paint." },
            { line: 7, note: "OpenAction lets the file request work as soon as the viewer opens it." },
          ]}
          caption="One catalog dictionary can connect page rendering, interaction, attachments, accessibility structure, and document-open behavior."
        />
        <p>
          Why can a memo have an open action? Adobe&apos;s{" "}
          <a href="https://opensource.adobe.com/dc-acrobat-sdk-docs/library/pdfmark/pdfmark_Actions.html">
            action reference
          </a>{" "}
          includes JavaScript, application launch, movies, sounds, form submission, links, and imported data. Modern
          viewers restrict or ignore parts of that list, but they still have to recognize enough of the machinery to
          decide what to allow. Acrobat&apos;s{" "}
          <a href="https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsdevguide/index.html">
            JavaScript guide
          </a>{" "}
          describes APIs for attachments, databases, document security, and interactive forms.
        </p>

        <H2>Everyone writes a reader</H2>
        <p>
          Firefox ships{" "}
          <a href="https://mozilla.github.io/pdf.js/getting_started/">PDF.js</a>, whose core parses and interprets the
          binary file before separate display and viewer layers render it. Chromium carries{" "}
          <a href="https://pdfium.googlesource.com/pdfium/+/refs/heads/main/README.md">PDFium</a>. Desktop and server
          software rely on projects such as{" "}
          <a href="https://poppler.freedesktop.org/">Poppler</a>{" "}
          and <a href="https://mupdf.com/core">MuPDF</a>. Each engine has to survive fonts, images, compressed object
          streams, annotations, malformed files, text extraction, and the features its product chooses to expose.
        </p>
        <p>
          A file format that needs a sandbox has become software. PDFium maintains dedicated{" "}
          <a href="https://www.chromium.org/Home/chromium-security/pdfium-security/">security guidance</a>{" "}
          alongside corpus, JavaScript, pixel, and fuzz testing, while Adobe keeps publishing Reader patches. Its{" "}
          <a href="https://www.adobe.com/trust/security/products/acrobat/apsb26-63.html">
            June 2026 security bulletin
          </a>{" "}
          fixed critical and important vulnerabilities whose possible effects included arbitrary code execution,
          denial of service, and memory exposure.
        </p>
        <p>
          I am not claiming PDF is uniquely dangerous among complicated parsers; browsers, archives, and media
          codecs need hardening too. What bothers me is how we treat the file. We email PDFs as inert sheets of
          paper, then ask a constantly patched interpreter to open them safely and guess which painted marks were
          meant to be prose.
        </p>

        <H2>Keep it at the edge</H2>
        <p>
          PDF still earns its place as a print-ready artifact, signed form, archival snapshot, or press proof. Those
          jobs value stable pages. A public report meant for reading should begin as structured HTML or another
          semantic source, with PDF offered as a secondary download and generated with tags that somebody actually
          checks.
        </p>
        <p>
          Adobe&apos;s{" "}
          <a href="https://opensource.adobe.com/dc-acrobat-sdk-docs/library/plugin/Plugins_Words.html">
            word-finding documentation
          </a>{" "}
          offers two ways to enumerate recognized words: file order or page location. It then warns that page
          location generally matches reading order for one column and fails for multiple columns. The page has
          already rendered perfectly by the time the library starts guessing how its words become a sentence.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
