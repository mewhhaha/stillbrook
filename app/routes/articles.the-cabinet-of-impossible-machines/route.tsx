import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, DataTable, Divider, H2, Prose } from "../../components";
import { TapeLayout } from "./tape-layout";

export const article = {
  title: "The cabinet of impossible machines",
  description:
    "Five languages from one archived esolang repository show what happens when functions, bits, sets, a self-modifying machine description, or Peano arithmetic is forced to carry an entire program.",
  published: "2026-07-11T17:47:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/the-cabinet-of-impossible-machines-journal.webp",
    alt: "Five open compartments contain wheels, a bead sieve, a bowl of stones, a paper-tape machine, and a stone staircase.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const functionalPrelude = `
  zero, one,
  equal, assign, variable, function,
  read, write, eof,

  variable(not, function(x)(equal(x, zero)))
`;

const tranceInstruction = `
  01010100001011

  test address 0
  0 -> input one bit into address 3
  1 -> jump to bit address 5
`;

const zfcProgram = `
  zero: {}
  one: {zero}

  not(x): !x
  bool(x): not(not(x))

  union(x): collect(~x)
  collect(x): x
`;

const palaceProgram = `
  add(x, 0) = x
  add(x, +y) = add(+x, y)

  mul(x, 0) = 0
  mul(x, +y) = add(x, mul(x, y))
`;

const machines = [
  {
    name: "Functional()",
    world: "Function calls",
    gift: "Closures from a tiny core",
    bill: "Names acquire meaning by arrival order",
  },
  {
    name: "Bitwise Trance",
    world: "Mutable bits",
    gift: "Branching and self-modification coincide",
    bill: "Instruction boundaries do not survive",
  },
  {
    name: "ZFC++",
    world: "Finite sets",
    gift: "Extensional equality is built in",
    bill: "Order and multiplicity must be encoded",
  },
  {
    name: "Self-modifying Turing machine",
    world: "One tape",
    gift: "The machine description becomes data",
    bill: "A local write can rewrite the machine",
  },
  {
    name: "Palace",
    world: "Natural numbers",
    gift: "Recursive equations become executable",
    bill: "Arithmetic pays in successor steps",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="8 min read">
      <Prose>
        <p>
          The most useful language-design repository I found this week had fourteen stars when I opened
          it, an archive banner, and no roadmap. Its{" "}
          <a href="https://github.com/Hakerh400/esolangs/blob/master/package.json">
            package manifest
          </a>{" "}
          names Thomas as the author, leaves the contributor list empty, and exposes eighty esoteric
          interpreters through one Node package. Somebody built real infrastructure for eighty toy
          languages and then, as far as I can tell, walked away.
        </p>
        <p>
          I almost credited every language in the{" "}
          <a href="https://github.com/Hakerh400/esolangs">Hakerh400/esolangs archive</a>{" "}
          to one person before noticing that it hosts other people&apos;s designs too. So I cross-checked
          against Hakerh400&apos;s{" "}
          <a href="https://esolangs.org/wiki/User:Hakerh400">Esolang author page</a>{" "}
          and picked five that appear there and have interpreters in the archive, then read the
          specifications alongside the implementations instead of pretending an archived package is a
          maintained development kit.
        </p>
        <p>
          What draws me to esolangs is that they can&apos;t cheat. A production language hides an awkward
          semantic choice under a library, a convention, an optimizer, a foreign-function call. These
          five have nowhere to put one. Each lets a single kind of thing carry almost the entire
          program, and then you find out what that costs.
        </p>

        <DataTable
          head={["Machine", "Everything is", "The gift", "The bill"]}
          rows={machines.map((machine) => [machine.name, machine.world, machine.gift, machine.bill])}
          caption="Five languages, five decisions about what is allowed to exist."
        />

        <H2>Functions before names</H2>
        <p>
          <a href="https://esolangs.org/wiki/Functional%28%29">Functional()</a>{" "}
          reduces the visible language to identifiers and argument lists. The first six distinct
          identifiers encountered become six native functions, in order: zero, one, equality, assignment,
          scoped variable binding, and function construction. The next three names claim standard input
          and output. The spellings carry no meaning — whatever identifier arrives first is zero.
        </p>
        <CodeBlock
          lang="text"
          title="functional() semantic prelude"
          highlight="1-3,5"
          code={functionalPrelude}
        />
        <p>
          In this prelude, <code>zero</code> means zero because it happens to be the first new
          identifier, not because the parser recognizes the word. Once the six primitives exist, the
          language can build user functions, closures, variables, and eventually object-like
          structures, and the{" "}
          <a href="https://github.com/Hakerh400/esolangs/tree/master/src/langs/functional">
            implementation
          </a>{" "}
          takes all of this seriously: tokenizer, parser, compiler, machine, and bit-level input and
          output each live in their own module.
        </p>
        <p>
          The bootstrap is the good part. Functional() shows how little machinery higher-order
          programming actually needs once function creation and variable binding exist.
        </p>
        <p>
          The bad part is that naming becomes global state. Insert an unfamiliar identifier before the
          prelude and every primitive after it may change identity, so a refactor can silently change
          which language the rest of the file is written in. I reread the specification twice expecting
          that to be my misunderstanding, and it isn&apos;t — the arrival-order rule really is the whole
          linking model.
        </p>

        <H2>Bits without a border</H2>
        <p>
          <a href="https://esolangs.org/wiki/Bitwise_Trance">Bitwise Trance</a>{" "}
          stores the source itself in an unbounded, zero-filled bit memory. Every instruction reads one
          test address followed by two opcode-and-address branches; the bit at the test address chooses
          which branch runs. Four opcodes cover jump, bit flip, input, and output, and that is the
          entire instruction set.
        </p>
        <AnnotatedCode
          lang="text"
          title="one decoded Bitwise Trance instruction"
          code={tranceInstruction}
          notes={[
            {
              line: 1,
              note: "Fourteen source bits encode the test address and both possible actions.",
            },
            {
              line: 3,
              note: "The first field reads bit zero. Its value chooses which branch below runs.",
            },
            {
              line: 4,
              note: "A zero consumes one input bit and writes it into address three.",
            },
            {
              line: 5,
              note: "A one jumps to bit address five, even if five is inside another instruction.",
            },
          ]}
        />
        <p>
          The flip operation can mutate those same source bits, so code, data, branch table, and parser
          alignment all share one memory — the language never promised they were different things.
        </p>
        <p>
          That collapse is the useful idea, though. One instruction bundles an observation with the two
          actions it selects between, and that&apos;s the whole theory of control flow. The{" "}
          <a href="https://github.com/Hakerh400/esolangs/blob/master/src/langs/bitwise-trance/engine.js">
            interpreter core
          </a>{" "}
          fits in a small reader and a four-case switch, so you can check the strange semantics against
          the code directly.
        </p>
        <p>
          The cost is locality. Once a jump lands inside an old instruction, or a flip changes its
          encoding, whatever disassembly you had in your head is fiction. The host leaks in too: the
          specification describes unbounded addresses, but the JavaScript reader refuses any address
          with thirty continuation groups because its bitwise arithmetic can&apos;t carry the abstraction
          that far, and the runner has to invent an output convention for stopping, since the language
          never included a halt instruction.
        </p>

        <H2>Sets without sequence</H2>
        <p>
          <a href="https://esolangs.org/wiki/ZFC%2B%2B">ZFC++</a>{" "}
          allows finite sets, function definitions, calls, and two odd operators. Inversion,
          <code> !</code>, maps the empty set to a singleton and every nonempty set to the empty set.
          Spread, <code> ~</code>, applies a function across the members of a set and unions the returned
          sets. There are no built-in numbers, booleans, lists, or strings; everything has to become a
          set first.
        </p>
        <CodeBlock lang="text" title="zfc++" highlight="1-2,4-5" code={zfcProgram} />
        <p>
          Empty and singleton sets stand in for false and true, and double inversion converts any set
          into that boolean pair. <code>collect(~x)</code> calls <code>collect</code> for each member of{" "}
          <code>x</code> and unions what comes back, which turns out to be enough to define union without
          a native keyword for it.
        </p>
        <p>
          The part that impressed me sits in the{" "}
          <a href="https://github.com/Hakerh400/esolangs/blob/master/src/langs/zfc-plus-plus/ctors.js">
            set implementation
          </a>
          : it recursively canonicalizes members, removes duplicates, and sorts by structural identity,
          so set equality behaves extensionally. Order and repetition disappear because the language
          said they don&apos;t matter, and the interpreter actually enforces that.
        </p>
        <p>
          The same commitment is what hurts. Sequence and multiplicity are ordinary programming needs,
          so every list, string, and bag has to be encoded, canonicalization re-walks structure
          constantly, and one spread call can fan out into a call per member before the results union
          back together. I haven&apos;t measured how badly that compounds, but nothing in the design
          suggests it stays polite.
        </p>

        <Divider />

        <H2>The machine eats its own diagram</H2>
        <p>
          The{" "}
          <a href="https://esolangs.org/wiki/Self-modifying_Turing_machine">
            Self-modifying Turing machine
          </a>{" "}
          keeps source, transition table, current state, data pointer, working data, input, and output on
          one zero-indexed bit tape. Even the description of how to execute the tape lives on the tape.
        </p>
        <TapeLayout />
        <p>
          At each step, bit one selects the even or odd lane from which the machine description is read;
          the interpreter then decodes the state width, current state, transition cards, and mutable
          pointer. A selected card may flip the pointed bit, move the pointer, and choose another state.
          If the pointer wanders into metadata, the next transition can rewrite the machine that chooses
          transitions.
        </p>
        <p>
          This is the cleanest self-modification in the cabinet — no privileged instruction segment
          pretending to be immutable while data lives somewhere else. The{" "}
          <a href="https://github.com/Hakerh400/esolangs/blob/master/src/langs/smtm/index.js">
            131-line interpreter
          </a>{" "}
          re-reads the description from sparse BigInt-addressed memory on every single cycle, which is
          slow and honest: it pays for the premise instead of compiling it away.
        </p>
        <p>
          It also means you can&apos;t reason locally about anything. A one-bit write may alter a value,
          the pointer encoding, a branch card, the parser lane, or the halt flag, and the published cat
          program can halt after a single transition because encoded input already sits in the tape
          region used for output. Elegant in the same way a room with no walls is spacious. The
          specification also stops short of a Turing-completeness proof, so the most machine-like
          language here leaves its own computational class open.
        </p>

        <H2>Arithmetic one successor at a time</H2>
        <p>
          <a href="https://esolangs.org/wiki/Palace">Palace</a>{" "}
          permits natural numbers, zero, function calls, and a prefix successor marker. Function
          equations pattern-match on zero or on a successor value; the first function is the entry
          point, and its arguments come from the input integers.
        </p>
        <CodeBlock lang="text" title="palace" highlight="1-2,4-5" code={palaceProgram} />
        <p>
          The first pair of equations is addition done as a proof by cases: adding zero returns the
          other argument, and adding a successor moves one successor across and recurses. Multiplication
          repeats addition by the same pattern. Nothing hides the induction.
        </p>
        <p>
          Palace is the one I&apos;d teach. The equations read cleanly, and the{" "}
          <a href="https://github.com/Hakerh400/esolangs/blob/master/src/langs/palace/ctors.js">
            implementation
          </a>{" "}
          does more than blind dispatch — it compiles patterns into a decision structure, rejects
          ambiguous overloads, detects missing cases, and checks identifiers before running anything.
          Values live as BigInt in the host, so the interpreter isn&apos;t literally allocating chains of
          successor nodes.
        </p>
        <p>
          BigInt doesn&apos;t erase the semantic bill, though. Addition still peels one successor at a
          time, multiplication nests that process, and negative numbers, products, sequences, and
          effects don&apos;t exist until you encode them or change the language. You end up watching
          arithmetic happen at a speed where you can follow it, which I suspect was the goal.
        </p>

        <H2>What the drawer keeps</H2>
        <p>
          Line the five up and each has removed a different comfort. Functional() destabilizes primitive
          names, Bitwise Trance destabilizes instruction boundaries, ZFC++ drops order and multiplicity,
          the Self-modifying Turing machine drops the wall between machine and memory, and Palace gives
          up every arithmetic shortcut. None of them would survive contact with a real project, and none
          of them is trying to.
        </p>
        <p>
          What makes the archive worth an afternoon is that the implementations follow the ideas farther
          than a novelty syntax usually survives. The sets get canonicalized, the pattern equations get
          checked for ambiguity, the machine description really is mutable tape. The weak points show up
          exactly where the host language intrudes — finite JavaScript bitwise addresses, BigInt
          representations, a termination convention bolted on from outside — and I trust a semantic
          claim more once I&apos;ve watched an interpreter forced to pay for it.
        </p>
        <p>
          Mainstream languages need several models because programs hold several kinds of work, and this
          archive refuses that compromise five separate ways. I don&apos;t expect Thomas to come back to
          it — archived means archived — but before closing the tab I starred the repository. Fifteen
          now.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
