import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  H2,
  MessageThread,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "Types considered harmful",
  description:
    "TypeScript becomes dangerous when you silence honest absence with plausible defaults that satisfy the shape and corrupt the meaning.",
  published: "2026-07-11T21:00:26Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/types-considered-harmful.jpg",
    alt: "Gilded comedy and tragedy masks mounted in the wrought-iron canopy over a theater entrance.",
    credit: {
      author: "psyberartist",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Comedy_and_tragedy_(8107431738).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const counterfeitAccount = `
  type Account = {
    id: string;
    email: string;
    plan: "free" | "pro";
  };

  function accountFor(id: string): Account {
    return accounts.get(id) ?? {
      id,
      email: "",
      plan: "free",
    };
  }
`;

const defaultHallucinations = `
  const price = prices[sku] ?? 0;
  const retries = config.retries || 3;
  const country = profile.country ?? "US";
  const enabled = flags[feature] ?? true;
`;

const honestLookup = `
  type Lookup<T> =
    | { ok: true; value: T }
    | { ok: false; reason: "not-found" };

  function accountFor(id: string): Lookup<Account> {
    const account = accounts.get(id);
    if (account === undefined) {
      return { ok: false, reason: "not-found" };
    }

    return { ok: true, value: account };
  }
`;

const requiredConfiguration = `
  function requiredEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
      throw new Error(\`Missing environment variable: \${name}\`);
    }

    return value;
  }
`;

const typeConversation = [
  { from: "Map.get", text: "There is no account with this id." },
  { from: "TypeScript", text: "Then your return type cannot be Account." },
  { from: "Developer", text: "I invented a free account with an empty email." },
  { from: "Production", text: "Why did we authorize a customer who does not exist?" },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Types are not the harmful part. Treating a type error as paperwork is. The checker asks you to
          handle missing information, and you answer by manufacturing information that fits the interface.
        </p>
        <CodeBlock
          lang="ts"
          title="account.ts"
          highlight="8-13"
          code={counterfeitAccount}
        />
        <p>
          This is where type safety turns into theater. The lookup said no account exists, and the
          function papered over that answer with a customer who has no email and a plan nobody selected.
          The annotation is satisfied. Everything downstream now treats an account the business never
          created as real.
        </p>

        <H2>The checker is not a witness</H2>
        <p>
          TypeScript&apos;s{" "}
          <a href="https://www.typescriptlang.org/tsconfig/strictNullChecks.html">
            <code>strictNullChecks</code> option
          </a>{" "}
          makes <code>null</code> and <code>undefined</code> distinct types because a lookup may genuinely
          fail. That warning is useful evidence. It tells you the world did not produce the value your
          function promised.
        </p>
        <PullQuote>
          <code>undefined</code> was the last honest value in the program.
        </PullQuote>
        <p>
          The checker will happily verify that your fallback carries an <code>id</code>, an{" "}
          <code>email</code>, and a valid <code>plan</code>, but it has no way to know whether the account
          exists. Once you invent a well-shaped object, TypeScript has nothing left to complain about.
        </p>
        <MessageThread
          messages={typeConversation}
          caption="The same missing account, as heard by the lookup, the checker, the developer, and production."
        />

        <H2>Defaults are policy</H2>
        <p>
          Every line below looks like cleanup, and every line makes a product decision.
        </p>
        <CodeBlock
          lang="ts"
          title="defaults.ts"
          highlight="1-4"
          code={defaultHallucinations}
        />
        <p>
          A missing price becomes free. The retry line is worse than it looks, since <code>||</code>{" "}
          treats <code>0</code> as false and turns a deliberate zero into three. An unknown country
          becomes a jurisdiction, and an absent flag enables a feature nobody turned on.
        </p>
        <p>
          That country line has already bitten me: this spring I traced a mis-taxed invoice to a{" "}
          <code>profile.country ?? &quot;US&quot;</code> that had been sitting in our checkout service
          since a refactor, assigning a jurisdiction to every account that predated the country field. I
          spent the first afternoon convinced the tax provider was broken, because a one-line fallback
          never looks like a suspect. As far as I can tell nobody ever chose that default. It arrived in
          a diff that was mostly renames, and it read as tidying.
        </p>
        <p>
          The{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html">
            narrowing handbook
          </a>{" "}
          lists <code>0</code> and the empty string among JavaScript&apos;s falsy values. The{" "}
          <a href="https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html">
            <code>noUncheckedIndexedAccess</code> option
          </a>{" "}
          deliberately adds <code>undefined</code> to unknown indexed fields. Both exist to remind you
          that a key can be absent, which is a different instruction from “spray <code>?? 0</code> until
          the red goes away”.
        </p>
        <p>
          Absence can carry meaning too. TypeScript&apos;s{" "}
          <a href="https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html">
            <code>exactOptionalPropertyTypes</code> option
          </a>{" "}
          distinguishes a missing property from one explicitly set to <code>undefined</code>, because
          JavaScript can observe the difference. Flattening both into a convenient default erases a state
          your program may need later.
        </p>
        <p>
          Defaults are fine when they are real policy: <code>pageSize ?? 50</code> is honest if the product
          says omitted page size means fifty. A default should survive a conversation with the person who
          owns the behavior. “The compiler was red” is not a product requirement.
        </p>

        <H2>Keep the error alive</H2>
        <p>
          Expected absence should stay in the return type. Impossible configuration should fail at the
          boundary. Both are better than sending plausible garbage deeper into the system.
        </p>
        <CodeTabs labels={["Expected absence", "Invalid configuration"]}>
          <CodeBlock lang="ts" code={honestLookup} />
          <CodeBlock lang="ts" code={requiredConfiguration} />
        </CodeTabs>
        <p>
          The union forces the caller to choose what “not found” means. The configuration helper crashes
          where recovery is impossible, before an empty credential becomes an authentication mystery six
          services away. A non-null assertion or <code>as Account</code> is the same lie without even the
          courtesy of creating a runtime value.
        </p>
        <p>
          “Make invalid states unrepresentable” only works when you stop inventing valid-looking inhabitants
          for invalid states. Behind every red underline on a possibly-missing value sits one question —
          what should happen when it is missing? — and the code at that line usually has no idea. Pass the
          question upward until something does.
        </p>
        <p>
          “Considered harmful” gives types too much agency. All the checker did was ask whether an account
          exists. A person answered, the answer compiled, and somewhere past code review a customer with an
          empty email and a plan nobody picked is waiting for the first support ticket.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
