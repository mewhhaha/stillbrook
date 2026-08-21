import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, CodeTabs, FlowSequence, H2, MemoryBoxes, Prose } from "../../components";

export const article = {
  title: "The function with a backpack",
  description:
    "Follow one counter closure through lowering: a code pointer paired with an environment record, a lifetime decided by escape, and an optimizer trying to unpack the bag.",
  published: "2026-07-13T09:46:00Z",
  author: "Elias North",
  tags: ["software"],
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const counterSource = `
  function makeCounter() {
    let count = 0;

    return {
      next: () => ++count,
      read: () => count,
    };
  }

  const counter = makeCounter();
  counter.next();
  counter.read(); // 1
`;

const counterLowered = `
  record CounterEnvironment { count: number }
  record Closure { code: function, environment: pointer }

  function next_code(env: *CounterEnvironment) {
    env.count += 1;
    return env.count;
  }

  function read_code(env: *CounterEnvironment) {
    return env.count;
  }

  function makeCounter() {
    env = allocate CounterEnvironment { count: 0 };
    return {
      next: Closure { code: next_code, environment: env },
      read: Closure { code: read_code, environment: env },
    };
  }
`;

const closurePath = [
  { title: "Find the free binding", detail: "Both inner functions use count from makeCounter." },
  { title: "Build one environment", detail: "The mutable binding becomes a shared field." },
  { title: "Return two closures", detail: "Each value pairs code with the same environment pointer." },
  { title: "Prove what can disappear", detail: "Inlining or escape analysis may remove the pair at known call sites." },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          You can write closures for a decade without ever being asked where <code>count</code> lives. The counter
          below is the interview classic: two arrows share one variable, and the function that created it returns
          before either arrow runs. Shared, and outliving its frame — those two facts are the entire puzzle a
          compiler has to solve.
        </p>
        <CodeBlock lang="js" title="counter.js" highlight="2,5-6,10-12" code={counterSource} />
        <p>
          The backpack in the title is the answer in one image. A closure is code that travels with a small bag of
          the variables it could not leave behind, and once you follow this one counter through lowering, the
          magic evaporates into two decisions: what goes in the bag, and how long the bag has to live.
        </p>

        <FlowSequence steps={closurePath} caption="One captured binding moves from lexical scope into a shared environment, then becomes an optimization question." />

        <H2>Lower the free binding</H2>
        <p>
          Relative to each arrow, <code>count</code> is free — the arrow uses the name without binding it. A
          closure-conversion pass lifts each body into an ordinary function that takes an explicit environment
          parameter, then pairs that function&apos;s address with the environment it needs.
        </p>
        <CodeTabs labels={["Source", "Possible closure IR"]}>
          <CodeBlock lang="js" title="counter.js" highlight="1-8" code={counterSource} />
          <CodeBlock lang="text" title="closure.ir" highlight="1-10,12-18" code={counterLowered} />
        </CodeTabs>
        <p>
          Both closure records point at the same <code>CounterEnvironment</code>, and they have to. Give each
          record its own copy of zero and the syntax survives while the program quietly breaks —{" "}
          <code>next</code> would increment a count that <code>read</code> never sees.
        </p>
        <MemoryBoxes
          title="Two closure records sharing one counter environment"
          boxes={[
            {
              id: "next",
              label: "next: Closure",
              fields: [
                { name: "code", value: "next_code" },
                { name: "environment", pointsTo: "env" },
              ],
            },
            {
              id: "read",
              label: "read: Closure",
              fields: [
                { name: "code", value: "read_code" },
                { name: "environment", pointsTo: "env" },
              ],
            },
            {
              id: "env",
              label: "CounterEnvironment",
              fields: [{ name: "count", value: "0 → 1" }],
            },
          ]}
          caption="After one counter.next(), the field both environment pointers reach already holds 1."
        />
        <p>
          What forces this is the mutation. If both arrows only read some constant, the compiler could hand each
          closure a private copy and nobody could tell the difference. <code>++count</code> writes the binding
          itself, so the capture must behave like a place, not a value.
        </p>
        <p>
          The specification pins down only the relationship: a function object carries an{" "}
          <a href="https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects">
            <code>[[Environment]]</code> internal slot
          </a>{" "}
          linking it to the scope it closed over. Context object, stack slot, register, folded constant — an
          engine may pick any representation that preserves the behavior.
        </p>

        <H2>The return changes the lifetime</H2>
        <p>
          <code>makeCounter</code> finishes while the returned object is still reachable, so storage left in its
          stack frame would dangle. An ordinary implementation moves the environment to managed memory instead;
          V8&apos;s <a href="https://v8.dev/blog/preparser">preparser write-up</a> shows the engine tracking
          exactly which outer variables inner functions use, to tell stack locations from context locations.
        </p>
        <p>
          From then on, lifetime follows the bag rather than the call. Keep either returned closure alive and the
          environment stays; drop them both and the collector may take it. There is no lifetime syntax anywhere in
          the source — the engine derives the boundary entirely from reachability.
        </p>
        <p>
          None of this means every closure costs a heap allocation. A closure that never escapes can keep its
          captures on the stack, and a compiler that can see the call target may pass <code>count</code> as a
          hidden argument. Escape is the conservative answer here only because the pair is returned to code the
          compiler cannot see.
        </p>

        <H2>The optimizer follows the trail backward</H2>
        <p>
          Now run the story in reverse. If a whole-program optimizer inlines <code>makeCounter</code> into a
          caller that invokes <code>next</code> and <code>read</code> immediately — never storing the object,
          never passing it to unknown code — the code pointers become known calls, escape analysis keeps the
          environment local, and scalar replacement turns the field back into one mutable variable. The bag gets
          unpacked into a plain <code>let</code> again.
        </p>
        <p>
          Whether your particular counter gets that treatment is nothing I would promise from the source alone.
          The specification guarantees behavior, never representation, and an unknown call, a debugger, or one
          stored reference is enough to keep the full pair around.
        </p>
        <p>
          Either way the destination is fixed. The final <code>counter.read()</code> reaches{" "}
          <code>read_code</code> through the environment pointer, into the same field <code>next_code</code>{" "}
          incremented — and whatever the optimizer managed to erase along the way, it still owes you the{" "}
          <code>1</code>.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
