import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Lobster borrows the argument",
  description:
    "Lobster checks generic functions at their concrete calls, then uses the same context to work out ownership. A short function carries more information than its syntax suggests.",
  published: "2026-10-18T00:11:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/lobster-borrows-the-argument-journal.webp",
    alt: "A terracotta lobster holds olive thread running from a large wooden spool toward two brass winders.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const genericLength = `
  def count_units(values):
      return length(values)

  print count_units("shell")
  print count_units([2, 4, 8])
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          A small helper often knows very little about the thing it receives. It checks a length,
          prints a name, or visits a few fields, then returns control to the caller. I like languages
          that let that helper stay small. Wouter van Oortmerssen&apos;s{" "}
          <a href="https://aardappel.github.io/lobster/README_FIRST.html">Lobster</a>{" "}
          takes the idea further than its spare syntax first suggests: the caller helps decide both
          which types the helper sees and how its arguments stay alive.
        </p>
        <p>
          Start with a function that asks for a length. A string and a vector can both answer, although
          they are different types. Here is the entire example I would use to introduce the mechanism.
        </p>
        <AnnotatedCode
          lang="text"
          title="One definition, concrete argument types"
          code={genericLength}
          notes={[
            { line: 1, note: "Leaving the parameter untyped makes this function generic." },
            { line: 4, note: "The function body is checked with a string argument." },
            { line: 5, note: "A vector argument gives the checker another concrete case." },
          ]}
          caption="A generic length helper. The string call counts bytes; the vector call counts elements."
        />
        <p>
          The example explains how one definition can accept both inputs. It says nothing by itself
          about which reference-count operations survive compilation. That needs a look at the
          ownership rules, and eventually the generated program.
        </p>

        <H2>Check the call you have</H2>
        <p>
          Lobster&apos;s{" "}
          <a href="https://aardappel.github.io/lobster/type_checker.html">type-system documentation</a>{" "}
          describes specialization around concrete argument types, with checking following the call
          graph. Untyped parameters receive their types from callers. Explicit annotations can constrain
          them, and a named generic parameter can require two arguments to share a type. Flow typing
          also carries information from conditions: testing a nilable value lets the successful branch
          use its underlying type.
        </p>
        <p>
          I find this an appealing order of explanation. Begin with two actual calls and ask whether
          the operations in the body make sense for each. A reusable helper can grow out of an ordinary
          piece of code. When the relationship between its arguments becomes important, I can write
          that relationship down.
        </p>
        <p>
          There is a debugging tradeoff. The documentation warns that sparse annotations can move an
          error farther down the call chain. I would annotate the boundaries where I want mistakes to
          stop: a parser&apos;s result, a public function&apos;s input, perhaps the representation handed to a
          renderer. A little redundancy can make a compiler error much easier to place.
        </p>

        <H2>The same call carries a lifetime</H2>
        <p>
          The{" "}
          <a href="https://aardappel.github.io/lobster/memory_management.html">memory-management design</a>{" "}
          combines reference counting with ownership analysis. The compiler tries to borrow existing
          values for uses that need no additional owner. When another use needs ownership, it can insert
          a reference-count increase. Ownership analysis is interwoven with type checking because
          specialization can account for ownership as well as argument types.
        </p>
        <p>
          For a helper that briefly reads a vector, borrowing matches the intent nicely. The caller
          already has a reason to keep the vector alive. Making every visit acquire another ownership
          share would add work whose purpose is already satisfied. The attractive part is how much
          the compiler can discover from an ordinary call.
        </p>
        <p>
          Mutation still matters. The design describes conflicts when a later argument removes an
          element that an earlier argument borrows, as in a call shaped like <code>f(v[0], v.pop())</code>.
          Some other conflicts can be resolved by giving a value an owning reference. The programmer
          avoids explicit lifetime annotations, while the compiler still has to preserve the borrowed
          value&apos;s storage.
        </p>
        <p>
          This is where I would slow down during an experiment. A helper that only reads is easy to
          reason about. A helper that stores its input, returns it, or changes the surrounding container
          deserves a closer look. I want to see which small edits change the ownership decision and
          whether the resulting diagnostics point at the operation I need to understand.
        </p>

        <H2>Count what remains</H2>
        <p>
          The{" "}
          <a href="https://aardappel.github.io/lobster/language_reference.html">language reference</a>{" "}
          gives small structs value semantics, stored inline and copied by value. Strings, vectors,
          classes, and resources use reference semantics. Reference-counted storage is released when its
          last reference disappears. Cycles need attention: they can keep each other alive, and Lobster
          reports remaining cycles at program exit.
        </p>
        <p>
          My next step would be a small workload with both temporary reads and retained shared values.
          I would count remaining reference-count updates, specialized function bodies, executable size,
          and compile time. Specialization spends compiler work and code space to obtain context; the
          useful measurement is whether that purchase pays for this program. Lobster makes the bargain
          interesting by letting one compact helper participate in both type checking and memory
          management. I would like to see how far that compactness survives ordinary changes.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
