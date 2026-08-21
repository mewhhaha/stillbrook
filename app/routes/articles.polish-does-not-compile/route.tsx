import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, Divider, H2, Prose } from "../../components";

export const article = {
  title: "Polish does not compile",
  description:
    "Polish makes a terrible programming language because too much of each sentence lives outside the text, in the speaker and the conversation.",
  published: "2026-07-11T17:39:00Z",
  author: "Elias North",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/polish-does-not-compile.jpg",
    alt: "Painting of two young women in classical dress talking together on a sunlit stone wall beneath trees.",
    credit: {
      author: "Henryk Siemiradzki",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Henryk_Siemiradzki_Das_Gespr%C3%A4ch.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const openingExamples = `
  Napisałem program.   // I wrote a program; masculine agreement
  Napisałam program.   // I wrote a program; feminine agreement

  Dwa koty spały.      // two cats slept
  Pięć kotów spało.    // five cats slept
`;

const tokenExample = `
  wyprodukowalibyśmy
  = wyprodukowali + by + śmy
  = l-participle + conditional + first-person plural
`;

const orderExamples = `
  Jan kocha Marię.     // neutral: Jan loves Maria
  Marię kocha Jan.     // same roles; Jan can become the focus
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Polish is the worst programming language I know. Not Polish notation — prefix operators
          are almost embarrassingly easy to parse — the natural language, the one with seven cases.
          Treat a sentence as source code and it asks the compiler to recover types from word
          endings and to fetch missing variables from whoever happens to be speaking.
        </p>
        <p>
          Consider what the environment already holds before the first statement runs. The
          speaker&apos;s grammatical gender, for a start, because past-tense verbs agree with it.
          Integer literals decide which case their noun takes and whether the verb behaves as
          plural or as neuter singular. And a single printed word can turn out to contain several
          syntactic tokens.
        </p>
        <CodeBlock lang="text" title="four valid programs" highlight="2-3,5-6" code={openingExamples} />
        <p>
          This is everyday Polish, nothing exotic — and read as code, every line leans on ambient
          state that no function signature admits.
        </p>

        <H2>The lexer starts in debt</H2>
        <p>
          A lexer wants a stable answer to one small question: where does a token end? The{" "}
          <a href="https://universaldependencies.org/pl/index.html#tokenisation-and-word-segmentation">
            Universal Dependencies specification for Polish
          </a>{" "}
          has to distinguish orthographic words from syntactic tokens, and its example
          <code> wyprodukowalibyśmy</code>, “we would have produced,” is one space-delimited word
          hiding three syntactic pieces.
        </p>
        <CodeBlock lang="text" title="one word, three tokens" highlight="2-4" code={tokenExample} />
        <p>
          The same specification notes that punctuation can participate in an inflected form, as in
          <code> Melville&apos;a</code>, so splitting on whitespace fails and treating apostrophes
          as delimiters fails too. You need morphology before you can finish lexing.
        </p>
        <p>
          The bill keeps arriving after tokenization. A study of{" "}
          <a href="https://arxiv.org/abs/2206.02208">style markers in inflected Polish</a>{" "}
          describes how prominent endings and proliferating surface forms make generic tokenization
          sparse. A word like <code>program</code> won&apos;t stay one convenient key; its role in
          the sentence changes its visible form, and getting back to the shared lemma means doing
          grammatical analysis.
        </p>

        <H2>Five changes the type of cat</H2>
        <p>
          Then there&apos;s the type system. The{" "}
          <a href="https://universaldependencies.org/pl/index.html#nominal-features">
            Polish treebank model
          </a>{" "}
          records seven cases and five grammatical genders — three masculine classes, feminine, and
          neuter — and I had to read that twice, because the masculine classes don&apos;t even map
          cleanly onto real-world animacy. Adjectives, determiners, numerals, pronouns, verbs, and
          auxiliaries all participate in agreement. The genders are facts about the words
          themselves; the world doesn&apos;t enter into it.
        </p>
        <p>
          And the integer literals overload the grammar. With two cats, the noun is nominative
          plural and the past-tense verb is plural: <code>Dwa koty spały</code>. With five, the
          noun drops into genitive plural and the verb shows up as neuter singular:
          <code> Pięć kotów spało</code>. The quantity changes the agreement regime of the whole
          expression.
        </p>
        <p>
          The analysis is hard enough that the{" "}
          <a href="https://universaldependencies.org/pl/index.html#core-and-oblique-dependents">
            two Polish Universal Dependencies treebanks
          </a>{" "}
          disagree about whether the governing numeral in a typical subject phrase should be
          treated as nominative or accusative. Speakers aren&apos;t waiting for that dispute to
          resolve; they use the construction every day without consulting a syntax tree. The
          trouble only starts when somebody tries to press that competence into a formal model.
        </p>
        <p>
          In a conventional language, <code>5</code> changes a value. In Polish it also changes the
          case of an operand and the number of a predicate — excellent compression if you already
          know the rules, and a fairly hostile API if you&apos;re a parser hoping for local types.
        </p>

        <Divider />

        <H2>The process owns ambient state</H2>
        <p>
          In <code>Napisałem program</code> and <code>Napisałam program</code>, the verb ending
          carries first person, past tense, and masculine or feminine agreement, so the pronoun
          <code> ja</code>, “I,” can stay home. A compiler translating either sentence still needs
          to know who&apos;s speaking. That input never appears in the text; it arrives with the
          person.
        </p>
        <p>
          Word order smuggles in another dependency. Because the case endings preserve grammatical
          roles, position is free to signal what the sentence treats as established or new.
          Research on{" "}
          <a href="https://arxiv.org/abs/cmp-lg/9510006">
            discourse in English-to-Polish machine translation
          </a>{" "}
          describes Polish constituents as ordered by salience, with the important information
          tending toward the end regardless of grammatical function.
        </p>
        <CodeBlock lang="text" title="roles survive, emphasis moves" code={orderExamples} />
        <p>
          Both lines can say that Jan loves Maria — <code>Jan</code> is nominative,
          <code> Marię</code> accusative — but the second one answers a different conversational
          question by moving Jan into the final, informative position. A parser that returns the
          same dependency graph for both has preserved who did what and thrown away why the speaker
          chose that order.
        </p>
        <p>The sentence is not a closed term. It closes over the conversation.</p>

        <H2>The runtime is another person</H2>
        <p>
          Programming languages engineered this kind of dependency out deliberately. Vocabulary is
          narrow, precedence is frozen, bindings are declared, and any program where two meanings
          survive the grammar gets rejected. All of that exists because the compiler can&apos;t
          lean across the desk and ask what you meant.
        </p>
        <Compare
          attributes={["Token boundary", "Type information", "Ambient state", "Ambiguity"]}
          entities={[
            {
              name: "Programming language",
              values: [
                "Fixed by a formal lexer",
                "Declared or inferred inside the program",
                "Passed through bindings and parameters",
                "Rejected when the grammar leaves two meanings",
              ],
            },
            {
              name: "Polish conversation",
              values: [
                "Orthographic words may contain several syntactic pieces",
                "Spread through case, gender, number, and agreement",
                "Speaker identity and shared discourse supply missing facts",
                "A listener resolves it from context and salience",
              ],
            },
          ]}
          caption="The compiler receives a closed artifact. A Polish listener receives the sentence, the speaker, and the conversation around it."
        />
        <p>
          Computational Polish has to build an explicit support structure around what speakers do
          for free. The{" "}
          <a href="https://universaldependencies.org/treebanks/pl_lfg/index.html">
            Polish LFG Universal Dependencies treebank
          </a>{" "}
          contains more than seventeen thousand sentences generated through a formal grammar and
          then manually disambiguated by human annotators — the grammar proposes the possibilities,
          and a person sits there deciding which one each sentence actually used.
        </p>
        <p>
          The ranking is a joke, obviously, but the failure mode underneath it is real. Polish
          makes the category error easy to see because so much of the information moves through
          inflection and through whatever the speaker and listener already share. Those features
          only become liabilities when the target runtime is a machine with no childhood and no
          memory of the previous sentence.
        </p>
        <p>
          As a language for people, Polish spends its complexity well: emphasis can move and
          repetition can be skipped, and nothing is lost because the endings keep the roles
          recoverable. As a programming language it leaves half the program outside the file. Take
          away the speaker and the listener, and what remains is the part of the program they were
          supposed to supply.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
