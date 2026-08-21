import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BarChart, Compare, H2, Prose } from "../../components";

export const article = {
  title: "The locker at the corner",
  description:
    "Poland’s parcel-locker ecosystem beats Amazon’s captive delivery model by separating where you buy from where and when you receive.",
  published: "2026-07-11T21:34:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-locker-at-the-corner.jpg",
    alt: "An InPost parcel locker standing on a street corner in Tomaszów Mazowiecki, its yellow bank of compartments facing the sidewalk.",
    credit: {
      author: "WrS.tm.pl",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Paczkomat_InPost_TMS02A_przy_ul._%C5%9Bw.Antoniego_68_w_Tomaszowie_Mazowieckim,_PL,_EU._cc0.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const deliveryAttributes = [
  "Address",
  "Recipient’s time",
  "Seller choice",
  "Missed handoff",
  "Return path",
] as const;

const deliveryModels = [
  {
    name: "Amazon-shaped delivery",
    values: [
      "Home, workplace, or a platform pickup point",
      "Courier window or the platform’s collection rules",
      "Strongest inside one marketplace and membership",
      "Redelivery, safe-place decision, or support flow",
      "Attached to the original order and account",
    ],
  },
  {
    name: "Polish locker network",
    values: [
      "A neighborhood machine chosen at checkout",
      "Collection after arrival, often around the clock",
      "Available across unrelated shops, marketplaces, and private sends",
      "The parcel remains in a compartment until collection",
      "Drop the parcel back into the carrier network",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          I started this draft with a neat two-column comparison: Amazon on the left, InPost on the
          right. Ten minutes later I had added Allegro, Orlen, Poczta Polska, and a note in the margin
          saying “the carrier is the point.” The comparison had been hiding the useful part.
        </p>
        <p>
          Amazon&apos;s best trick is making the search box, membership, warehouse, delivery promise, and
          front door feel like one product. Poland built a better last mile by pulling the final handoff
          out of the store and putting it beside the supermarket. The Polish advantage is not a better
          shop. It is a delivery network that can serve almost any shop.
        </p>
        <p>
          InPost is a private logistics company, and Poczta Polska is the national operator. Here, “postal
          services” means the broader Polish parcel system that grew around lockers and pickup points.
          That system includes competitors, public infrastructure, corner shops, petrol stations, and a
          customer expectation Amazon cannot own by itself.
        </p>

        <Compare
          attributes={deliveryAttributes}
          entities={deliveryModels}
          caption="How the two models answer the same five delivery questions, from address to return path."
        />

        <H2>The address became a machine</H2>
        <p>
          Home delivery contains a stubborn synchronization problem. The driver has a route, the recipient
          has a life, and both are supposed to arrive at one doorway within the same sliver of afternoon.
          Delivery windows, intercom calls, safe places, neighbors, and second attempts are patches over
          that collision.
        </p>
        <p>
          A locker gives the parcel an address that can receive without you. By the end of 2024,{" "}
          <a href="https://www.reuters.com/business/parcel-locker-firm-inpost-q4-volumes-rise-20-2025-01-07/">
            InPost&apos;s automated parcel machines stood all over Poland
          </a>{" "}
          and the company handled 1.09 billion parcels across its markets that year. The scale matters because a locker
          five tram stops away is a chore; one beside the groceries becomes part of the walk you already
          make.
        </p>
        <p>
          The operational gain is equally plain. A courier can unload many parcels at one stop, while each
          recipient collects later. Failed doorstep handoffs fall out of that route, and the evening no
          longer belongs to a tracking page that says the van is seven stops away.
        </p>

        <H2>Convenience left the storefront</H2>
        <p>
          <a href="https://www.reuters.com/business/retail-consumer/action-amazon-leans-into-video-emerging-europes-online-marketplace-fight-2024-04-09/">
            Amazon entered the Polish marketplace in 2021 and priced Prime aggressively
          </a>. Its local challenge was never the ability to move a box; Amazon has spent decades making
          fulfillment look effortless. Poland already expected something broader: pick a carrier at
          checkout, choose a familiar machine, open it from an app, send a return through the same network,
          then use that habit again at another shop.
        </p>
        <p>
          Amazon offers pickup points in many markets. Those points extend the Amazon order. An InPost
          locker can receive purchases from unrelated merchants, marketplace sellers, and smaller shops,
          while the same network accepts consumer sends and returns. The delivery relationship survives
          after the storefront changes.
        </p>
        <p>
          Competitors copied the expectation rather than arguing with it. Allegro finished 2024 with more
          than 4,500 lockers and{" "}
          <a href="https://www.reuters.com/technology/e-commerce-firm-allegro-plans-add-2500-parcel-lockers-poland-2025-2025-03-13/">
            planned another 2,500 for 2025
          </a>. In September 2025, Orlen and Poczta Polska announced a venture intended to combine their
          infrastructure into{" "}
          <a href="https://www.reuters.com/en/polands-orlen-poczta-polska-team-up-courier-services-2025-09-26/">
            more than 30,000 pickup and drop-off points
          </a>. Of course the reward for building a useful shared habit is that every operator wants its
          own yellow, green, or blue wall in the same car park.
        </p>
        <p>
          That competition can become clutter, but it also keeps the final handoff from disappearing inside
          one retailer&apos;s subscription. A merchant can negotiate between carriers, and a customer can
          pick whichever machine sits closest, or whichever app is already on their phone.
        </p>

        <H2>Density becomes a habit</H2>
        <p>
          Locker delivery improves abruptly once the network is dense enough. Before that point, every order
          requires a small geography lesson. Afterward, the checkout remembers your usual machine, the app
          sends the same notification, and collection fits between the pharmacy and the bread shelf. People
          stop evaluating the delivery method each time.
        </p>
        <p>
          In late 2024, InPost&apos;s chief executive gave the Financial Times an estimate for out-of-home
          delivery in Poland and the United Kingdom. The figures came from the company selling the model, so
          I would not mistake them for a neutral census. The gap still explains why copying a few lockers
          abroad does not immediately copy Poland.
        </p>
        <BarChart
          title="InPost's estimate of the out-of-home share of parcels in late 2024"
          data={[
            { label: "Poland", value: 65 },
            { label: "United Kingdom", value: 10 },
          ]}
          format={(value) => `${value}%`}
          max={70}
          caption={
            <>
              Estimated out-of-home parcel share in late 2024, according to{" "}
              <a href="https://www.ft.com/content/93a7b9f1-7bde-48b9-90f5-5584c2f92fa1">InPost&apos;s chief executive</a>.
            </>
          }
        />
        <p>
          The useful product includes merchant integrations, route density, remembered locations, app
          behavior, and enough volume to refill the machines every day.
        </p>
        <p>
          Amazon&apos;s model gets stronger as more purchases stay inside Amazon. The Polish network gets
          stronger the other way around, as purchases from more places converge on a delivery layer people
          already know, and a small shop that plugs its checkout into that layer gets national logistics
          without ever buying a van.
        </p>

        <H2>The locker sends a bill too</H2>
        <p>
          I nearly ended this as a patriotic story about Poland teaching American commerce some manners.
          Then I put the 2026 ownership news back into the draft. A consortium led by Advent and FedEx opened
          a €7.8 billion tender offer for InPost, with the acceptance period scheduled to run until{" "}
          <a href="https://www.reuters.com/business/inpost-says-fedex-led-9-billion-buyout-offer-run-may-26-july-27-2026-05-22/">
            July 27, 2026
          </a>. A Polish delivery habit can be commercially valuable precisely because international capital
          knows how hard it is to reproduce.
        </p>
        <p>
          Lockers also transfer work to the recipient. You walk, carry the parcel home, obey a collection
          deadline, and sometimes discover that the “nearby” machine is across a six-lane road. I have not
          measured your route. Door delivery remains better for limited mobility, heavy goods, urgent items,
          groceries, and anyone whose daily path does not pass a useful pickup point.
        </p>
        <p>
          The environmental case needs the same honesty. Consolidated stops can reduce van mileage, but a
          customer who drives a separate round trip can spend the saving again. A 2026 study of pickup-point
          delivery found that the result depends heavily on{" "}
          <a href="https://arxiv.org/abs/2601.14196">network density and how customers travel</a>. Poland&apos;s
          advantage comes from putting lockers on existing errands. A cabinet at the edge of town has the
          same steel doors and none of the errands around it.
        </p>
        <p>
          Late in the evening the locker outside the supermarket is still lit. The parcel can sit behind a steel door
          until breakfast. The shop has already sold it, the driver has already finished the stop, and your
          evening never had to line up with either company&apos;s schedule.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
