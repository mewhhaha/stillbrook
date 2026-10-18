import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, CodeTabs, H2, Prose } from "../../components";
import { AnnihilationNet } from "./net-figure";

export const article = {
  title: "Following the wire",
  description:
    "Bend becomes understandable once its HVM output is read as an interaction-calculus wiring diagram whose independent active pairs can reduce in parallel.",
  published: "2026-07-12T06:20:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/following-the-wire-journal.webp",
    alt: "A copper wire branches through a wooden lattice as two polished ends meet and a knot loosens.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const identityBend = `
  main = λa a
`;

const identityHvm = `
  @main = (a a)
`;

const appliedIdentityHvm = `
  @id = (a a)

  @main = out
    & @id ~ (42 out)
`;

const annihilation = `
  (a a) ~ (42 out)
  -----------------
  a ~ 42
  a ~ out
`;

const duplicateBend = `
  main = λa let {a1 a2} = a; (a1 a2)
`;

const duplicateHvm = `
  @main = ({(a b) a} b)
`;

const treeSumBend = `
  gen = λd switch d {
    0: λx x
    _: λx ((gen d-1 (+ (* x 2) 1)), (gen d-1 (* x 2)))
  }

  sum = λd λt switch d {
    0: 1
    _: let (t.a,t.b) = t
      (+ (sum d-1 t.a) (sum d-1 t.b))
  }

  main = (sum 20 (gen 20 0))
`;

const treeSumHvm = `
  @sum = (?(((* 1) @sum__C0) a) a)

  @sum__C0 = ({a c} ((b d) f))
    &! @sum ~ (a (b $([+] $(e f))))
    &! @sum ~ (c (d e))
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          I ran <code>bend gen-hvm</code> on an identity function and got <code>@main = (a a)</code>.
          For several minutes I read it as a useless expression applying <code>a</code> to itself. The
          compiler had removed every familiar clue, including the distinction between a binder and its
          use.
        </p>
        <p>
          The repeated <code>a</code> is the clue. Its two occurrences are the ends of one wire. HVM is a
          wiring diagram written sideways: Bend gives the graph functions and datatypes, HVM records its
          connections, and the evaluator computes when two principal ports meet.
        </p>

        <H2>Begin with the pinned runtime</H2>
        <p>
          The <a href="https://github.com/HigherOrderCO/Bend/blob/main/Cargo.toml">current Bend manifest</a>{" "}
          identifies the pair precisely: Bend <code>0.2.38</code> pins <code>hvm = "=2.0.22"</code>, and the
          <a href="https://github.com/HigherOrderCO/HVM2/blob/main/Cargo.toml"> HVM2 manifest</a> declares
          that version. The reproducible installs are <code>cargo install hvm --version 2.0.22 --locked</code>{" "}
          and <code>cargo install bend-lang --version 0.2.38 --locked</code>.
        </p>
        <p>
          Bend&apos;s smallest golden test gives us a clean entrance. The source on the left compiles to the
          net on the right:
        </p>
        <CodeTabs labels={["Bend", "HVM 2.0.22"]}>
          <CodeBlock lang="bend" title="identity.bend" code={identityBend} />
          <CodeBlock lang="text" title="identity.hvm" code={identityHvm} />
        </CodeTabs>
        <p>
          Parentheses create a constructor node with two auxiliary ports. Every node also has an implicit
          principal port. Because a wire joins exactly two ports, an HVM variable name normally appears
          exactly twice; both <code>a</code>s above describe one connection rather than two stored values.
        </p>

        <H2>Computation is a collision</H2>
        <p>
          The <a href="https://github.com/HigherOrderCO/HVM2/blob/main/paper/HVM2.typst">HVM2 paper</a> calls
          its textual language an <em>Interaction Calculus</em> representation of an interaction-combinator
          net. A definition contains one root tree plus optional equations after <code>&amp;</code>. The
          <code>~</code> operator connects principal ports, creating an active pair that can rewrite.
        </p>
        <p>I wrote the identity application directly in HVM so the pair stays visible:</p>
        <CodeBlock lang="text" title="answer.hvm" highlight="4-5" code={appliedIdentityHvm} />
        <p>
          The reference <code>@id</code> first expands to its net. Two constructor nodes then face each
          other, so the annihilation rule connects their corresponding auxiliary ports:
        </p>
        <CodeBlock lang="text" title="One interaction" highlight="1,3-4" code={annihilation} />
        <p>
          The two equations containing <code>a</code> link together, leaving the root connected to{" "}
          <code>42</code>; HVM 2.0.22 reports <code>Result: 42</code>. Stood upright, the same interaction
          looks like this:
        </p>
        <AnnihilationNet />
        <p>
          Other meetings use different local rules. A nullary eraser propagates through a binary node,
          while constructor and duplicator nodes commute by building four new connections. The two agent
          types determine the rule.
        </p>

        <H2>Copying has somewhere to happen</H2>
        <p>
          Duplication is easy to miss in ordinary source because writing a variable twice looks free. This
          deliberate Bend test names the operation, and its compiled net contains the curly-braced
          duplicator node:
        </p>
        <CodeTabs labels={["Bend", "Generated HVM"]}>
          <CodeBlock lang="bend" title="duplicate.bend" code={duplicateBend} />
          <CodeBlock lang="text" title="duplicate.hvm" code={duplicateHvm} />
        </CodeTabs>
        <p>
          When that duplicator meets another binary node, the commute rule pushes copying through the
          structure locally. Separate active pairs can take separate workers because neither rewrite needs
          a global program counter. References, native numbers, operators, and numeric switches extend the
          small combinator system so arithmetic does not arrive encoded one lambda at a time.
        </p>

        <H2>Bend exposes the branches</H2>
        <p>
          The <a href="https://github.com/HigherOrderCO/HVM2/tree/main/examples/sum_tree">official paired
          example</a> builds a balanced tree and counts its leaves by adding one at each base case. Bend
          contains no thread creation. The two recursive calls in <code>sum</code> expose independent work
          through the shape of the expression:
        </p>
        <CodeBlock lang="bend" title="sum_tree/main.bend" highlight="7-11" code={treeSumBend} />
        <p>
          Its generated HVM is longer, but the relevant piece becomes recognizable after circling each wire
          name twice:
        </p>
        <AnnotatedCode
          lang="text"
          title="sum_tree/main.hvm (excerpt)"
          code={treeSumHvm}
          notes={[
            {
              line: 1,
              note: (
                <>
                  Bend&apos;s <code>switch d</code> is the <code>?</code> node. Its <code>_</code> arm is the
                  reference <code>@sum__C0</code>.
                </>
              ),
            },
            {
              line: 3,
              note: (
                <>
                  The curly-braced duplicator again: <code>a</code> and <code>c</code> are the two copies of
                  the depth, one wire into each recursive call.
                </>
              ),
            },
            {
              line: 4,
              note: (
                <>
                  The addition is a native <code>$</code> operator, and it still waits for <code>e</code>,
                  the result of the other branch.
                </>
              ),
            },
            {
              line: 5,
              note: (
                <>
                  This is the second recursive call, a separate redex. <code>&amp;!</code> flags both
                  branching calls for the CUDA work-sharing policy.
                </>
              ),
            },
          ]}
        />
        <p>
          CPU workers steal redexes from one another without the <code>&amp;!</code> hint, while suitable
          GPU threads receive similarly shaped recursive work. Bend exposes the independence and HVM
          schedules the active pairs it creates.
        </p>
        <p>
          I am still unable to reconstruct a large Bend function fluently from generated HVM, and the HVM2
          paper itself remains a work in progress. The useful threshold arrived earlier. I left the two{" "}
          <code>sum_tree</code> files side by side, underlined every <code>~</code>, and paired the letters with
          a pencil; the recursive branches appeared, while the rest of <code>@sum__C0</code> remained
          punctuation for another morning.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
