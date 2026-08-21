import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, H2, MessageThread, Prose, PullQuote } from "../../components";

export const article = {
  title: "Comptime behind glass",
  description:
    "Zig's comptime is useful, but a public API generated where the editor can't see it makes the feature harder to trust.",
  published: "2026-07-11T15:52:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/comptime-behind-glass.jpg",
    alt: "A watchmaker wearing a head-mounted magnifier bends over a small folding table, repairing a watch among rows of watches and tools.",
    credit: {
      author: "Yılmaz Kilim",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:Watchmaker_(184539829).jpeg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const blindSpot = `
  const S = struct { alpha: u32 };

  fn make(comptime T: type) T {
      return undefined;
  }

  const foo = make(S);
  foo.<cursor> // compiler: S; editor: maybe silence
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="2 min read">
      <Prose>
        <p>
          Zig&apos;s <code>comptime</code> has a point, and I&apos;ll get to it. But here&apos;s the
          part that bugs me: you type a dot after a value whose type Zig has already computed, and
          the editor gives you nothing. The compiler knows exactly which fields are there. You,
          sitting in front of the editor, get to find out by running a build.
        </p>

        <H2>The feature is real</H2>
        <p>
          Zig implements generics with compile-time parameters. Types are values at compile time,
          branches the compiler can resolve get specialized away, and the same function can run
          during compilation or at runtime. The{" "}
          <a href="https://ziglang.org/documentation/master/#comptime">language reference</a>{" "}
          makes this one small set of building blocks carry a surprising amount of the language.
        </p>
        <p>
          And it earns its keep. One mechanism covers generics, reflection, validation, partial
          evaluation, and most of what other languages reach for macros to do, while the runtime
          result stays boring — which is exactly what you want from a systems language.
        </p>
        <p>Then you hit this:</p>
        <CodeBlock lang="zig" title="main.zig" highlight="8" code={blindSpot} />
        <p>
          The compiler knows this is <code>S</code>. There&apos;s an{" "}
          <a href="https://github.com/zigtools/zls/issues/3205">open ZLS issue</a>{" "}
          reproducing the missing completion after almost this exact generic call, and ZLS&apos;s{" "}
          <a href="https://github.com/zigtools/zls#features">own feature list</a>{" "}
          still marks support for <code>comptime</code> and semantic analysis as work in progress.
          So the answer exists, fully computed, inside a compiler the editor never gets to ask.
        </p>
        <MessageThread
          caption="One source file, two semantic universes."
          messages={[
            {
              from: "Developer",
              text: (
                <>
                  I just typed <code>foo.</code> — what is it?
                </>
              ),
            },
            { from: "Zig compiler", text: "That is S. It has alpha: u32." },
            { from: "ZLS", text: "Unknown type. Never met her." },
            { from: "Developer", text: "You are both looking at the same file." },
          ]}
        />

        <H2>The editor is not optional</H2>
        <p>
          I spend most of a working day navigating half-finished code, and almost none of it
          inspecting emitted machine code. So when <code>comptime</code> conjures up a field or a
          method that hover and completion can&apos;t show me, the abstraction has hidden its public
          surface from the one tool I&apos;m actually looking at, and the whole feature starts to
          feel less safe than it is.
        </p>
        <p>
          Build on save can surface compiler diagnostics, but ZLS maintainers{" "}
          <a href="https://github.com/zigtools/zls/issues/2017">
            note that it does not provide generated-type completion
          </a>. And the problem runs deeper than a backlog: replaying arbitrary{" "}
          <code>comptime</code> inside the editor means building a second compiler, and as far as I
          can tell a second partial semantic engine always ends up disagreeing with the real one at
          the edges.
        </p>
        <PullQuote>The editor is part of the language you actually use.</PullQuote>

        <H2>Keep the cleverness behind the API</H2>
        <p>
          Until Zig exposes the compiler&apos;s semantic state, use <code>comptime</code> where it
          disappears: validating inputs, specializing internals, picking layouts, generating private
          tables. Be suspicious of any use that invents names your caller has to discover, because
          when the public API only exists after execution, your callers end up reading the generator
          source to learn what fields they actually got.
        </p>
        <p>
          The proper fix is already named in{" "}
          <a href="https://github.com/ziglang/zig/issues/615">upstream issue 615</a>: a persistent
          Zig compiler server that serves compilation information through a custom protocol, with
          ZLS translating it into LSP. Then the editor could ask the same compiler that instantiated
          the type, instead of maintaining its own guess.
        </p>
        <p>
          So yes, <code>comptime</code> is worth it. For now, though, the feature can express more
          than the tooling can explain, which is a good reason to keep the clever parts behind an
          API your editor can still see. The rest can wait for the compiler server.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
