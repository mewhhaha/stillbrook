import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, Divider, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "The route changes the road",
  description:
    "SUMO confronted the feedback between route choice and congestion in its earliest design, then made routing and simulation correct each other through an explicit iterative toolchain.",
  published: "2026-07-11T20:50:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/the-route-changes-the-road.jpg",
    alt: "Aerial view of a sprawling highway interchange in Dallas, its stacked ramps and lanes carrying streams of cars in every direction.",
    credit: {
      author: "Michael Barera",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:View_of_interchange_from_Reunion_Tower_August_2015_02.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const assignmentSteps = [
  {
    label: "Guess",
    title: "Route on free-flow costs",
    detail: "The first pass treats every edge as though the network were still empty.",
  },
  {
    label: "Load",
    title: "Run every vehicle",
    detail: "SUMO turns those choices into queues, delays, and missed green lights.",
  },
  {
    label: "Measure",
    title: "Write experienced costs",
    detail: "Observed edge travel times replace the optimistic first estimate.",
  },
  {
    label: "Repeat",
    title: "Choose routes again",
    detail: "Probabilities and memory keep the whole population from switching at once.",
  },
] as const;

const currentLoop = `
  for step in range(options.firstStep, options.lastStep):
      cfgname = writeRouteConf(...)
      ret = call([duaBinary, "-c", cfgname], log)

      sumocfg = writeSUMOConf(...)
      ret = call([sumoBinary, "-c", sumocfg], log)
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="7 min read">
      <Prose>
        <p>
          I opened SUMO&apos;s 2002 paper expecting a museum piece: blocky road diagrams, a benchmark
          from a 933 MHz Pentium, and a graphical interface still listed as future work. The first page
          stopped me before any of that. Drivers choose departure times and routes partly because of
          network load, the authors explain, while those choices create the load they were responding to.
        </p>
        <p>
          SUMO development had begun only two years earlier. Yet the paper already treated that feedback
          as the central modeling problem, instead of postponing it until the simulator worked. Its proposed
          answer was to route vehicles, simulate the resulting traffic, measure the changed travel times,
          and route them again. The route planner had to become part of the traffic it predicted.
        </p>
        <p>
          That decision still shapes the project. The current toolchain remains split across a router and
          a simulator, with an iterative script feeding each simulation&apos;s measured travel times back
          into the next routing pass.
        </p>

        <H2>The shortest route lies</H2>
        <p>
          A shortest-path algorithm needs edge costs. For a road network, those costs include travel time,
          and SUMO&apos;s current{" "}
          <a href="https://sumo.dlr.de/docs/Demand/Dynamic_User_Assignment.html">
            dynamic user assignment guide
          </a>{" "}
          points out the circular dependency plainly: travel time depends on how many vehicles use the
          edge, which remains unknown until the assignment has been simulated.
        </p>
        <p>
          Give every driver the fastest route through an empty network and the answer invalidates itself.
          The bottleneck fills, its travel time rises, and a previously slower alternative may become the
          better choice. Of course the first iteration jams — every car received the same private shortcut.
        </p>
        <FlowSequence
          steps={assignmentSteps}
          caption="The measured network feeds the next routing pass; the answer changes the costs used to produce it."
        />
        <p>
          Repetition alone would produce a different mess. If every vehicle abandons route A for route B
          after one bad run, B becomes the next jam and the population can slosh back again. SUMO keeps
          alternative routes and adjusts their probabilities with methods such as Gawron, Logit, or
          successive averages. Those algorithms differ in how quickly they let the newest measurement
          override what the earlier runs suggested.
        </p>
        <p>
          The target is a dynamic user equilibrium: after the assignment settles, an individual vehicle
          cannot lower its own expected cost by changing routes. That definition matters because SUMO is
          solving for the choices travelers make, and those choices have to hold up inside the traffic
          they collectively cause.
        </p>

        <H2>The loop became the architecture</H2>
        <p>
          The early team could have placed network import, route generation, vehicle movement, and output
          behind one executable. Instead, the{" "}
          <a href="https://sumo.dlr.de/docs/SUMO_at_a_Glance.html">project history</a>{" "}
          says the first command-line versions were divided into separate applications. A network converter
          built the graph, a router assigned trips, and the simulator loaded the result. Purpose-specific
          data structures kept each program smaller and made individual parts replaceable, though the same
          page admits that the split is less comfortable for users.
        </p>
        <p>
          I assumed the present implementation would hide a grand equilibrium solver behind that toolchain.
          Then I opened{" "}
          <a href="https://github.com/eclipse-sumo/sumo/blob/main/tools/assign/duaIterate.py">
            <code>duaIterate.py</code>
          </a>{" "}
          and found an ordinary loop orchestrating two binaries. The important lines are almost rude in
          their simplicity:
        </p>
        <CodeBlock
          lang="text"
          title="tools/assign/duaIterate.py (abridged)"
          highlight="1-3,5-6"
          code={currentLoop}
        />
        <p>
          Each step writes a routing configuration, runs <code>duarouter</code>, writes a simulation
          configuration, and runs <code>sumo</code>. The next routing pass reads travel-time dumps produced
          by the previous simulation. Numbered directories preserve the route files, logs, edge costs, and
          summaries from every attempt.
        </p>
        <p>
          The current script dates its header to February 13, 2008. Six years earlier, Daniel Krajzewicz,
          Georg Hertkorn, Peter Wagner, and Christian Rössel had already described the repeated
          route-and-simulate approach in their{" "}
          <a href="https://eclipse.dev/sumo/documents/dkrajzew_MESM2002_SUMO.pdf">
            2002 SUMO paper
          </a>. The files and options have multiplied since then, while the handoff between route choice
          and observed congestion remains the same.
        </p>
        <p>
          That visibility was part of the open-source argument too. The paper criticizes commercial traffic
          simulators whose internal models could not be examined or extended. Splitting SUMO
          into tools made the seams inconvenient, but it also gave researchers places to replace a router,
          import another network format, or inspect the costs passed between stages.
        </p>

        <H2>Convergence has a file system</H2>
        <p>
          Every iteration writes another batch of routes, logs, and measured costs, so long runs accumulate
          storage quickly. SUMO&apos;s documentation warns that iterative assignment can consume copious disk
          space, and the default run performs fifty iterations. Some scenarios continue producing different
          results after a thousand. I have not reproduced a city-scale thousand-iteration run; I am taking
          the maintainers&apos; warning at face value, and the directory layout makes it easy to believe.
        </p>
        <p>
          Early passes are especially ugly because free-flow costs concentrate vehicles on the same routes.
          The tooling offers several ways to soften the shock: ramp demand up over iterations, remember
          older edge weights, discourage abrupt route switching, or begin from an existing assignment.
          Configuration decides how much influence an older observation retains in the next run.
        </p>
        <p>
          The loop is also stubbornly sequential. The current guide says <code>duaIterate.py</code> has no
          parallelization path, because each simulation produces the costs required by the next routing
          pass. Even the measurements have a resolution problem: an average edge travel time can understate
          congestion that affects one turning movement but not another, and the routing pass that reads
          the average never learns which turn was the slow one.
        </p>
        <p>
          These rough edges are the downside of meeting the feedback head on. SUMO exposes knobs for route
          probability, cost memory, pessimism, convergence deviation, and marginal costs because scenarios
          respond differently to new measurements. A sealed optimizer could offer one green button. The
          button would choose those policies on your behalf and leave fewer clues when the assignment
          oscillated.
        </p>

        <Divider />

        <H2>Everybody can be locally right</H2>
        <p>
          User equilibrium has a nasty property: every driver can be unable to improve their own route while
          the network remains worse than it could be for everyone together. SUMO therefore also supports an
          approximation of system-optimal assignment, where routes include the marginal delay a vehicle
          imposes on others. The same roads and trips produce a different answer because the objective has
          changed.
        </p>
        <Compare
          attributes={["Objective", "Edge cost", "Driver's choice", "Tradeoff"]}
          entities={[
            {
              name: "User equilibrium",
              values: [
                "No traveler can improve their own expected trip",
                "The travel time that driver experiences",
                "The fastest route available to that vehicle",
                "Individually stable while total delay may remain high",
              ],
            },
            {
              name: "System optimum",
              values: [
                "Lower total cost across the network",
                "Experienced travel time plus delay imposed on others",
                "Some vehicles absorb a slower route",
                "Needs a controller and a decision about who yields",
              ],
            },
          ]}
          caption="The same roads produce different assignments once the optimizer changes whose time counts."
        />
        <p>
          Current tooling can even mix the two populations, treating some vehicles as ordinary travelers
          seeking their own fastest route and others as centrally controlled vehicles pursuing lower total
          cost. That feature turns an old modeling loop into a contemporary question about navigation apps,
          fleet control, and who gets asked to absorb a slower trip for the network&apos;s benefit.
        </p>
        <p>
          I like that SUMO makes “optimal routing” incomplete until you name the objective. Optimal for one
          driver, for average travel time, for emissions, or for a controller with authority over only part
          of the fleet? The simulator can calculate several versions, but the developer still has to state
          which inconvenience belongs to whom.
        </p>
        <p>
          When <code>duaIterate.py</code> finishes its default run, the working directory is lined with{" "}
          <code>000/</code> through <code>049/</code>. Each folder holds a route plan, the traffic it created,
          and measurements that made the next folder necessary. The final assignment sits beside forty-nine
          earlier answers, each followed by a traffic run that showed where its cost map had lied.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
