import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, H2, Prose } from "../../components";

export const article = {
  title: "The edge case has a derivation",
  description:
    "Reducing JavaScript’s [] == ![] produces a deterministic chain of coercion rules and identifies where code should reject the default conversion.",
  published: "2026-07-15T10:30:00Z",
  author: "Elias North",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/the-edge-case-has-a-derivation.jpg",
    alt: "Two coils of five-hole and eight-hole punched paper tape, one pale yellow and one pink, resting on a white surface.",
    credit: {
      author: "TedColes",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:PaperTapes-5and8Hole.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const coercionDerivation = `
  [] == ![]
  [] == false
  [] == 0
  "" == 0
  0 == 0
  true
`;

const boundaryExamples = `
  [] === false // false: equality does not convert either operand

  const text = input.trim();
  if (text === "") throw new Error("number is empty");

  const value = Number(text);
  if (!Number.isFinite(value)) throw new Error("invalid number: " + input);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          <code>[] == ![]</code> is <code>true</code>, and every few months a screenshot of it makes the rounds
          again as proof that JavaScript is random. I have real affection for this expression, because the
          screenshot take gets it exactly backwards: the runtime never guesses. Six mechanical steps connect the
          left side to the right, and every one of them has a spec section you can point at.
        </p>
        <AnnotatedCode
          lang="js"
          title="reduction.js"
          code={coercionDerivation}
          notes={[
            {
              line: 2,
              note: (
                <>
                  Precedence runs the negation before equality ever looks.{" "}
                  <a href="https://tc39.es/ecma262/#sec-toboolean">ToBoolean</a> treats every object as
                  truthy, an empty array included, so <code>![]</code> collapses to plain <code>false</code>.
                </>
              ),
            },
            {
              line: 3,
              note: (
                <>
                  <a href="https://tc39.es/ecma262/#sec-islooselyequal">IsLooselyEqual</a> now sees an object
                  and a Boolean, and its Boolean rule converts <code>false</code> to positive zero.
                </>
              ),
            },
            {
              line: 4,
              note: (
                <>
                  The object-versus-number rule asks the array for a primitive. The inherited{" "}
                  <code>valueOf</code> fails politely — it returns the array itself, no primitive at all — so
                  conversion falls through to{" "}
                  <a href="https://tc39.es/ecma262/#sec-array.prototype.tostring">
                    <code>Array.prototype.toString</code>
                  </a>
                  , and an empty array joins to the empty string.
                </>
              ),
            },
            {
              line: 5,
              note: (
                <>
                  The string-to-number grammar maps an empty or whitespace-only string to positive zero, and{" "}
                  <code>0 == 0</code> closes the derivation.
                </>
              ),
            },
          ]}
          caption="The full reduction: each line follows from the one above by a single spec rule."
        />
        <p>
          Loose equality has earned its criticism — hiding this much machinery behind two characters is rude to
          everyone who reads the code later. But the derivation is where the value is, because the step that
          should actually worry you also names the boundary your program ought to make explicit.
        </p>

        <H2>Negation runs first</H2>
        <p>
          An empty array, truthy? Yes — truthiness here follows object identity, and a container does not
          inherit the emptiness of what it holds. Because the first rewrite happens before equality, the two
          array literals never meet as arrays: a direct <code>[] == []</code> is false, since that compares two
          distinct references, but here the right side has already become a Boolean before equality begins. Anyone
          reasoning about this as an array-to-array comparison has started one operation too late.
        </p>

        <H2>Equality changes the operands</H2>
        <p>
          Everything below the second line is IsLooselyEqual working through its case list, one rewrite per
          step, until two values of one type remain. The step that should worry you is the fourth: a
          comparison operator just parsed a string, silently, on its way to answering a different question.
        </p>

        <H2>The derivation points to the repair</H2>
        <p>
          Each conversion above is individually specified and individually reasonable. Composed, they make a
          hostile review surface, because a reader has to run a small interpreter in their head to learn which
          values are finally compared. Strict equality stops before the chain starts, and explicit conversion
          gives the policy a call site.
        </p>
        <CodeBlock lang="js" title="boundary.js" highlight="1,3-7" code={boundaryExamples} />
        <p>
          Writing <code>Number(input)</code> and calling it a day would keep the surprising part, since the
          empty string still converts to zero. So the boundary carries a policy as well as a call: reject empty
          text before converting, reject non-finite results after, and put the offending input in the error. Code
          past this point uses <code>===</code> and never volunteers to parse anything.
        </p>
        <p>
          The policy is a choice, and other programs choose differently — a spreadsheet that wants blank cells
          to mean zero can adopt the specification&apos;s conversion on purpose. The derivation pays for itself
          either way, because the blank-means-zero behavior becomes a decision with a name on it rather than a
          side effect of <code>==</code>.
        </p>
        <p>
          When the expression turns up in a console, the final line is the boring part — two numeric zeroes,
          equal as promised. The alarm lives four lines up, where a comparison operator volunteered to parse an
          empty string, and that is the line your input boundary exists to delete.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
