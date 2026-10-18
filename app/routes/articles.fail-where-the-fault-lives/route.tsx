import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Fail where the fault lives",
  description:
    "Fail-fast is a debugging rule about exposing faults near their cause; reliable systems contain the damage there and make recovery explicit rather than crashing broadly.",
  published: "2026-07-11T17:20:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/fail-where-the-fault-lives-journal.webp",
    alt: "A cracked vial spills into its own brass basin while neighboring jars remain upright.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const boundaries = `
  const config = Config.parse(process.env);
  if (!config.ok) throw new Error(config.error.message);

  for await (const message of messages) {
    const order = Order.parse(message);

    if (!order.ok) {
      await rejected.write({ message, error: order.error });
      continue;
    }

    await dispatch(order.value);
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          “Fail fast” starts out as debugging advice. Somewhere along the way it escapes the function
          body and turns into a management reflex — reject the idea, kill the process, restart the
          service, pivot the team — as if the shorter the gap between attempt and failure, the more
          disciplined the work must be.
        </p>
        <p>
          That isn&apos;t what the original technique promises. Jim Shore&apos;s 2004{" "}
          <a href="https://martinfowler.com/ieeeSoftware/failFast.pdf">article on fail-fast software</a>{" "}
          says plainly that it may not reduce the number of bugs at first. What it does is make the bugs
          you have easier to find, because they surface immediately and close to their cause. The same
          article recommends a global error handler, so the application as a whole can recover or keep
          going when the failing unit allows it.
        </p>
        <p>
          Fail fast is a locality rule, not a speed goal. Catch the violated assumption while the program
          still holds the evidence to explain it, then decide what&apos;s actually invalid — one value, one
          message, the whole process, or something in between. Stopping more than that buys you nothing
          but collateral damage.
        </p>

        <H2>The boundary decides what dies</H2>
        <p>
          The same validation error deserves a different response depending on where it turns up. Missing
          configuration at startup means the process can&apos;t do its job at all. A malformed message in a
          queue means one work item can&apos;t be trusted, while the ten thousand behind it are probably
          fine. Calling both “fail fast” skips past the only decision worth making here.
        </p>
        <CodeBlock lang="ts" title="worker.ts" highlight="2,7-10" code={boundaries} />
        <p>
          Both failures surface immediately, but only the first one stops the process. The configuration
          is a precondition for everything the worker will ever do. The bad message has a natural
          containment boundary: write it to a rejected queue where someone can inspect it later, and move
          on to the next one.
        </p>
        <p>
          Silent defaults are the more familiar sin — they move the error away from its cause, and you
          find out three services downstream. Crashing the whole process over one bad message makes the
          opposite mistake, treating local invalidity as global corruption. The narrowest boundary that
          still preserves a truthful state is where the failure belongs.
        </p>

        <H2>A crash needs someone waiting</H2>
        <p>
          Erlang&apos;s reputation for “letting it crash” rests on the half of the sentence people leave
          out: the crash happens under supervision. The official{" "}
          <a href="https://www.erlang.org/doc/system/sup_princ.html">OTP supervision principles</a>{" "}
          describe supervisors whose whole job is to watch child processes and deal with the ones that
          die. A <code>one_for_one</code> strategy restarts only the child that terminated, and restart
          intensity limits keep a broken child from dying forever in a tight loop — past a threshold, the
          failure escalates to a higher-level supervisor instead.
        </p>
        <p>
          Failure stays ordinary here because recovery lives outside the component whose state went bad.
          Take away the isolation and the owner for the restart, and “let it crash” is an outage with a
          slogan attached.
        </p>
        <p>
          George Candea and Armando Fox tested this boundary directly in an eBay-like auction service. In
          their{" "}
          <a href="https://arxiv.org/abs/cs/0403007">study of fine-grained microreboots</a>, restarting a
          component instead of the server process cut failed user requests by 65 percent and perceived
          downtime by 78 percent in their experiments. All they changed was the size of the recovery
          unit.
        </p>

        <H2>Fast retries manufacture another failure</H2>
        <p>
          An immediate error helps when the caller knows what to do with it. It turns dangerous when the
          caller&apos;s only policy is to try again right away — the second request consumes the same
          resources while whatever rejected the first is probably still true. I&apos;ve written that loop
          myself more times than I&apos;d like: three attempts, no backoff, no theory of what will be
          different on the second try.
        </p>
        <p>
          Google&apos;s{" "}
          <a href="https://sre.google/sre-book/handling-overload/">guidance for handling overload</a>{" "}
          treats retries as extra load, full stop. A three-attempt budget can push traffic toward three
          times the original request rate before broader retry limits kick in, and when several layers
          each retry the layer below them, the growth turns combinatorial. Their answer is to confine the
          retry to the layer immediately above the rejecting dependency, bounded by both per-request and
          per-client budgets.
        </p>
        <p>
          Sometimes the correct response is a degraded result, or a quota error for one customer while
          everyone else carries on. Sometimes the error genuinely has to travel all the way back to the
          user. A quick rejection protects a system only when the callers around it respect its scope.
        </p>

        <H2>Failure is a complete event</H2>
        <p>
          “Just fail” means letting a failure become one complete, useful event. Signal it near the
          cause. Stop the smallest unit whose state can no longer be trusted, keep enough context around
          to reproduce the problem, and leave durable state coherent. Retry only when something has
          actually changed — more time, freed capacity, a different route, different input — and put a
          budget on the attempts.
        </p>
        <DataTable
          head={["Fault kind", "Mechanism", "Who acts next"]}
          rows={[
            ["Impossible internal state", "Assertion with the violated values", "The programmer holding the crash evidence"],
            ["Expected business refusal", "Typed error", "The caller that understands the request"],
            ["Poisoned queue message", "Rejection record", "An operator inspecting that message"],
            ["Untrusted worker state", "Supervised restart", "The supervisor, then the service owner"],
            ["Overloaded dependency", "Admission control and retry budget", "The caller after capacity or time changes"],
          ]}
          caption="The fault boundary chooses both the mechanism and the next actor."
        />
        <p>
          Underneath each response sits the same question: who knows enough to act next? If the answer is
          nobody, stopping quickly has preserved the fault and abandoned the recovery.
        </p>
        <p>
          The distinction holds outside software too. An experiment should run long enough to answer the
          question that justified it. Quitting early because failure has become fashionable produces no
          evidence, and calling the abandonment “learning” doesn&apos;t fill in the missing measurement.
        </p>
        <p>
          So when the next fault shows up, resist the urge to make everything stop as fast as possible.
          Find the boundary that knows enough to name the error and can contain it without erasing the
          evidence, then let that part fail while the rest keeps running.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
