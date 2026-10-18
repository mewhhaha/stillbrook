import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BarChart, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The backend developer costume",
  description:
    "Programmers turn languages and job titles into moral ranks because managed cloud primitives have made ordinary application backends embarrassingly small, and the resulting status theater distorts hiring, reviews, and architecture.",
  published: "2026-07-12T06:48:00Z",
  author: "Elias North",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/the-backend-developer-costume-journal.webp",
    alt: "A worker repairs blank paper slips at a desk surrounded by empty chairs draped with decorated coats.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ordinaryBackend = `
  export async function POST(request: Request) {
    const user = await requireUser(request);
    const input = CreateNote.parse(await request.json());

    const [note] = await db
      .insert(notes)
      .values({ ownerId: user.id, body: input.body })
      .returning();

    return Response.json(note, { status: 201 });
  }
`;

const managedLayers = [
  ["Identity", "Auth provider issues and verifies tokens", "Who may read, create, change, or delete each record"],
  ["Persistence", "Postgres or Firestore stores and replicates data", "Schema, constraints, migrations, and retention"],
  ["Execution", "Functions or containers run on managed infrastructure", "Retries, idempotency, timeouts, and side effects"],
  ["Operations", "Platform patches machines and replaces failed instances", "Observability, incident recovery, capacity, and cost"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="7 min read">
      <Prose>
        <p>
          I watched a code review spend forty minutes deciding whether a TypeScript service made the
          team look unserious. The change added one nullable column, copied it into a JSON response,
          and had already passed every test. Nobody discussed the migration.
        </p>
        <p>
          The endpoint had become a referendum on what kind of people we wanted to be. Rust would mean
          discipline, Haskell intelligence, Go pragmatism, Java enterprise adulthood, and PHP a failure
          to escape 2009. A programming language is a toolchain, not a character reference.
        </p>
        <p>
          We keep using languages that way because identity fills the space left when the work becomes
          ordinary. Cloud platforms have moved an enormous amount of difficult engineering below an API,
          so a large share of commercial backend development now consists of authentication, a database,
          a few handlers, and a queue somebody else operates. Rather than enjoy the victory, we dress the
          remaining glue in job titles and argue about which syntax proves we deserve them.
        </p>

        <H2>The compiler became a horoscope</H2>
        <p>
          Henri Tajfel and his colleagues found that boys assigned to arbitrary groups could favor their
          own group while allocating rewards, even when the categorization carried almost no history or
          material stake. Their 1971{" "}
          <a href="https://doi.org/10.1002/ejsp.2420010202">
            minimal-group experiments
          </a>{" "}
          used trivial distinctions such as supposed painting preferences. Tajfel studied schoolboys, so
          the analogy has limits; the mechanism still looks painfully familiar once the group names become
          Rustaceans, Gophers, Pythonistas, and functional programmers.
        </p>
        <p>
          Language communities start from something valuable. A real{" "}
          <a href="https://www.wenger-trayner.com/introduction-to-communities-of-practice/">
            community of practice
          </a>{" "}
          lets people exchange techniques, preserve hard-won stories, review one another&apos;s work, and teach
          newcomers how recurring problems are handled. The trouble begins when shared practice hardens
          into shared virtue, then every outsider becomes evidence that standards are slipping.
        </p>
        <p>
          We even publish a yearly table of affection. The 2025 Stack Overflow survey calls one section{" "}
          <a href="https://survey.stackoverflow.co/2025/technology/#2-admired-and-desired">
            “Admired and Desired”
          </a>{" "}
          and reports Rust as the most admired language at 72 percent. The survey asks whether people who
          used a technology want to continue; our arguments often upgrade that preference into a ranking
          of the people who use it.
        </p>
        <p>
          Actual comparisons keep producing conditional answers. Nanz and Furia&apos;s{" "}
          <a href="https://arxiv.org/abs/1409.0252">Rosetta Code study</a>{" "}
          found different winners for concision, large-input speed, and runtime failures. A later{" "}
          <a href="https://arxiv.org/abs/1901.10220">reanalysis of language and code-quality data</a>{" "}
          found statistically significant defect associations for only four languages, with exceedingly
          small effects, while a study of{" "}
          <a href="https://arxiv.org/abs/1806.04556">maintainability prejudices</a>{" "}
          found most of its language stereotypes unsupported, including the claim that JavaScript code was
          worse than the rest. The studies leave language choice as one technical variable among many and
          give us little basis for rating the person who wrote the repository.
        </p>

        <H2>The machine room moved downstairs</H2>
        <p>
          Managed cloud products describe the compression without embarrassment. Supabase puts one Postgres
          database at the center, connects authentication to row-level security, and uses PostgREST to{" "}
          <a href="https://supabase.com/docs/guides/getting-started/architecture">
            turn the database directly into a REST API
          </a>. Firebase sells authentication, managed relational and document databases, object storage,
          hosting, and{" "}
          <a href="https://firebase.google.com/docs/build">backend functions without server management</a>{" "}
          from the same product page.
        </p>
        <p>
          This is good engineering. Thousands of teams can inherit replication, TLS, token verification,
          process replacement, backups, and global delivery instead of rebuilding them badly. The amount of
          custom application code left for an ordinary create endpoint can look like this:
        </p>
        <CodeBlock lang="ts" title="create-note.ts" highlight="2-4,6-9,11" code={ordinaryBackend} />
        <p>
          For fuck&apos;s sake, it is a table with an authorization rule. We can call the function a service,
          put it behind an API gateway, add three tracing headers, and give its owner a backend title, but
          the handwritten path still runs from authentication to <code>INSERT</code> and back.
        </p>
        <p>
          The code stays small because the provider carries machinery beneath it. Product teams still own
          every decision whose failure reaches a customer, and those decisions have merely become easier to
          overlook when the infrastructure arrives preassembled.
        </p>
        <DataTable
          head={["Concern", "Managed layer carries", "Application team still decides"]}
          rows={managedLayers}
          caption="Managed products move implementation downward while application policy stays with the team."
        />
        <p>
          I haven&apos;t counted every backend, and the exceptions are substantial: database engines, compilers,
          payment ledgers, media pipelines, low-latency trading systems, and infrastructure products still
          contain hard systems work. This rant targets ordinary product software, where complexity usually
          comes from policy, data history, and changing requirements rather than from moving bytes between
          machines.
        </p>

        <H2>The badge starts designing the system</H2>
        <p>
          Once a role becomes a source of dignity, the architecture starts reserving territory for it. A
          developer who wants to become a Rust developer can find a service boundary by lunch. A backend
          team protecting its status can turn one new profile field into an API ticket, a schema copy, a
          release dependency, and a meeting about ownership.
        </p>
        <p>
          The same sorting reaches hiring. A careful developer with ten years of PHP gets read as someone
          who survived a bad ecosystem, while a newcomer carrying a fashionable language receives credit for
          the language&apos;s values before demonstrating any of them. Then code review follows the hierarchy:
          reviewers praise iterator choices and lifetime elegance while the migration remains irreversible,
          the permission check sits in the client, and retries can charge the card twice.
        </p>
        <p>
          I opened a repository last month called <code>backend-platform</code> expecting scheduling,
          isolation, or at least a stubborn distributed-system problem. Its only handwritten request path
          verified an Auth0 token, called a hosted Postgres database, wrote an object to S3, and returned a
          signed URL. The name was sincere; the difficult machinery belonged to four vendors.
        </p>
        <p>
          Threats to the role feel personal because the role has become personal. A qualitative study of{" "}
          <a href="https://arxiv.org/abs/2410.03571">
            occupational identity among software engineers using generative AI
          </a>{" "}
          found engineers engaging in identity-protective sense-making as automation pressed on competence,
          autonomy, and belonging. Cloud abstraction applies an older version of the same pressure: when the
          provider performs the machine work, the title has to find another reason to remain prestigious.
        </p>
        <p>
          Teams pay for that defense through unnecessary rewrites, narrow hiring funnels, and boundaries
          drawn around prestige instead of change. Polyglot systems can be the right answer when workloads
          truly differ. They become exhausting when each service exists as a flag planted by the person who
          wanted a different identity on their conference badge.
        </p>

        <H2>The boring work is the job</H2>
        <p>
          The cloud leaves plenty of engineering behind, but most of it photographs badly. Someone has to
          decide which facts deserve a durable column, which operations must be idempotent, how permissions
          compose, what a partial migration means, how old data gets repaired, and which alert wakes a human.
          These decisions become hard when real users, old data, existing integrations, and partial failures
          constrain every change.
        </p>
        <p>
          The 2025 Stack Overflow survey makes the daily workload harder to mistake. Databases and SQL touch
          far more professional developers than the language at the center of many prestige arguments.
        </p>
        <BarChart
          title="Technology use among professional developers in the 2025 Stack Overflow survey"
          data={[
            { label: "SQL", value: 61.3 },
            { label: "PostgreSQL", value: 58.2 },
            { label: "Rust", value: 14.5 },
          ]}
          format={(value) => `${value}%`}
          max={70}
          caption={
            <>
              Reported use among professional developers in the{" "}
              <a href="https://survey.stackoverflow.co/2025/technology/">2025 Stack Overflow survey</a>.
            </>
          }
        />
        <p>
          A careful PHP developer who adds the unique constraint, rehearses the rollback, and checks the
          authorization boundary is doing better engineering than a careless Rust developer who models the
          request beautifully and duplicates every payment after a timeout. Type systems and runtimes can
          prevent entire classes of mistakes, which is a wonderful reason to choose them. The compiler still
          has no visibility into the migration plan or the production history that makes the change dangerous.
        </p>
        <p>
          “Backend developer” remains a useful label when it tells a team who owns data integrity, service
          behavior, and production recovery. As a caste, it encourages people to defend a layer whose most
          important machinery may already belong to AWS, Google, Cloudflare, or a Postgres operator. In that
          version of the role, teams keep API boundaries and service ownership long after the architecture
          stops needing them.
        </p>
        <p>
          At 16:47, the payment worker retries after a timeout and creates the second invoice because the
          table has no unique key on the provider event. The Rust hoodie, Go gopher, and Haskell sticker stay
          draped over empty chairs while someone opens <code>psql</code>, locks the bad rows, and writes the
          constraint everyone skipped during the argument about what kind of developer belonged in the
          repository.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
