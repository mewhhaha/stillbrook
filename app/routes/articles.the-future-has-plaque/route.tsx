import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, Divider, H2, Prose } from "../../components";

export const article = {
  title: "The future has plaque",
  description:
    "Technological progress keeps expanding what we can do, but living systems still demand the same repetitive care every day, because maintenance is a permanent condition of the body rather than a bug waiting to be patched.",
  published: "2026-07-11T17:44:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-future-has-plaque-journal.webp",
    alt: "A wooden toothbrush, porcelain tooth model, and floss spool sit before a closed brass capsule.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const kinds = [
  {
    label: "Frontier",
    examples: "predict · edit · launch",
    rhythm: "A result arrives",
    success: "Something new becomes possible",
  },
  {
    label: "Baseline",
    examples: "brush · sleep · move",
    rhythm: "The loop returns tomorrow",
    success: "Nothing important breaks",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          At 7:12 in the morning, your species can use <a href="https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease">CRISPR/Cas9-edited blood stem cells as an approved treatment</a> and <a href="https://www.nature.com/articles/s41586-024-07487-w">predict the joint structure of proteins, DNA, RNA, ions, and drug-like molecules</a>. And there you are at the mirror, dragging nylon bristles over your teeth for two minutes.
        </p>
        <p>
          The gap feels almost insulting, like civilization poured its talent into the wrong backlog. We
          can rewrite the instructions inside a cell, and yet the mouth opens every morning with the same
          ticket marked <em>manual</em>.
        </p>
        <p>
          None of this is a gap waiting for one clever gadget. Technical progress is very good at pushing
          the frontier outward and pretty bad at deleting maintenance, and I don&apos;t think that&apos;s
          an accident. Every breakthrough hands you a new capability; a living body just keeps generating
          conditions that somebody has to manage all over again.
        </p>
        <Compare
          caption="Breakthroughs move the ceiling. Maintenance keeps the floor from collapsing."
          attributes={["Examples", "Rhythm", "Success"]}
          entities={kinds.map((kind) => ({
            name: kind.label,
            values: [kind.examples, kind.rhythm, kind.success],
          }))}
        />

        <H2>Plaque is not a legacy bug</H2>
        <p>
          Plaque did not survive because dentistry forgot to ship a patch. The mouth is a warm, wet,
          nutrient-fed ecosystem that stays open to the world, and that is the whole problem. You eat,
          the bacteria in there metabolize the sugars and starches, and the acid they make goes to work
          on your enamel while saliva and fluoride push minerals back in.
        </p>
        <p>
          The <a href="https://www.nidcr.nih.gov/health-info/tooth-decay/more-info/tooth-decay-process">National Institute of Dental and Craniofacial Research</a> calls this a tug-of-war that runs all day long. Brushing knocks loose the sticky bacterial film and carries fluoride to the surface. Then you eat, drink, sleep, and grow the microbes right back. The process restarts because the conditions restart.
        </p>
        <p>
          You have to brush again tomorrow, and that repetition gets read as failure, as if a tool that
          really worked would have finished the job by now. But finishing was never on the table for a
          control acting on a process that keeps returning. Nobody says the thermostat broke because the
          heat kicks on again after midnight, or that last night&apos;s backup failed because you saved
          new files this morning. Your mouth doesn&apos;t seal itself shut after breakfast.
        </p>
        <p>
          Better brushes automate the wrist motion, nag you about pressure, and time the two minutes. They
          make the loop easier to run and steadier, which is worth something. What they can&apos;t reach
          is the cause sitting outside the loop. A fancy brush turns your maintenance into telemetry; it
          doesn&apos;t make eating or microbial life stop being physical events.
        </p>

        <H2>Progress loves a finish line</H2>
        <p>
          Breakthroughs are easy to tell stories about because they end on a result. The therapy gets
          delivered. The structure gets predicted. There is a before, an after, and a photo for the press
          release.
        </p>
        <p>
          Maintenance works by making sure nothing happens. No cavity opens up, no gum swells, no painful
          repair lands on the calendar. Its whole reward is that you keep something you already had, which
          somehow makes the effort look smaller than the breakthrough that handed you a new option in the
          first place.
        </p>
        <p>
          That is a measurement problem, not a real difference in worth. Frontier work widens what is
          possible; maintenance guards the thing all that possibility runs on. One grabs attention because
          the world visibly changes. The other only ever shows up as an ordinary day that didn&apos;t go
          wrong.
        </p>
        <p>
          The toothbrush is technology too. So is fluoride chemistry, so are the cheap bristles and the
          pressure sensors and the clean water and the piled-up evidence behind brushing twice a day.
          Mature technology stops looking futuristic once it gets cheap enough to repeat without any
          ceremony. The dullness is part of what it pulled off.
        </p>
        <p>
          The mistake is thinking the only honorable kind of progress is killing a chore outright. Some
          things you automate once and forget. Others you just hold inside a workable range: software gets
          patched, bridges inspected, filters swapped, bodies washed and fed and rested and moved. We keep
          inventing new things faster than we retire the upkeep they leave behind.
        </p>

        <Divider />

        <H2>Make the loop cheaper</H2>
        <p>
          None of this makes drudgery noble, and I want to be careful there. A routine can be genuinely
          necessary and still be badly designed, expensive, hard on your hands, or dumped on the people
          with the least time to spare. The point isn&apos;t to admire the brush; it is to cut down how
          much attention, money, dexterity, pain, and luck the loop asks of you.
        </p>
        <p>
          And the unfinished part is huge. The <a href="https://www.who.int/news-room/fact-sheets/detail/oral-health">World Health Organization</a> puts the number of people with oral diseases at nearly 3.7 billion, and in the 2021 Global Burden of Disease study untreated decay in permanent teeth came out as the single most common health condition on the planet. It ties the outcomes to fluoride, sugar, hygiene, whether you can reach a dentist, and the conditions you live in. A toothbrush is one private tool sitting inside a very public system.
        </p>
        <p>
          Real progress makes that system more forgiving: cheap fluoride toothpaste, water that protects
          teeth by default, sealants for the grooves a brush can&apos;t reach, tools that still work when
          your grip doesn&apos;t, and care that shows up before the pain does. A brush with an app might
          sharpen one person&apos;s technique. It does nothing for the prevention that never reached
          everyone else.
        </p>
        <p>
          This is the better promise buried in technology. Every recurring need won&apos;t vanish, but a
          missed step can do less damage, a disability can shut fewer doors, and ordinary care can stop
          demanding heroism. We keep adding powers faster than we shed needs, and maybe that is fine, as
          long as the needs we are stuck with get lighter to carry.
        </p>
        <p>
          Tomorrow morning some model will clear a new benchmark and some lab will announce a result, and
          you will still be standing at the sink with a brush in your hand. That is not the future failing
          to arrive. It is the future inheriting a mouth.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
