import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, CodeTabs, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The processor’s instruction sheet",
  description:
    "Decoding the VisionFive 2’s RV64GC listing shows which facts describe the RISC-V instruction set and which describe the processor implementing it.",
  published: "2026-07-15T00:14:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-processors-instruction-sheet.jpg",
    alt: "A hand holds a small exposed RISC-V prototype chip mounted in a black carrier.",
    credit: {
      author: "Derrick Coetzee",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Yunsup_Lee_holding_RISC_V_prototype_chip.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const boardListing = `
  Board:      VisionFive 2
  Processor:  StarFive JH-7110
  CPU:        RISC-V quad-core plus monitor core
  ISA:        RV64GC
  Clock:      up to 1.5 GHz
  L2 cache:   2 MB
`;

const isaParts = [
  [<code key="rv64">RV64</code>, "64-bit base integer register width and address space", "Width of the software-visible base"],
  [<code key="g">G</code>, "I, M, A, F, D, Zicsr, and Zifencei", "General-purpose instruction bundle"],
  [<code key="c">C</code>, "16-bit encodings for common instructions", "A compressed instruction extension"],
] as const;

const cAdd = `
  long add_two(long a, long b) {
      return a + b;
  }
`;

const riscvAdd = `
  add_two:
      add a0, a0, a1
      ret
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Here is the processor row from StarFive&apos;s VisionFive 2 product brief: a JH-7110, four CPU cores
          plus a monitor core, an <code>RV64GC</code> ISA, a clock up to 1.5 GHz, 2 MB of L2 cache. Quick
          question before you buy the board — which of those six facts says what your binary may contain, and
          which say how long it will take to run?
        </p>
        <CodeBlock lang="text" title="VisionFive 2 product brief" highlight="2-6" code={boardListing} />
        <p>
          The brief prints them in one row as if they were the same kind of fact, and they are not even close.{" "}
          <code>RV64GC</code> is a contract about vocabulary — which instructions exist and what they mean. The
          JH-7110 is one particular machine that signed the contract, and every performance-shaped number in the
          row belongs to it, never to the four letters.
        </p>

        <H2>Decode the letters</H2>
        <p>
          The letters reward decoding, and the official{" "}
          <a href="https://docs.riscv.org/reference/isa/unpriv/naming.html">naming convention</a> is short:
          a base, then extensions. <code>G</code> is shorthand for the general-purpose collection{" "}
          <code>IMAFDZicsr_Zifencei</code>, and <code>C</code> adds compressed encodings.
        </p>
        <DataTable
          head={["Listing fragment", "Specified capability", "What it tells software"]}
          rows={isaParts}
          caption="RV64GC names a 64-bit base plus general-purpose and compressed instruction extensions."
        />
        <p>
          What the letters actually decide is whether a binary&apos;s instructions belong to this machine&apos;s
          vocabulary. Compile something that assumes the vector extension and this board will refuse you — the
          listing says <code>GC</code>, and no amount of 64-bitness smuggles a <code>V</code> in.
        </p>
        <p>
          Take <code>C</code>, the extension that sounds most like a feature. It changes encodings, letting
          common operations use 16-bit instruction words beside the base 32-bit ones, which can shrink code —
          whether that speeds anything up depends on this chip&apos;s fetch and decode, which the letter says
          nothing about. The letter buys compatibility.
        </p>
        <p>
          <code>G</code> is the same shape of promise, wider: integer multiplication, atomics, both floating-point
          widths, control-register access, instruction-fetch fencing. A compiler learns those words exist
          together on this target. How fast the JH-7110 pronounces them appears nowhere in the name.
        </p>

        <H2>One sheet, many machines</H2>
        <p>
          Nothing in those letters belongs to StarFive. RISC-V International publishes the instruction sheet and
          deliberately stops there — the{" "}
          <a href="https://riscv.org/blog/risc-v-an-open-standard-instruction-set-architecture/">
            standards body describes the ISA as a protocol
          </a>{" "}
          between software and hardware, and a core implementing it may be open source or entirely proprietary.
          The open part is the contract, the way USB is open while the controllers inside remain somebody&apos;s
          trade secret.
        </p>
        <p>
          An alphabet this flexible cuts both ways, because a Linux distribution cannot negotiate letters with
          every board it might boot on. Profiles exist for exactly that:{" "}
          <a href="https://docs.riscv.org/reference/rva23/v1.0/rva23-profiles.html">RVA23</a> bundles the
          extensions an application processor must supply together — the vector extension finally among the
          mandatory ones — so a distribution targets one profile name and the letter arithmetic becomes the
          vendor&apos;s problem.
        </p>

        <H2>See the contract at one call boundary</H2>
        <p>
          The contract is easiest to respect when you watch it work at a single call boundary. Two arguments in,
          one addition, one return:
        </p>
        <CodeTabs labels={["C", "RISC-V assembly"]}>
          <CodeBlock lang="c" title="add.c" code={cAdd} />
          <CodeBlock lang="asm" title="add.s" highlight="2-3" code={riscvAdd} />
        </CodeTabs>
        <p>
          The <a href="https://riscv-non-isa.github.io/riscv-elf-psabi-doc/">procedure-call ABI</a> puts the
          first two integer arguments in <code>a0</code> and <code>a1</code> and the return value back in{" "}
          <code>a0</code>, so <code>add a0, a0, a1</code> followed by <code>ret</code> is the whole function.
          Your compiler may emit something slightly different, but separately compiled code has to share this
          register agreement or nothing links.
        </p>
        <p>
          Everything else is left to whoever builds the core: in-order or out-of-order pipeline, cache sizes,
          execution width, fabrication process, power budget. Two processors can run this exact binary and take
          wildly different amounts of time, and both are keeping the contract.
        </p>
        <p>
          Even the row&apos;s honest performance facts — four cores, 1.5 GHz — leave your question unfinished. A
          single-threaded parser probably cares more about branch prediction and memory latency than about the
          three cores it leaves idle, and &quot;up to 1.5 GHz&quot; is a ceiling, not a measurement of anything.
        </p>
        <p>
          StarFive&apos;s fuller{" "}
          <a href="https://doc-en.rvspace.org/VisionFive2/Product_Brief/VisionFive_2/specification_pb.html">
            board specification
          </a>{" "}
          adds detail beside the ISA, and it still does not disclose enough to predict your workload. So the
          purchase decision ends where it always ends, with a stopwatch and your own program.{" "}
          <code>RV64GC</code> settles one thing only: the binary gets through the door.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
