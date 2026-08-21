import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Who the button hides",
  description:
    "A button that promises dinner or a ride compresses another person's time and judgment into a single clickable verb.",
  published: "2026-07-11T17:17:00Z",
  author: "Mira Voss",
  tags: ["web", "craft"],
  image: {
    src: "/images/articles/who-the-button-hides.jpg",
    alt: "Hand-colored engraving of the Mechanical Turk chess automaton, a turbaned figure seated behind a chessboard with the cabinet doors open to reveal clockwork inside.",
    credit: {
      author: "Joseph Racknitz",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Racknitz_-_The_Turk_1.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Last month I pressed a button that said <em>Deliver</em>, and forty minutes later a
          stranger stood in the rain outside my door holding soup. Every spec I&apos;ve read has
          plenty to say about the button. None of them mention him.
        </p>
        <p>
          The{" "}
          <a href="https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element">
            HTML Standard
          </a>{" "}
          defines the element, its types, its activation behavior, and the commands it can send. The{" "}
          <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">
            WAI-ARIA button pattern
          </a>{" "}
          says a button lets a user trigger an action or event, then covers label, focus, keyboard
          interaction, and state. All of it is correct, and all of it stops before the part I keep
          getting stuck on.
        </p>
        <p>
          <em>Trigger an action</em> has no worker in it. A click dispatches an event in a few
          milliseconds, but the buttons in products promise dinner, a ride across town, a moderation
          decision, a refund. Code routes those requests; it can&apos;t cook, or carry a bag up four
          flights of stairs, or decide whether an appeal deserves a second look. And when the
          transaction gets smooth enough, the person doing the work starts to feel like network
          delay.
        </p>

        <H2>The verb eats the worker</H2>
        <p>
          Button labels are tiny imperatives: <em>Order</em>, <em>Send</em>, <em>Generate</em>,{" "}
          <em>Report</em>. The grammar centers your intention and drops the subject who has to
          fulfill it. You press <em>Deliver</em>, the system says <em>confirmed</em>, and somewhere
          between those two words a cook, a courier, a dispatcher, and whoever answers the phone when
          the order goes wrong have all done their part without appearing in the sentence.
        </p>
        <FlowSequence
          steps={[
            { title: "Interface", detail: "“Deliver dinner” — one tap" },
            { title: "System", detail: "dispatch · route · time · rate" },
            { title: "People", detail: "cook · courier · support agent" },
          ]}
          caption="One tap at the surface, four commands in the middle, three people at the bottom."
        />
        <p>
          A button is a promise made in someone else&apos;s name. Asking who the button is means
          asking whose availability and whose patience got packaged into a dependable action — maybe
          someone working right now, maybe someone waiting for the next task to appear, maybe
          someone whose labeling work years ago trained the system that seems to answer on its own.
        </p>
        <p>
          None of this makes every button an ethical crisis. <em>Close dialog</em> can stay a local
          state change. The question only matters when the label crosses out of software into
          another person&apos;s time — and the screen gives you no hint which kind you&apos;re
          pressing, since it&apos;s the same rounded rectangle either way.
        </p>

        <H2>The human API</H2>
        <p>
          The original Mechanical Turk was a chess-playing machine with a person folded inside the
          cabinet. Edgar Allan Poe&apos;s 1836 essay{" "}
          <a href="https://www.eapoe.org/works/essays/maelzel.htm">
            “Maelzel&apos;s Chess-Player”
          </a>{" "}
          works backward from how the machine behaves to argue that there has to be someone in
          there. The modern service that borrowed the name turns the same trick into an integration
          pattern.
        </p>
        <p>
          Amazon describes{" "}
          <a href="https://www.mturk.com/">Mechanical Turk</a>{" "}
          as access to a distributed workforce through a user interface or API. Businesses split
          work into microtasks, send them out to people, and fold the returned answers straight back
          into their software — content moderation, research, data validation, machine-learning
          annotation, the page lists them all. Seen from the calling application, a person looks
          remarkably like a function.
        </p>
        <p>
          The numbers underneath are worth sitting with. A{" "}
          <a href="https://arxiv.org/abs/1712.05796">
            study of 2,676 Mechanical Turk workers completing 3.8 million tasks
          </a>{" "}
          estimated a median hourly wage of roughly $2, with 4 percent of workers earning more than
          the United States federal minimum wage. That figure includes the work the interface never
          counts — hunting for tasks, redoing rejected work, starting tasks that never get
          submitted. None of that time shows up in the API response.
        </p>
        <p>
          The platform economy runs the same pattern through streets and warehouses. The{" "}
          <a href="https://www.ilo.org/publications/flagship-reports/role-digital-labour-platforms-transforming-world-work">
            International Labour Organization&apos;s global report
          </a>{" "}
          draws on interviews and surveys with about 12,000 workers and 85 businesses to look at how
          platforms reorganize work. A customer sees a button that says <em>Get a ride</em>; a
          driver sees a timed offer and a button that says <em>Accept</em>. The coordination is
          still done by people — the platform&apos;s contribution is the queue between them, and a
          different rectangle on each side.
        </p>

        <H2>Name the other side</H2>
        <p>
          Good interface work already insists that a button expose its role and carry an accessible
          name. When a person is on the other end, we owe a second kind of legibility.
          Nothing elaborate — no organization chart under every control — but enough context that
          the interface stops presenting someone as an instantaneous subroutine.
        </p>
        <ul>
          <li>Say whether the result is automated, human-reviewed, or human-performed.</li>
          <li>Show the wait as a person&apos;s availability, not an unexplained spinner.</li>
          <li>Explain what cancellation, retries, ratings, and appeals do to the other side.</li>
          <li>Let the worker refuse or contest the command that reaches them.</li>
        </ul>
        <p>
          Details like these change how people behave. A customer who sees their report land in a
          moderation queue understands why nothing happens for an hour. A rider who sees the
          driver&apos;s route before canceling understands that someone is already in motion. As far
          as I can tell, none of it ruins the service.
        </p>
        <p>
          I still press the buttons. The soup arrived, and it was good. But now I notice the pause
          after <em>Report</em> and wonder whether it means a queue or a person, and whether whoever
          reads it gets to say no. The spec can&apos;t tell me that. The rectangle, at least, is well
          documented.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
