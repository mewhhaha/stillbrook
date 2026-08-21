import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Refs should stop being files",
  description:
    "Git 3.0 plans to make reftable the default reference store, demoting the filesystem layout that tools have spent years mistaking for Git's branch API.",
  published: "2026-08-07T06:50:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Copyright_Card_Catalog_Drawer.jpg",
    alt: "An open Library of Congress card-catalog drawer sits on a wooden table, packed with rows of index cards.",
    credit: {
      author: "Michael Holley (Swtpc6800)",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Copyright_Card_Catalog_Drawer.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const filesLayout = `
  .git/
  ├── refs/heads/main
  ├── refs/tags/v1.0
  ├── packed-refs
  └── logs/refs/heads/main
`;

const reftableWrite = [
  {
    label: "Lock",
    title: "Take tables.list.lock",
    detail: "One writer chooses the next update index while readers keep their current snapshot.",
  },
  {
    label: "Write",
    title: "Create a new immutable table",
    detail: "The transaction's ref changes and reflog entries are written together into a temporary reftable.",
  },
  {
    label: "Publish",
    title: "Rename the table into place",
    detail: "The finished file receives its permanent name before the stack starts referring to it.",
  },
  {
    label: "Commit",
    title: "Replace tables.list",
    detail: "One rename publishes the new stack, so later readers see the whole transaction at once.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Git taught everyone a dangerous little trick: a branch looks like a text file. Open{" "}
          <code>.git/refs/heads/main</code> and, in an ordinary repository, you can often read the object ID with{" "}
          <code>cat</code>. A joy to inspect, and a trap: a generation of scripts learned to treat the storage
          layout as the interface.
        </p>
        <CodeBlock lang="text" title="The familiar files backend" code={filesLayout} highlight="2-5" />
        <p>
          Then <code>git pack-refs</code> moves names out of that directory and into <code>packed-refs</code>, while
          reflogs live under a parallel tree. The branch stayed the same even as Git moved the drawer. If your tool
          discovers branches by walking <code>.git/refs</code>, it has already confused a convenient implementation{" "}
          with Git.
        </p>
        <p>
          Git&apos;s current <a href="https://git-scm.com/docs/BreakingChanges">Git 3.0 breaking-change plan</a> says new
          repositories will eventually use <code>reftable</code> by default. Good. A reference is a named pointer with
          update rules, and the filesystem has been leaking its own rules into that namespace for long enough.
        </p>

        <H2>The namespace already outgrew the directory</H2>
        <p>
          The files backend has to reconcile two representations before it can answer a simple question. Loose refs
          are individual paths, packed refs are records in one flat file, and deleting a packed ref can require
          rewriting that file. The Git project&apos;s reftable design document uses Android as the uncomfortable end of
          this curve: one repository with 866,000 references. At that size, a branch list has stopped resembling a
          cute directory of forty-byte files.
        </p>
        <p>
          Filesystem semantics leak into names too. Git&apos;s breaking-change notes call out case-insensitive filesystems,
          where two refs that differ only by case cannot coexist with the files backend, and macOS filename
          normalization creates a similar problem for some Unicode spellings. Reftable stores reference names as
          records instead of paths, so the host filesystem does not get to reinterpret the namespace on the way to
          disk.
        </p>
        <p>
          The tree is lovely to poke at and a bad thing to build on. Git has commands for reading and updating
          refs precisely because callers should ask Git what <code>refs/heads/main</code> means instead of guessing
          which file currently happens to contain it.
        </p>
        <Callout variant="caution" title="The default has not changed yet">
          <p>
            Current <a href="https://git-scm.com/docs/git-init">git-init documentation</a> still calls reftable
            experimental, and the Git 3.0 page has no release date. The same plan says alternative implementations
            such as JGit, libgit2, and Gitoxide must support the format before the default can flip. I cannot tell from
            those documents when that ecosystem condition will be satisfied.
          </p>
          <p>
            Git already exposes <code>git init --ref-format=reftable</code> and{" "}
            <a href="https://git-scm.com/docs/git-refs"><code>git refs migrate --ref-format=reftable</code></a> for
            people who have checked their tooling. The migration command belongs in environments where every client
            in the path can read the result.
          </p>
        </Callout>

        <H2>One transaction should have one visible state</H2>
        <p>
          The nastier limitation is atomicity. The files backend creates separate files when a transaction updates
          several refs, so a reader can observe an in-between state while those writes land. Git&apos;s own 3.0 notes list
          this as a reason for changing the default. A ref transaction deserves the same boring property you expect
          from any other database update: readers get the old set or the new set.
        </p>
        <p>
          Reftable gets there with immutable files and one tiny stack manifest. The official format documentation lays
          out the write path explicitly:
        </p>
        <FlowSequence
          steps={reftableWrite}
          caption="A reftable transaction publishes a new immutable table by replacing the stack manifest only after the table is complete."
        />
        <p>
          Readers open <code>tables.list</code>, open the tables it names, and retry only if one disappeared before it
          could be opened. Once those files are open, that reader owns a consistent snapshot for as long as it needs
          it. Deletes become tombstones in a newer table, while geometric compaction folds old tables together later
          instead of forcing every small update through one giant rewrite.
        </p>
        <p>
          Prefix-compressed binary records are less charming than a directory you can inspect with <code>ls</code>.
          Fine. Git can give humans <code>git show-ref</code>, <code>git for-each-ref</code>, <code>git update-ref</code>,
          and <code>git reflog</code> while giving its storage engine the representation that fits the job. The object
          database crossed that line long ago. Nobody expects to edit a packfile with a text editor because loose
          objects were once easy to open.
        </p>
        <p>
          The compatibility detail I like most is almost comic. Reftable repositories still keep dummy filesystem
          artifacts so older clients recognize the directory as Git. The format documentation says <code>.git/HEAD</code>{" "}
          should contain <code>ref: refs/heads/.invalid</code>, beside a placeholder <code>.git/refs</code> tree. The
          files are still there, in other words. They just stopped meaning anything, which is roughly where this was
          always headed.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
