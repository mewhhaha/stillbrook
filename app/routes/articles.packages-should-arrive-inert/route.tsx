import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Packages should arrive inert",
  description:
    "npm 12 separates fetching a dependency from granting its install script permission to execute, and records that permission where a reviewer can see it.",
  published: "2026-08-05T06:25:00Z",
  author: "Mira Voss",
  tags: ["software", "security"],
  image: {
    src: "/images/articles/packages-should-arrive-inert.jpg",
    alt: "A person leans into a camera on a tripod while inspecting a distant scene.",
    credit: {
      author: "Lav Varshney",
      license: "CC0",
      href: "https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.camera",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const approvalCommands = `
  npm install-scripts ls
  npm install-scripts approve canvas sharp
  npm install-scripts deny telemetry-pkg
`;

const approvalNotes = [
  {
    line: 1,
    note: "List dependency scripts that npm skipped because the project has not made a decision about them.",
  },
  {
    line: 2,
    note: "Record approvals in package.json, pinned to the installed versions by default.",
  },
  {
    line: 3,
    note: "Write a name-wide false entry that survives a later blanket approval.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          In May, one compromised npm account published malicious versions across hundreds of packages
          in an automated 22-minute burst. Each version added a <code>preinstall</code> hook. According
          to the <a href="https://osv.dev/vulnerability/MAL-2026-4073">OSV record</a>, that hook went
          hunting for cloud credentials, package tokens, SSH keys, database strings, and whatever else
          the machine had made convenient.
        </p>
        <p>
          Your application never had to import any of it. Installing was enough. You could pin the
          version, verify the integrity hash, and still faithfully run the attacker&apos;s exact bytes
          before your own program started.
        </p>
        <p>
          npm 12, released on July 8, finally makes dependency install scripts opt-in. About time. A
          package should be allowed to arrive on disk before it is allowed to act.
        </p>

        <H2>Install had two jobs</H2>
        <p>
          Package installation has always looked like one operation at the prompt. Underneath, npm was
          doing two jobs with different consequences: resolving and unpacking code, then passing
          lifecycle commands to <code>/bin/sh</code> or <code>cmd.exe</code>. The official
          <a href="https://docs.npmjs.com/cli/using-npm/scripts/"> scripts documentation</a> lists{" "}
          <code>preinstall</code>, <code>install</code>, and <code>postinstall</code>, plus an implicit{" "}
          <code>node-gyp rebuild</code> when a package ships <code>binding.gyp</code> without its own
          install command.
        </p>
        <p>
          Those scripts have legitimate work. Native modules compile for the target machine; packages
          download platform-specific binaries or generate assets. They can also execute any program the
          shell accepts, and npm&apos;s own documentation points out that the program need not be JavaScript.
          Why did unpacking a library carry that authority by default?
        </p>
        <p>
          <a href="https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/">
            npm 12 changes the default
          </a>
          . Dependency lifecycle scripts and implicit native builds stay quiet unless the project
          explicitly allows them. Git dependencies and remote tarball URLs now need separate permission
          too, closing two more routes where a dependency declaration could smuggle execution into an
          ordinary install.
        </p>

        <H2>The permission belongs in git</H2>
        <p>
          The useful part survives the prompt asking whether you trust <code>sharp</code> today. npm
          writes the answer into the project&apos;s <code>package.json</code>, where another developer and CI
          receive the same policy. The
          <a href="https://docs.npmjs.com/cli/v12/commands/npm-install-scripts/"> review commands</a>{" "}
          are deliberately boring:
        </p>
        <AnnotatedCode
          lang="sh"
          title="Reviewing dependency install scripts"
          code={approvalCommands}
          notes={approvalNotes}
          caption="All three decisions are written into package.json rather than stored in a local prompt history."
        />
        <p>
          By default, approval is pinned to the installed version. Upgrade that package and the old
          permission stops matching, so npm skips the new script and puts the package back on the review
          list. A denial travels the other way: it is name-wide, because denying only one version would
          quietly allow the next one. That asymmetry is my favorite part of the design — the decision
          that can hurt you expires on every upgrade, and the one that protects you sticks around.
        </p>
        <p>
          This will break real builds. Native dependencies that used to compile invisibly now require a
          manifest change, and the current command is unaware of workspaces. I cannot estimate the
          migration cost for a large monorepo from the release notes. The inconvenience is still the
          point: a repository that needs code execution during installation should carry the decision in
          a reviewable file instead of relying on every developer to remember a flag.
        </p>
        <p>
          There is an escape hatch named <code>--dangerously-allow-all-scripts</code>, which is admirably
          unwilling to pretend. Global installs and <code>npx</code> remain awkward as well because they
          have no project manifest; their approvals live in a command-line option or user configuration.
          A repository can at least keep its own decision beside the dependency list.
        </p>

        <H2>Origin cannot grant permission</H2>
        <p>
          A provenance attestation answers who produced the release. PyPI&apos;s
          <a href="https://docs.pypi.org/attestations/publish/v1/"> publish-attestation specification</a>{" "}
          can bind a file to a particular CI identity, while carefully saying this raises confidence in
          integrity and does not necessarily establish trustworthiness. A compromised maintainer or
          approved workflow can still publish harmful behavior. Install-script policy records the
          separate decision about what that release may do on your machine.
        </p>
        <p>
          Registry reputation only accumulates after the tarball is public. GitHub now gives ordinary
          Dependabot version
          updates a <a href="https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/">
            three-day cooldown
          </a>, and its advisory database{" "}
          <a href="https://github.blog/changelog/2026-07-28-dependabot-alerts-on-malicious-packages-across-more-ecosystems/">
            began ingesting the OpenSSF malicious-package feed across more ecosystems
          </a>{" "}
          in July. Both changes buy time for somebody to notice the bad release. Default-deny
          install scripts protect the first machine in line, before an advisory exists.
        </p>
        <p>
          The next version of a legitimate native package may still stop a clean install. npm will leave
          its files in <code>node_modules</code>, print the skipped script, and wait. The durable result is
          a small diff in <code>package.json</code>, where a reviewer has to add a versioned <code>true</code>{" "}
          before that dependency can touch the shell.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
