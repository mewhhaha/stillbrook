import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  DataTable,
  FlowSequence,
  H2,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "Just one more IR",
  description:
    "Compilers need several intermediate representations because each lowering stage should discard source meaning only after the analyses and transformations that depend on it have finished.",
  published: "2026-07-12T21:15:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/just-one-more-ir.jpg",
    alt: "Adolph von Menzel’s painting of an iron rolling mill crowded with workers tending furnaces, rollers, and glowing metal at different production stages.",
    credit: {
      author: "Adolph von Menzel",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Adolph_Menzel_-_Eisenwalzwerk_-_Google_Art_Project.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const source = `
  int max2(int a, int b) {
    return a > b ? a : b;
  }
`;

const gimple = `
  int max2 (int a, int b)
  {
    int result;
    result = MAX_EXPR <b, a>;
    return result;
  }
`;

const llvmIr = `
  define i32 @max2(i32 %a, i32 %b) {
    %result = call i32 @llvm.smax.i32(i32 %a, i32 %b)
    ret i32 %result
  }
`;

const x86 = `
  max2:
    mov   eax, esi
    cmp   edi, esi
    cmovg eax, edi
    ret
`;

const compilerRows = [
  [
    <a href="https://gcc.gnu.org/onlinedocs/gccint/Tree-SSA.html">GCC</a>,
    <code>GENERIC → GIMPLE → RTL</code>,
    "Common front-end trees, restricted three-address optimization, then machine operations described nearly one by one.",
  ],
  [
    <a href="https://rustc-dev-guide.rust-lang.org/overview.html">rustc</a>,
    <code>HIR → THIR → MIR → LLVM IR</code>,
    "Type and trait checking, explicit typed expressions, borrow and drop control flow, then a shared native backend.",
  ],
  [
    <a href="https://github.com/ghc/ghc/blob/master/compiler/GHC/Stg/Syntax.hs">GHC</a>,
    <code>Core → STG → Cmm</code>,
    "Typed functional simplification, closures and lazy evaluation, then explicit runtime control and storage layout.",
  ],
  [
    <a href="https://llvm.org/docs/CodeGenerator.html">LLVM backend</a>,
    <code>LLVM IR → SelectionDAG/GlobalISel → MachineIR → MC</code>,
    "Portable SSA, legal target operations, virtual and physical registers, then labels, sections, and encodable instructions.",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          I kept a dump directory for a four-line <code>max</code> function because I thought the x86
          backend had performed the clever part. The assembly used <code>cmov</code>, so I went looking for
          the pass that removed the branch. GCC&apos;s GIMPLE dump already contained <code>MAX_EXPR</code>, and
          clang&apos;s LLVM IR had already turned the function into <code>llvm.smax</code>.
        </p>
        <p>
          The extra layers look bureaucratic until you ask one representation to preserve Rust ownership
          facts, expose SSA for common-subexpression elimination, model x86 register constraints, and emit
          ELF relocations. No useful IR can carry all of that at once — each one keeps the facts its stage
          needs and lets the rest go.
        </p>
        <PullQuote>An IR is a controlled act of forgetting.</PullQuote>

        <H2>Four lines, four vocabularies</H2>
        <p>
          I ran GCC 14.2 and clang 17 on the same function. The generated names and attributes below are
          trimmed, but the operations are the ones those compilers emitted.
        </p>
        <CodeTabs labels={["C", "GIMPLE", "LLVM IR", "x86-64"]}>
          <CodeBlock lang="text" title="max2.c" highlight="2" code={source} />
          <CodeBlock lang="text" title="max2.c.006t.gimple" highlight="4" code={gimple} />
          <CodeBlock lang="text" title="max2.ll" highlight="2" code={llvmIr} />
          <CodeBlock lang="text" title="max2.s" highlight="2-4" code={x86} />
        </CodeTabs>
        <p>
          The C source names a comparison and two possible values. GCC&apos;s{" "}
          <a href="https://gcc.gnu.org/onlinedocs/gccint/GIMPLE.html">GIMPLE</a>, a restricted
          three-address representation derived from GENERIC, keeps the operation as a language-independent
          maximum. LLVM IR expresses the same fact as an SSA call to its{" "}
          <a href="https://llvm.org/docs/LangRef.html#llvm-smax-intrinsic">signed-max intrinsic</a>. Only the
          x86 form commits to flags, <code>eax</code>, and a conditional move.
        </p>
        <p>
          By the time you reach assembly, the compiler has spent information on purpose. The
          <code> cmovg</code> no longer tells you whether the programmer wrote a ternary, called
          <code> max</code>, matched an enum, or triggered an optimizer pattern — and nothing downstream
          of instruction selection has any use for knowing.
        </p>

        <H2>The cross-product is the trap</H2>
        <p>
          A tiny compiler can walk an AST and print assembly. The approach becomes ugly when every language
          feature has to know every target: Rust drops meet target ABIs, Haskell thunks meet stack maps.
          Add an architecture and the front end has to learn another register file. Add a language feature
          and every backend has to learn what it means.
        </p>
        <p>
          Industrial compilers split that cross-product into handoffs, although they disagree about where
          each semantic debt should be paid. Their main routes look like this:
        </p>
        <DataTable
          head={["Compiler", "Main lowering path", "What the layers retain"]}
          rows={compilerRows}
          caption="Four compiler pipelines place language semantics, portable optimization, and machine constraints at different boundaries."
        />
        <p>
          Those pipelines disagree on names because their source languages owe different debts. Rust needs
          a place where implicit dereferences and method calls become explicit before control-flow lowering,
          and GHC needs a form its own source calls “ideally suited” to spineless-tagless code generation.
          Forcing both through one universal mid-level language would erase those facts early, or bloat the
          shared IR with features most clients cannot interpret.
        </p>

        <H2>The last IR still is not assembly</H2>
        <p>
          LLVM IR already looks low-level, yet LLVM&apos;s own{" "}
          <a href="https://llvm.org/docs/CodeGenerator.html">code generator</a> keeps lowering. Four more
          stops sit between portable SSA and bytes in a file:
        </p>
        <FlowSequence
          steps={[
            {
              title: "Instruction selection",
              detail: "SSA becomes legal target operations on unlimited virtual registers",
            },
            {
              title: "Scheduling",
              detail: "orders those operations for the pipeline",
            },
            {
              title: "Register allocation",
              detail: "maps virtual registers onto the physical file and inserts spills",
            },
            {
              title: "MC layer",
              detail: "MachineInstr lowers to labels, sections, relocations, and encodable instructions",
            },
          ]}
          caption="The LLVM code generator's own lowering, after LLVM IR and before an object file."
        />
        <p>
          That separation earns its keep on awkward instructions. Signed x86 division requires particular
          physical registers, and a target-neutral division operation should not drag <code>EAX</code> and
          <code> EDX</code> through every optimizer. The constraint appears at instruction selection, where
          something can finally act on it, and register allocation handles the surrounding traffic.
        </p>
        <p>
          Even after assembly text appears, an object writer still has to choose sections, create symbols,
          encode relocations, and preserve debug locations. The{" "}
          <a href="https://llvm.org/docs/CodeGenerator.html#the-mc-layer">MC layer</a> holds those facts
          once, for both the <code>.s</code> writer and the <code>.o</code> writer. Printing assembly
          directly from LLVM IR would fold all of it into one enormous pass with nowhere stable to stop
          and inspect the result.
        </p>

        <H2>Just one more IR</H2>
        <p>
          I used to roll my eyes at rustc&apos;s THIR sitting between HIR and MIR. Then I followed one method call
          through the compiler: type checking had resolved the method and inserted implicit dereferences, while
          MIR wanted simple typed statements and explicit control-flow edges. THIR is where that semantic debt
          gets paid once instead of leaking into every MIR construction path.
        </p>
        <p>
          <a href="https://mlir.llvm.org/docs/Rationale/Rationale/">MLIR</a> makes the same argument openly. Its
          progressive lowering keeps tensors, loop nests, and data layouts visible while high-level
          transformations can still use them. Once pointers and branches replace those structures, a backend
          close to assembly cannot reliably reconstruct them — it would be reverse-engineering its own output.
        </p>
        <p>
          Some IRs really are historical sediment, and I have not measured what each layer costs in compile
          time or maintenance. When two adjacent representations express the same invariants, one of them is
          a deletion candidate. My claim is only that the count by itself does not tell you which.
        </p>
        <p>
          “Just one more IR!” Fine. Without the extra boundary, the borrow checker starts learning spill slots
          or the register allocator starts fielding questions about exhaustive patterns.
        </p>
        <p>
          My dump directory still contains <code>max2.c.006t.gimple</code>,
          <code> max2.c.253r.expand</code>, <code>max2.ll</code>, and <code>max2.s</code>. The assembly is the
          shortest file. The moment I was trying to understand happened two representations earlier, before
          either compiler had chosen a register.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
