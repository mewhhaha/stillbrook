import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, CodeTabs, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The call was cheaper",
  description:
    "A controlled inline benchmark shows how disassembly and code size can explain a performance result that call-count intuition gets wrong.",
  published: "2026-07-15T10:30:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-call-was-cheaper-journal.webp",
    alt: "A hand press beside a crowded row of duplicate carved blocks.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const transformSource = `
  template <std::size_t Kind>
  __attribute__((noinline))
  std::uint64_t invoke_transform(std::uint64_t value, std::uint64_t key) {
    return transform(value, key, Kind);
  }

  constexpr auto transformTable =
    make_transform_table(std::make_index_sequence<1024>{});

  for (std::uint64_t index = 0; index < 30'000'000; ++index) {
    const auto slot = (index * 2654435761U) & 1023;
    checksum ^= transformTable[slot](checksum + index, index | 1);
  }
`;

const inlinedAssembly = `
  <invoke_transform<513>>:
    xorq    %rsi, %rdi
    imulq   %rdi, %rax
    rorxq   $0x33, %rax, %rax
    addq    $0x201, %rax
    # twelve more instructions from transform
    retq
`;

const outlinedAssembly = `
  <invoke_transform<513>>:
    movl    $0x201, %edx
    jmp     <transform>
`;

const measurementCommands = `
  clang++ main.cpp -std=c++20 -O3 -march=native \
    -DINLINE_VARIANT=1 -o inline
  clang++ main.cpp -std=c++20 -O3 -march=native \
    -DINLINE_VARIANT=0 -o outlined
  size inline outlined
  llvm-objdump --demangle --no-show-raw-insn -d inline
`;

const benchmarkResults = [
  ["Median of seven runs", "288.6 ms", "200.9 ms"],
  ["Executable text", "153,275 bytes", "71,499 bytes"],
  ["Checksum", "5086929079838441426", "5086929079838441426"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Force a hot function inline at all 1,024 of its call sites and the program gets slower. Not subtly
          slower — the forced-inline build in this fixture took 288.6 milliseconds against 200.9 for the build
          that kept the function out of line, same source, same flags, same checksum, alternating on one pinned
          CPU. The version that removed thirty million calls lost by 44 percent.
        </p>
        <p>
          What I like about this result is how the argument ends. You can trade intuitions about call overhead
          all afternoon, but the generated program is sitting right there, willing to testify: one wrapper&apos;s
          disassembly, one text-section number, and a fixture small enough that you can rerun it and tell me
          I&apos;m wrong.
        </p>

        <H2>Hold the work still</H2>
        <p>
          The fixture wraps one integer transform in 1,024 template instantiations, then hops between them
          through a deterministic table permutation, 30 million dispatches per run. One binary forces the
          transform inline; the other forbids it. Everything else stays fixed.
        </p>
        <CodeBlock lang="cpp" title="benchmarks/inlining/main.cpp" highlight="1-6,8-13" code={transformSource} />
        <p>
          The recorded run used Clang 22.1.6 with <code>-O3 -march=native</code> and no LTO, on an AMD Ryzen 7
          7800X3D running Linux x86-64 — each binary warmed once, then seven alternating samples pinned to
          logical CPU zero. The full fixture and the raw nanosecond samples live in the repository&apos;s{" "}
          <a href="https://github.com/mewhhaha/stillbrook/tree/main/benchmarks/inlining">benchmark directory</a>,
          so none of the numbers below have to be taken on faith.
        </p>
        <DataTable
          head={["Observation", "Forced inline", "Outlined"]}
          rows={benchmarkResults}
          caption="The outlined build kept the checksum while cutting both elapsed time and executable text in this fixture."
        />
        <p>
          Each guardrail exists to close an escape route. The checksum rejects a fast wrong program, alternation
          smooths out temperature and background drift, and the disclosed flags keep a generic build from
          impersonating the recorded one. Even so, this establishes what happened on one processor with one
          compiler — nothing grander.
        </p>

        <H2>Ask the binary what changed</H2>
        <p>
          Counting calls at the source level, the inlined build should have won. The disassembly points at a
          different suspect. Wrapper 513 in the forced build carries the transform&apos;s entire arithmetic,
          constants specialized for its template argument; the outlined wrapper is two instructions long.
        </p>
        <CodeTabs labels={["Forced inline", "Outlined"]}>
          <CodeBlock lang="asm" title="inline.asm" code={inlinedAssembly} />
          <CodeBlock lang="asm" title="outlined.asm" code={outlinedAssembly} />
        </CodeTabs>
        <p>
          So specialization saved some argument shuffling and paid for it by pasting nearly the same instruction
          sequence into every one of the 1,024 wrappers. GNU <code>size</code> puts the bill at 153,275 text
          bytes against 71,499. The dispatch table deliberately bounces between distant wrappers, which asks the
          instruction side of the processor to keep twice the code warm — and that, on this machine, is where the
          88 milliseconds went.
        </p>
        <p>
          The toolchains already hedge here, if you read them closely. LLVM&apos;s{" "}
          <a href="https://llvm.org/docs/Remarks.html">optimization remarks</a> will happily report that a call
          was inlined and why, without ever promising the program got faster, and the{" "}
          <a href="https://doc.rust-lang.org/reference/attributes/codegen.html#the-inline-attribute">
            Rust reference
          </a>{" "}
          says outright that every form of <code>#[inline]</code> is a hint and poor choices can slow a program
          down. The people who built the attribute do not trust it unsupervised. Why would you?
        </p>

        <H2>Keep the claim inside the fixture</H2>
        <p>
          To be fair to inlining: this benchmark was built to punish duplicated code, and it says nothing about
          the tiny accessor in one hot loop, where inlining exposes constant folding and deletes far more work
          than it adds. Reduce the wrapper count, reorder the dispatch, enable LTO, or move to another processor
          and the gap may shrink or flip. I would expect it to.
        </p>
        <p>
          That fragility is exactly why the rerun kit matters: source, compiler version, flags, warm-up and
          sample order, CPU placement, checksum, and the two artifacts the explanation leaned on — code size and
          disassembly. Miss one and &quot;inlining regressed performance&quot; is a story with too many exits.
        </p>
        <CodeBlock lang="sh" title="inspect.sh" code={measurementCommands} />
        <p>
          The two instructions that settle the experiment belong to the winning build. In the smaller
          binary, <code>invoke_transform&lt;513&gt;</code> loads <code>0x201</code> and jumps to{" "}
          <code>transform</code>, and that jump survived because, for this table and this machine, its five bytes
          were cheaper than another copy of the answer.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
