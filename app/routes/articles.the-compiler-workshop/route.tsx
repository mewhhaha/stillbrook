import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Small compilers with sharp opinions",
  description:
    "Axe, EDL, and Tig each commit to one opinion — parallel syntax, compile-time resources, readable C output — and stay small enough to read the commitment.",
  published: "2026-07-13T09:40:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-compiler-workshop-journal.webp",
    alt: "Three compact workshops display an axe, a balance, and a single-marble track.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const axeExample = `
  def main() {
    parallel for mut i = 0 to 10 {
      println i;
    }
  }
`;

const edlExample = `
  const NUM_CELLS: usize =
      load_num_cells("config/mesh.msh");

  let pressure_field =
      allocate_vector::<f64>(NUM_CELLS);
`;

const tigExample = `
  use "stdlib/io.tc"

  fn i32 main: {
    ->i32 values = alloc(i32, 100)
    defer free(values)
    ret 0
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          A compiler small enough to read in an afternoon offers a particular pleasure: whatever it does, it
          does on purpose. Axe, EDL, and Tig are three of these. Each has committed, in working code at a pinned
          commit, to one opinion that a general-purpose language would still be debating.
        </p>
        <Compare
          attributes={["The opinion", "Where it lives", "The admitted price", "Pinned commit"]}
          entities={[
            {
              name: "Axe",
              values: [
                "parallelism belongs in loop syntax",
                "a self-hosted parser and the OpenMP pragma the C backend emits",
                "scheduling, races, and grain size still decide whether it pays",
                <code key="axe">94921b9</code>,
              ],
            },
            {
              name: "EDL",
              values: [
                "resources belong to compilation",
                "comptime contexts, the only place resources may be acquired",
                "the program recompiles for every execution",
                <code key="edl">126f498</code>,
              ],
            },
            {
              name: "Tig",
              values: [
                "output should stay readable",
                "the emitted C11, open in a debugger",
                "no optimizer, no intermediate representation, no memory-safety claim",
                <code key="tig">2c63328</code>,
              ],
            },
          ]}
          caption="Every repository link in this essay points into the commit in the last row."
        />
        <p>
          The examples below come from the repositories at those commits, and they establish behavior and stated
          scope. Nobody here is claiming production readiness, least of all me.
        </p>

        <H2>Let syntax own parallel intent</H2>
        <p>
          In Axe, <code>parallel for</code> sits in the ordinary loop vocabulary, where the parser can see the
          programmer&apos;s intent instead of excavating it from a library call or a build flag.
        </p>
        <CodeBlock lang="text" title="parallel.axe" highlight="3" code={axeExample} />
        <p>
          That spelling is implemented, not aspirational. Axe&apos;s{" "}
          <a href="https://github.com/axelang/axe/blob/94921b975b09999e98d013ffda1615e1215137a7/source/compiler/parser.axe">
            self-hosted parser
          </a>{" "}
          recognizes the construct, the test suite exercises simple and reduction forms, and the{" "}
          <a href="https://github.com/axelang/axe/blob/94921b975b09999e98d013ffda1615e1215137a7/source/compiler/backends/c/renderer.axe">
            C backend
          </a>{" "}
          lowers it to an OpenMP pragma. The grammar&apos;s contribution is a region the compiler can check and
          lower — whether ten tiny prints actually beat a serial loop is a different question, same as ever.
        </p>

        <H2>Let compilation own resource shape</H2>
        <p>
          EDL configures performance-sensitive Rust applications, and its founding move sounds almost illegal the
          first time: the program is recompiled for every execution. A mesh file decides how many cells exist, and
          the pressure vector is allocated at exactly that size before the numerical work begins.
        </p>
        <CodeBlock lang="text" title="solver.eq" highlight="1-5" code={edlExample} />
        <p>
          The{" "}
          <a href="https://github.com/LateinCecer/edlc/blob/126f498e472d9bcaa3695b1c78c83c1745cca48d/LANGUAGE.md">
            language specification
          </a>{" "}
          makes global initialization a <code>comptime</code> context and confines resource acquisition to such
          contexts, with heavy operations arriving as Rust callbacks whose generic signatures must match
          EDL&apos;s types exactly. Feel the shape of that trade. You give up the idea that one binary should
          accept every runtime shape, and in exchange the compiled work starts with its resources already chosen —
          a stark deal, priced in visible recompilation, which is what makes it honest enough to challenge with a
          real workload.
        </p>

        <H2>Let the output remain an escape hatch</H2>
        <p>
          Tig keeps the shortest semantic distance of the three: parse a small systems language, check it, emit
          C11 a person can open in a debugger. Allocation and scope-exit cleanup arrive without hiding the memory
          model.
        </p>
        <CodeBlock lang="text" title="buffer.tc" highlight="4-5" code={tigExample} />
        <p>
          The pinned{" "}
          <a href="https://github.com/alonsovm44/tc-lang/blob/2c6332856dcb9849a3dd85aed1d16a690b5cd783/README.md">
            README
          </a>{" "}
          is disarmingly plain about what is missing. Fat pointers, slices, and{" "}
          <code>defer</code> are guardrails around manual memory management, with everything past them left
          explicitly unclaimed. The README&apos;s actual promise is the emitted file.
        </p>
        <p>
          That promise doubles as Tig&apos;s refusal mechanism, because any feature that cannot lower
          transparently threatens the generated C&apos;s usefulness under a debugger. The same README now lists
          async functions and <code>select</code>. As far as I can tell those are on a collision course with the
          readable-output promise, and when they meet, the place to check will be an emitted <code>.c</code> file
          rather than the keyword count.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
