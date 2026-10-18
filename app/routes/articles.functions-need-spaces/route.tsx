import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  ChoiceOverload,
  CodeBlock,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Functions need spaces",
  description:
    "Snake case makes function names readable verb phrases by writing word boundaries explicitly instead of asking capitalization to impersonate punctuation.",
  published: "2026-07-11T22:43:39Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/functions-need-spaces-journal.webp",
    alt: "Two rows of printer's type show cramped blocks beside clearly spaced groups of sorts.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const namingPairs = `
  normalizeHTTPURLSearchParams()
  normalize_http_url_search_params()

  loadUserIDFromURL()
  load_user_id_from_url()

  shouldRetryOAuthCallback()
  should_retry_oauth_callback()
`;

const longName = `
  fetch_and_normalize_user_account_preferences(user_id)

  // The name is admitting that this is two jobs.
  const preferences = fetch_user_account_preferences(user_id);
  return normalize_preferences(preferences);
`;

const acronymSpellings = [
  "parseHTTPURL",
  "parseHttpURL",
  "parseHttpUrl",
  "parseHTTPUrl",
  "parse_http_url",
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          A generated TypeScript patch handed me <code>normalizeHTTPURLSearchParams</code>. I read it
          twice, then placed the cursor between the capitals to recover the words the name had swallowed.
          The function itself was fine. Its name behaved like a password.
        </p>
        <p>
          Function names are verb phrases. Snake case gives those phrases spaces the parser can tolerate.
          Camel case makes capitalization do two jobs at once: spell the words and separate them. Why are
          we asking your eyes to infer whitespace when <code>_</code> is sitting on the keyboard?
        </p>
        <CodeBlock lang="ts" title="names.ts" highlight="2,5,8" code={namingPairs} />
        <p>
          The snake versions take more columns. Good. The words are actually there. You can scan the verb,
          the object, and the qualifiers without first deciding whether <code>HTTPURL</code> contains two
          acronyms, one product name, or a cry for help.
        </p>

        <H2>Capital letters are overloaded</H2>
        <p>
          Camel case looks disciplined until an acronym arrives. Then every project invents a miniature
          constitution: <code>HTTP</code> or <code>Http</code>, <code>URL</code> or <code>Url</code>, and whether{" "}
          <code>OAuth</code> counts as a word, a brand, or an exception somebody remembers from review.
        </p>
        <ChoiceOverload
          request="Name the function that parses an HTTP URL."
          options={acronymSpellings}
          caption="Four camel spellings need an acronym policy; the underscored spelling exposes the three words."
        />
        <p>
          Rust avoids this argument in its{" "}
          <a href="https://rust-lang.github.io/api-guidelines/naming.html">
            API naming guidelines
          </a>: functions and methods use <code>snake_case</code>, and acronyms become ordinary lowercase
          words. Python&apos;s{" "}
          <a href="https://peps.python.org/pep-0008/#function-and-variable-names">PEP 8</a>{" "}
          makes the same choice for functions. These conventions do more than make code look consistent.
          They remove a naming decision that never deserved review time.
        </p>

        <H2>The evidence has an asterisk</H2>
        <p>
          The empirical story is annoyingly mixed. A{" "}
          <a href="https://doi.org/10.1109/ICPC.2009.5090039">2009 identifier study</a>{" "}
          found underscored names were recognized faster while camel-cased names were recognized more
          accurately. A later{" "}
          <a href="https://doi.org/10.1109/ICPC.2010.41">eye-tracking study</a>{" "}
          found faster recognition for underscored identifiers, but its participants were mostly trained
          in that style. Familiarity moves the result.
        </p>
        <p>
          I haven&apos;t found evidence strong enough to declare snake case a universal law of cognition.
          The smaller claim survives: an underscore is an explicit boundary, while a capital is a clue.
          Explicit boundaries age better when names collect acronyms, numbers, and domain jargon.
        </p>

        <H2>Case already has a job</H2>
        <p>
          Type names benefit from a different silhouette. Rust uses <code>HttpResponse</code> for the type
          and <code>parse_http_response</code> for the function. You can distinguish the value-level action
          from the type-level thing before reading either word. In camel-heavy code,{" "}
          <code>HttpResponse</code> and <code>parseHttpResponse</code> differ mainly at the left edge.
        </p>
        <p>
          Snake case also makes an overgrown name look overgrown. Camel case can compress five words into a
          smooth dark bar and let you pretend the function has one responsibility. Underscores make every
          conjunction visible.
        </p>
        <CodeBlock lang="ts" title="preferences.ts" highlight="1,3-5" code={longName} />
        <p>
          I made this exact split in a small importer after noticing that the underscored name looked
          ridiculous in autocomplete. The rename did not fix the function. The embarrassment made me open
          it, and the body was doing network access and normalization in the same retry loop.
        </p>

        <H2>Consistency can still win</H2>
        <p>
          Superior typography does not justify vandalizing an established API. Java&apos;s{" "}
          <a href="https://google.github.io/styleguide/javaguide.html#s5.2.3-method-names">
            method convention
          </a>{" "}
          is lower camel case, and JavaScript users expect the same shape. A public TypeScript library full
          of snake-cased methods creates interop friction that may cost more than the reading benefit.
        </p>
        <p>
          So I still write <code>parseHttpResponse</code> when an existing TypeScript surface expects it.
          In a tiny parser I started this week, the first exported function is{" "}
          <code>read_next_token</code>. The parser still mishandles one escaped newline, and I have not had
          to reread that function name once.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
