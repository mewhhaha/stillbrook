import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, H2, Prose, PullQuote } from "../../components";

export const article = {
  title: "The AI sheen",
  description:
    "AI-generated images remain hard to accept because their default polish has become a visible shorthand for cheap, unconsidered work.",
  published: "2026-07-11T16:20:55Z",
  author: "Mira Voss",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-ai-sheen-journal.webp",
    alt: "A glazed portrait bust has a rough painted patch on its cheek, beside a mirror and brushes.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          You can argue about authorship, labor, consent, and provenance — and you should — but most
          generated images lose me before any of that starts. They show up wearing the same waxy skin,
          the same amber rim light, shallow depth of field, micro-detail no real lens would resolve,
          and a composition that looks finished because every surface got polished. I see the tool
          before I see the picture, and right now the tool reads as cheap.
        </p>

        <H2>The tells moved</H2>
        <p>
          The old tells were literal: six fingers, melted jewelry, text that collapsed into alphabet
          soup. Models have mostly fixed those, and the look survived anyway. The tell moved from
          anatomy to taste.
        </p>
        <p>
          A <a href="https://arxiv.org/abs/2502.11989">large CHI study</a> asked more than
          50,000 people to distinguish photographs from images made with Midjourney, Firefly, and
          Stable Diffusion, and its taxonomy went well past broken hands — shiny or plastic textures,
          mismatched styles, implausible lighting, photoshoot-like perfection. The researchers picked
          their synthetic set from thousands of generations to weed out the most obvious failures.
          Even for a study about spotting fakes, the default output needed an editor.
        </p>
        <p>
          Any one of those traits can belong in good art. Gloss can be deliberate, physics can be
          ignored, a face can be strange. What bugs me is the convergence: unrelated prompts keep
          coming back with the same surface treatment, until the style stops being anyone&apos;s
          choice.
        </p>
        <PullQuote>A style chosen by nobody belongs to the machine.</PullQuote>

        <H2>Average taste makes average images</H2>
        <p>
          Image generators are increasingly measured and tuned through human preference. <a href="https://arxiv.org/abs/2305.01569">Pick-a-Pic</a> collected real users&apos;
          pairwise choices and used them to train PickScore, a reward model that can rank generations.
          <a href="https://arxiv.org/abs/2403.03206"> Stable Diffusion 3</a> reports progress
          through prompt understanding, typography, and human preference ratings. Reasonable
          engineering targets, as far as they go — but nobody would mistake them for a theory of art.
        </p>
        <p>
          Optimizing for preference pushes hard toward whatever wins the immediate comparison: a
          centered subject, cinematic lighting, dense detail, no unresolved edge anywhere. A <a href="https://arxiv.org/abs/2604.07427">2026 paper on personalized image evaluation</a> says it plainly — current reward models optimize for average human appeal while missing
          individual taste. Average appeal is fine for a product demo. The trouble starts when it
          becomes the default answer to every visual question.
        </p>
        <p>
          Art often needs the crop that feels wrong for a second, the dead space, the dirty color, the
          hand-drawn wobble, the detail withheld. A lot of the job is knowing which attractive
          feature to turn down, and those decisions can lose a blind comparison and still improve the
          whole work.
        </p>
        <p>
          The model can hit every word of the prompt and still have no idea why the image exists.
        </p>

        <H2>Quality needs an editor</H2>
        <p>
          What would help isn&apos;t another jump in resolution. The good generated images I&apos;ve
          seen already involve reference gathering, repeated rejection, masks, compositing, paint-over,
          typography, and a person willing to strip out the model&apos;s favorite habits. The generator
          supplies material; someone still has to turn the sheen down by hand.
        </p>
        <Compare
          attributes={["Selection", "Composition", "Surface", "Stopping point"]}
          entities={[
            {
              name: "Default generation",
              values: [
                "The first image that satisfies the prompt",
                "Centered subject and immediate visual hierarchy",
                "Gloss, rim light, dense micro-detail",
                "Every edge resolved and every region polished",
              ],
            },
            {
              name: "Edited generation",
              values: [
                "Repeated rejection against references and purpose",
                "Crop, dead space, and emphasis chosen for this image",
                "Masks, compositing, paint-over, restrained texture",
                "The image stops when the remaining tension belongs there",
              ],
            },
          ]}
          caption="Editing replaces the model's average preferences with decisions tied to one image."
        />
        <p>
          A <a href="https://arxiv.org/abs/2511.16814">recent study comparing visual creativity</a> found human artists rated highest, while greater human guidance improved generated work
          substantially. I don&apos;t read that as a mystical boundary around human creativity — more
          that direction matters, and that a prompt is too small a container for all the decisions an
          image needs.
        </p>
        <p>
          AI imagery gets accepted when it stops asking the viewer to discount it on sight. The tool
          doesn&apos;t have to become invisible, but the image has to arrive before the production
          method does. That takes models that hand artists enough control to make choices the reward
          model would never make on its own.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
