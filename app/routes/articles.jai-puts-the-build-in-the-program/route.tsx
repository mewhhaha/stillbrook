import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Jai puts the build in the program",
  description:
    "Jonathan Blow's language lets ordinary program code participate in compilation. The interesting part is what a project can ask its own compiler.",
  published: "2026-10-18T00:12:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/jai-puts-the-build-in-the-program-journal.webp",
    alt: "A mechanical arm fits a gear into an open brass workshop, with spare cogs and a caliper in front.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Add a field to a game object. Now update the save format, the editor inspector, and the
          debug display. Somewhere there is probably a script that generates one of those. Somewhere
          else there is a build rule that remembers when to run the script. The field was the easy part.
        </p>
        <p>
          This is the sort of problem that makes Jonathan Blow&apos;s Jai interesting to me. In his{" "}
          <a href="https://www.youtube.com/watch?v=IdpD5QIVOKQ">Jai demo and design keynote</a>,
          the project&apos;s build logic is a program written in Jai. It can create a compilation
          workspace and receive information from the compiler about the program being compiled.
          Your application and the machinery that builds it get to use the same language.
        </p>

        <H2>Start with the game</H2>
        <p>
          Jai grew out of Blow&apos;s work on games. His{" "}
          <a href="https://www.youtube.com/watch?v=TH9VCN6UkyQ">2014 introductory talk</a>{" "}
          was explicitly about a language for game programmers, and the early{" "}
          <a href="https://www.youtube.com/watch?v=UTqZNujQOlA">prototype demo</a>{" "}
          already included compile-time execution. These are historical demonstrations, rather
          than a specification of today&apos;s syntax, but the direction is recognizable.
        </p>
        <p>
          A game gives a language designer quite specific complaints. Data must reach rendering,
          collision, persistence, and tools. The programmer keeps making small changes and running
          the result. An abstraction that looks tidy in isolation can become a nuisance when every
          subsystem needs to know what it means.
        </p>
        <p>
          Jai&apos;s response gives the programmer considerable control. Blow describes it as a
          systems language with manual memory management. The compiler can help you inspect and
          check your program; that does not establish a general memory-safety guarantee. The design
          depends on the programmer choosing useful rules for the software they are making.
        </p>

        <H2>The compiler can answer project questions</H2>
        <p>
          The keynote&apos;s build program receives compiler messages in user code. Blow shows
          workspaces as separate compilation contexts and emphasizes that this metaprogram uses
          the same language as the game. Shared functions and data can serve both. That is a more
          substantial idea than folding an arithmetic expression before the executable starts.
        </p>
        <p>
          Consider a rule for a save system: a persistent record must not silently gain a field the
          serializer ignores. With access to type information, project code could compare the
          record&apos;s fields against its serialization policy and report a mismatch. This is an
          example of what I would build on the mechanism, not a claim that Jai ships that policy.
        </p>
        <FlowSequence
          steps={[
            { title: "Inspect a type", detail: "Read the fields the compiler has resolved." },
            { title: "Apply a rule", detail: "Check each field against the save policy." },
            { title: "Report the omission", detail: "Point the author at the unsupported field." },
          ]}
          caption="A proposed project check using compiler information; the save policy belongs to the application."
        />
        <p>
          The useful part is the location of the knowledge. The compiler knows what a field is.
          The game knows what saving means. A project-specific check can bring those facts together
          without asking the language designer to add a serialization feature for every game.
        </p>

        <H2>Ordinary code brings ordinary maintenance</H2>
        <p>
          In his November 2025{" "}
          <a href="https://www.youtube.com/watch?v=e6crOMC9WCE&t=124s">
            conversation with Richard Feldman
          </a>, Blow returns to metaprogramming and compile-time execution as central design
          choices. The attraction is easy to understand: helpers, data structures, and debugging
          skills can carry over into the build.
        </p>
        <p>
          I would still keep that program small. A generator can hide a surprising amount of work
          behind one declaration. A check that walks the entire project after every little edit
          can become its own source of delay. Giving build logic a familiar language makes that
          logic easier to work on; it also makes it easier to write more of it.
        </p>
        <p>
          My first experiment would be one narrowly useful check, with a clear diagnostic and a
          measured cost. Then I would change the relevant type and make sure the check catches
          the mistake. That is enough to find out whether compiler access removes a maintenance
          problem. An elaborate reflection framework can wait.
        </p>

        <H2>A language needs this kind of pressure</H2>
        <p>
          The most persuasive thing in the keynote is that the build program belongs to an actual
          game. It has a job beyond demonstrating the language. That gives the design somewhere
          to encounter the awkward cases: generated declarations, platform differences, tools,
          and the need to get back into the game after an edit.
        </p>
        <p>
          This is why I would start learning about Jai through its build machinery. A language can
          save a few characters in a function declaration and leave the rest of development just
          as cumbersome. Here, the compiler itself is available as something the project can
          program against. I want to see how much duplicated knowledge that can remove.
        </p>
        <p>
          It also makes compile speed a particularly interesting constraint. Every useful check
          takes time. The companion essay on{" "}
          <a href="/articles/a-million-lines-is-a-budget">a million lines per second</a>{" "}
          looks at how much work can fit inside that ambition.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
