import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Figure, H2, MessageThread, Prose } from "../../components";

export const article = {
  title: "Thirty-two bytes at once",
  description:
    "In stable Rust, a practical SIMD workflow keeps the scalar loop around as the oracle for one fenced AVX2 kernel and lets the benchmark decide whether the kernel survives.",
  published: "2026-07-11T17:29:17Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/thirty-two-bytes-at-once.jpg",
    alt: "Two eight-oared rowing crews pull side by side past a crowded shoreline during the men's eight final at the 1928 Amsterdam Olympics.",
    credit: {
      author: "Underwood & Underwood",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:1928_Summer_Olympics_men%27s_eight_finals,_U.S_beats_G.B,_photo_by_Underwood_%26_Underwood.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const scalarSad = `
  pub fn sad_scalar(a: &[u8], b: &[u8]) -> u64 {
      assert_eq!(a.len(), b.len());

      a.iter()
          .zip(b)
          .map(|(&x, &y)| x.abs_diff(y) as u64)
          .sum()
  }
`;

const dispatch = `
  pub fn sad(a: &[u8], b: &[u8]) -> u64 {
      assert_eq!(a.len(), b.len());

      #[cfg(target_arch = "x86_64")]
      if std::is_x86_feature_detected!("avx2") {
          // SAFETY: AVX2 was checked above.
          return unsafe { sad_avx2(a, b) };
      }

      sad_scalar(a, b)
  }
`;

const avx2Kernel = `
  #[cfg(target_arch = "x86_64")]
  #[target_feature(enable = "avx2")]
  unsafe fn sad_avx2(a: &[u8], b: &[u8]) -> u64 {
      use std::arch::x86_64::*;
      let mut sums = _mm256_setzero_si256();
      let mut i = 0;

      while i + 32 <= a.len() {
          let x = unsafe { _mm256_loadu_si256(a.as_ptr().add(i).cast()) };
          let y = unsafe { _mm256_loadu_si256(b.as_ptr().add(i).cast()) };
          sums = _mm256_add_epi64(sums, _mm256_sad_epu8(x, y));
          i += 32;
      }

      let mut lanes = [0_u64; 4];
      unsafe { _mm256_storeu_si256(lanes.as_mut_ptr().cast(), sums) };
      lanes.into_iter().sum::<u64>() + sad_scalar(&a[i..], &b[i..])
  }
`;

const tailTest = `
  #[cfg(target_arch = "x86_64")]
  #[test]
  fn avx2_handles_every_tail() {
      if !std::is_x86_feature_detected!("avx2") {
          return;
      }

      for len in 0_usize..97 {
          let a = (0..len).map(|i| (i * 17) as u8).collect::<Vec<_>>();
          let b = (0..len).map(|i| (i * 29 + 7) as u8).collect::<Vec<_>>();
          let got = unsafe { sad_avx2(&a, &b) };
          assert_eq!(got, sad_scalar(&a, &b), "len={len}");
      }
  }
`;

const benchmarkCommands = `
  cargo test --release
  RUSTFLAGS="-C target-cpu=native" cargo bench
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          SIMD tutorials love to open with a tour of register names. Skip that part. Your first SIMD
          program should start with a loop so boring that no iteration has any reason to care what the
          others did.
        </p>
        <p>
          Say you&apos;re comparing two grayscale image buffers with a sum of absolute differences. Each
          pixel pair produces one number, and nothing that happens at pixel 4,000 depends on pixel
          3,999 — which is about as SIMD-shaped as work gets.
        </p>
        <CodeBlock lang="rust" title="src/sad.rs" code={scalarSad} />
        <p>
          Keep this function even after you&apos;ve written the fast one. It&apos;s the fallback for
          machines without vector support, and it&apos;s the oracle that tells you whether the clever
          version still computes the same answer.
        </p>

        <H2>Vectorize the loop, not the story</H2>
        <p>
          SIMD means one instruction operating on several lanes at once. AVX2 gives this example a
          256-bit register, so a single load carries 32 <code>u8</code> values, and the{" "}
          <a href="https://doc.rust-lang.org/core/arch/x86_64/fn._mm256_sad_epu8.html">
            <code>_mm256_sad_epu8</code> intrinsic
          </a>{" "}
          computes all 32 absolute byte differences and hands back four partial sums.
        </p>
        <LaneMap />
        <Callout variant="tip" title="The shape test">
          <p>
            Reach for SIMD when the data is contiguous, the iterations are independent, the operation
            repeats, and the loop is hot enough to matter. Branch-heavy logic and tiny inputs
            don&apos;t pass this test, and that&apos;s fine — they&apos;re a different kind of work.
          </p>
        </Callout>
        <p>
          Before writing a single intrinsic, benchmark an optimized scalar build. Rustc already runs
          loop and SLP vectorization passes, and{" "}
          <a href="https://doc.rust-lang.org/rustc/codegen-options/index.html#target-cpu">
            <code>-C target-cpu=native</code>
          </a>{" "}
          lets a local benchmark target the exact processor underneath it. More than once I&apos;ve
          written the kernel first and then discovered the autovectorizer had gotten there already.
          Sometimes the boring loop already won.
        </p>

        <H2>Fence the unsafe</H2>
        <p>
          Don&apos;t compile the whole program for AVX2 unless every machine you deploy to actually has
          it. Dispatch once, and keep the architecture-specific code behind one private function.
        </p>
        <CodeBlock lang="rust" title="src/sad.rs" highlight="4-8" code={dispatch} />
        <p>
          The{" "}
          <a href="https://doc.rust-lang.org/std/macro.is_x86_feature_detected.html">
            runtime feature check
          </a>{" "}
          is what makes the unsafe call sound: the public function stays portable, and a machine
          without AVX2 quietly takes the scalar path instead.
        </p>
        <CodeBlock lang="rust" title="src/sad.rs" highlight="2,8-12,15-17" code={avx2Kernel} />
        <p>
          The loop loads 32 bytes from each slice. The{" "}
          <a href="https://doc.rust-lang.org/core/arch/x86_64/fn._mm256_loadu_si256.html">
            unaligned load
          </a>{" "}
          takes ordinary slice addresses, so you don&apos;t have to redesign your allocation to make it
          happy. Four partial sums accumulate in the vector as the loop runs, and whatever bytes are
          left over after the last full block go through the scalar oracle.
        </p>
        <p>
          Stable Rust exposes these target-specific intrinsics through{" "}
          <a href="https://doc.rust-lang.org/std/arch/index.html"><code>std::arch</code></a>. The nicer{" "}
          <a href="https://doc.rust-lang.org/std/simd/index.html"><code>std::simd</code> API</a>{" "}
          is still nightly-only in Rust 1.97, which is a shame. But it also makes containment worth
          the trouble: keep the ugly code private now and you can swap the kernel out later without
          touching a single caller.
        </p>

        <H2>Prove the edges</H2>
        <p>
          SIMD bugs hide at the widths: zero, one, 31, 32, 33. Every one of these bugs I&apos;ve
          written lived in the tail. Test the optimized function against the scalar one across every
          remainder before you spend any time admiring the assembly.
        </p>
        <CodeBlock lang="rust" title="src/sad.rs" highlight="8-12" code={tailTest} />
        <p>
          Then benchmark at more than one size. A buffer smaller than a single vector shows you what
          the dispatch costs; a buffer too big for cache tells you what the memory bus thinks of your
          kernel.
        </p>
        <CodeBlock lang="sh" code={benchmarkCommands} />
        <p>
          Use <code>target-cpu=native</code> only when the benchmark binary runs on that same machine —
          a binary you ship to other people still needs the runtime dispatch. And compare throughput,
          not register width. A wider instruction can still lose, to dispatch overhead or to a memory
          bus that was never going to feed it that fast.
        </p>
        <MessageThread
          caption="Wide registers still wait on memory."
          messages={[
            { from: "Developer", text: "Eight lanes." },
            { from: "Benchmark", text: "Show me." },
            { from: "Memory bandwidth", text: "I set the pace." },
          ]}
        />
        <p>
          From the outside, none of this should look interesting. Callers see one safe function, the
          unsafe kernel stays behind its fence, and the scalar loop keeps its job as the answer key.
          If the benchmark can&apos;t find a real speedup, delete the kernel and move on; the loop was
          always correct.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

const laneGroups = [
  { range: "0–7", sum: "partial 0" },
  { range: "8–15", sum: "partial 1" },
  { range: "16–23", sum: "partial 2" },
  { range: "24–31", sum: "partial 3" },
] as const;

function LaneMap() {
  return (
    <Figure caption="One AVX2 operation compares 32 byte pairs and reduces them into four partial sums.">
      <div
        role="img"
        aria-label="A 256-bit AVX2 register split into four groups of eight byte lanes, each producing one partial sum."
        className="rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
          <span>256-bit register</span>
          <span>32 × u8</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {laneGroups.map((group, groupIndex) => (
            <div
              key={group.range}
              className="rounded-xl border border-zinc-950/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="grid grid-cols-8 gap-1" aria-hidden="true">
                {Array.from({ length: 8 }, (_, lane) => (
                  <span
                    key={lane}
                    className="aspect-square rounded-sm border border-orange-500/30 bg-orange-50 dark:bg-orange-950/20"
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-zinc-500">bytes {group.range}</span>
                <span className="text-orange-700 dark:text-orange-400">
                  → {laneGroups[groupIndex].sum}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
