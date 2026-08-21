import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Friction where damage starts",
  description:
    "Developer tools prevent predictable errors when the safe path stays easy, damaging actions demand explicit intent, and escape hatches still expose the model programmers need to learn.",
  published: "2026-07-11T22:47:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/friction-where-the-damage-starts.jpg",
    alt: "A round red fire alarm call point whose button sits behind a flip-up cover labeled push to open.",
    credit: {
      author: "Drb400atx",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Proprietary-type_fire_alarm_manual_call_point.JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const retryBoundary = `
  type PostOptions =
    | { retry?: false; idempotencyKey?: string }
    | {
        retry: { attempts: 2; when: "transport-failure" };
        idempotencyKey: string;
      };

  const options = {
    retry: { attempts: 2, when: "transport-failure" },
    idempotencyKey: order.id,
  } satisfies PostOptions;

  await http.post("/charges", charge, options);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          I once helped maintain an internal deploy command called <code>ship</code>. Its nicest feature
          was that you rarely had to name an account: the command reused whichever cloud profile happened
          to be active in your shell, so staging and production looked almost identical on the command
          line. One afternoon I watched a teammate request a production plan while intending to inspect
          staging.
        </p>
        <p>
          The plan was read-only, so nothing changed, but I had a diagnosis ready anyway: more
          confirmation prompts. I added them to deploys, rollbacks, log tails, and a few inspection
          commands that could not modify anything. Within a week, people typed <code>y</code> before the
          prompt finished drawing — why was a log tail asking whether I was sure? Friction only helps
          when it sits where the damage starts and demands the fact that would prevent the failure, not
          another keystroke of agreement.
        </p>
        <p>
          The pattern generalizes. When the shortest command chooses an environment implicitly,
          wrong-environment incidents follow, and a client that retries every request automatically will
          eventually deliver the same purchase twice. The shortest path through a tool predicts a
          surprising amount of its bug queue.
        </p>
        <p>
          Alma Whitten and J. D. Tygar watched the ceremony side of this fail with PGP 5.0. In their
          1999{" "}
          <a href="https://www.usenix.org/legacy/events/sec99/full_papers/whitten/whitten.pdf">
            usability study
          </a>
          , the interface looked respectable by ordinary consumer-software standards, and given ninety
          minutes to sign and encrypt one message, most participants still failed. Their criteria for
          security software include one I keep returning to: people must remain willing to use the
          protection. A mechanism that prevents mistakes by exhausting everyone gets bypassed, automated
          away, or answered without attention.
        </p>

        <H2>Make the retry prove itself</H2>
        <p>
          HTTP clients show what the better kind of resistance looks like. The{" "}
          <a href="https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2">HTTP semantics standard</a>{" "}
          defines an operation as idempotent when repeating it has the same intended effect as sending it
          once, allows automatic retries for those operations after a communication failure, and warns
          clients away from retrying anything else unless they can prove the first attempt never applied.
        </p>
        <p>
          A client library can put friction directly on that uncertainty. Ordinary POST requests go
          through untouched, and the demand appears only when a caller asks for automatic retry:
        </p>
        <CodeBlock lang="ts" title="payments.ts" highlight="4-6,9-12" code={retryBoundary} />
        <p>
          The type leaves the protocol visible. A developer sees that the write is a POST, sees why the
          retry needs a key, and can drop to a lower-level client when an endpoint has different
          semantics. This is resistance that changes the request: the caller hands over the one fact that
          makes repetition safe.
        </p>
        <p>
          The fuse board in the photograph above is the physical version. Each fuse passes ordinary
          current until an overload opens its own circuit, while the neighboring circuits stay live. The
          resistance sits exactly where excess current would turn a local fault into wider damage.
        </p>

        <H2>The wrapper that ate the vendor</H2>
        <p>
          Our <code>ship</code> command failed the other half of the test. It started as a thin way to
          pass an account and revision to the provider, then acquired authentication, retries, manifest
          generation, rollout polling, and its own error vocabulary. A provider response containing a
          request ID and a failed health check emerged as <code>rollout failed</code>.
        </p>
        <p>
          During one stalled release, I spent most of the incident bypassing our own wrapper so I could
          recover the upstream request ID. Two teammates had never run the provider command directly,
          because the internal guide treated that path as an implementation detail. Routine deploys had
          become effortless, and nobody had a vocabulary left for a deploy that stopped being routine.
        </p>
        <p>
          Lisanne Bainbridge described this trap in 1983. Her paper{" "}
          <a href="https://www.sciencedirect.com/science/article/pii/0005109883900468">
            “Ironies of automation”
          </a>{" "}
          argues that automation can expand the human operator&apos;s problems when people retain
          responsibility mainly for abnormal conditions. The machine keeps the situations that provide
          practice, then hands the rare and confusing cases to someone whose feedback loop went quiet
          long ago.
        </p>
        <p>
          I cannot separate the wrapper&apos;s effect from turnover and ordinary forgetting, but our
          incident notes kept ending with the same instruction: bypass <code>ship</code> to see the real
          error. That was enough evidence to stop adding features to it.
        </p>
        <p>
          We also took the prompts off the read path entirely. The rebuilt command treats its three paths
          differently:
        </p>
        <Compare
          attributes={["Demands", "Prints", "Records"]}
          entities={[
            {
              name: "Read path",
              values: [
                "Nothing — log tails, status checks, and plan generation run unprompted",
                null,
                null,
              ],
            },
            {
              name: "Production write",
              values: [
                "The environment, named in the command",
                "The exact provider operation, before it runs",
                "Provider object names, request IDs, raw plans, and the equivalent upstream command",
              ],
            },
            {
              name: "Break-glass",
              values: [
                "An explicit flag that bypasses the policy checks",
                "The upstream command",
                "Who used it",
              ],
            },
          ]}
          caption="Each path through the rebuilt ship command. The read column's empty cells are deliberate."
        />
        <p>
          Last month I tried to delete the wrapper&apos;s custom rollout parser. An old CI job still
          depended on an undocumented <code>phase</code> field, so part of the parser went back in. The
          field is now called <code>vendorRolloutPhase</code>, and the raw provider status sits beside
          it. I still cannot remove that parser without breaking somebody&apos;s build.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
