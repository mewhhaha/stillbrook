import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Let typeclasses keep the trace",
  description:
    "A CRUD example in typeclasses adds database tracing around typed operations, keeps the request program intact, and turns the resulting trace into an ordinary test value.",
  published: "2026-10-18T00:14:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/the-trace-is-an-interpreter-journal.webp",
    alt: "A brass machine carries olive tokens between trays while a recording arm draws a line on a paper roll.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const tracePipeline = `
  Effect.interpret(crud_program)
    .handle((effect) => run_clock(effect, read_now))
    .handle((effect) => run_trace_scopes(effect, application_trace_scope))
    .handle(run_trace_to_writer)
    .handle(run_router)
    .handle((effect) => run_reader(effect, context))
    .handle((effect) => run_database(effect, database))
    .handle((effect) => run_writer(effect, empty_trace))
    .run(run_task);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Here is my pitch for <a href="https://github.com/mewhhaha/typeclasses">typeclasses</a>: a
          request should be able to acquire database tracing without every function in its path
          learning how a trace works. The interesting demonstration in the repository is a small CRUD
          worker. It reads a todo, produces a response, and lets an interpreter record what happened
          around the database operation.
        </p>
        <p>
          That is the part of effect handlers I find easiest to care about. A request grows from a few
          useful operations. Later it needs timing, diagnostics, a test database, or a different place
          to send events. Those changes should have somewhere to go. In this example, they go beside
          the program, in the sequence of handlers that gives its operations meaning.
        </p>

        <H2>Keep the request readable</H2>
        <p>
          The{" "}
          <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/case_studies/cloudflare_crud_worker/program.ts">
            core program
          </a>{" "}
          declares a union of requirements: request context, asynchronous work, database operations,
          routing, tracing, and a clock. A scoped generator builds the request using those capabilities.
          Its read branch emits a domain event, asks for a todo by id, and turns the database result
          into an HTTP response. It already knows which domain events it wants to name.
        </p>
        <p>
          The automatic database trace belongs at another level. The read branch has no reason to
          decide how every database operation announces its start or reports its result. A handler can
          recognize that operation wherever it appears. Keeping that decision together also gives me
          one place to change the policy when the next endpoint arrives.
        </p>
        <AnnotatedCode
          lang="ts"
          title="The interpreter used to collect a trace"
          code={tracePipeline}
          notes={[
            { line: 3, note: "Add trace events around selected operations before they are handled." },
            { line: 4, note: "Translate trace events into Writer output." },
            { line: 7, note: "Interpret the database requests using the supplied database." },
            { line: 8, note: "Collect the written trace alongside the response." },
          ]}
          caption={
            <>
              The handler chain from the example&apos;s{" "}
              <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/case_studies/cloudflare_crud_worker/worker.ts">
                Worker entry point
              </a>. Its surrounding function supplies the context, clock, database, and empty trace.
            </>
          }
        />
        <p>
          Read the chain as a series of decisions. The request stays the same while one execution
          collects a trace and another sends trace events to a sink. The database implementation is
          supplied separately. That keeps choosing storage and choosing observation from becoming the
          same decision.
        </p>

        <H2>An operation can pass through</H2>
        <p>
          The{" "}
          <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/case_studies/cloudflare_crud_worker/trace.ts">
            scope handler
          </a>{" "}
          inspects the suspended operation. If it matches a selected scope, the handler emits a start
          event, forwards the original operation, waits for its result, emits a finish event, then
          continues. Unselected operations pass through. The database handler later supplies the actual
          result; the tracing handler never needs to implement database access.
        </p>
        <p>
          Handler order therefore says something real. Tracing needs to see the database request
          before that request is interpreted away. The selected operation supplies the name and
          attributes; its returned value supplies the finish attributes. This is a useful seam for
          instrumentation because the operation still carries its application meaning there.
        </p>
        <p>
          A database read is still a database read at this boundary. We can attach the todo id before
          it runs and describe its result afterward. Once it has become an arbitrary asynchronous
          task, recovering that meaning requires another convention. Keeping the operation visible
          gives the surrounding code something useful to work with.
        </p>
        <p>
          Dependency injection can also replace a database or wrap it with logging. I already like that
          technique. The extra purchase here is the typed account of what remains to be interpreted.
          The library&apos;s{" "}
          <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/src/effects.ts">
            handler types
          </a>{" "}
          allow a handler to remove selected requirements and introduce others. Turning tracing into
          Writer output changes the remaining work, and the next handler receives that new shape.
        </p>

        <H2>Make the observation testable</H2>
        <p>
          The{" "}
          <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/case_studies/cloudflare_crud_worker/worker.test.ts">
            example test
          </a>{" "}
          seeds an in-memory database, fixes the request id and clock input, and requests one todo. It
          asserts the response status and the complete ordered trace. That includes route matching,
          the explicit domain event, and the automatically added database start and finish. The trace
          becomes a returned value the test can inspect.
        </p>
        <p>
          This is a repository example, with a deliberately small workload. It establishes the
          composition clearly; it supplies no throughput result or evidence from a deployed service.
          The{" "}
          <a href="https://github.com/mewhhaha/typeclasses/blob/6c9751ec6b7471cde90c2a1eebd1163aea5c3c87/deno.json">
            package is still pre-1.0
          </a>, so the API has room to move. The useful accomplishment here already fits in the
          handler chain above. Generator execution and interpretation still have runtime costs;
          this example tests behavior rather than measuring those costs.
        </p>
        <p>
          This is the part of typeclasses I would show first. Adding an observation can be a local change to how a
          program is interpreted, and the observation itself can become ordinary data. The request
          remains easy to follow. The test gets a precise account of the route it took. For a small
          TypeScript abstraction, that is a substantial amount of useful work.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
