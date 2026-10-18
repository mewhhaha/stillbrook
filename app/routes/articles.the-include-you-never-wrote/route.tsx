import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, H2, Prose } from "../../components";

export const article = {
  title: "The include you never wrote",
  description:
    "libc++ 23 is removing incidental transitive includes, turning a class of mysteriously successful C++ builds into small, useful compiler errors.",
  published: "2026-08-13T06:18:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-include-you-never-wrote-journal.webp",
    alt: "A hand fits a wooden wedge between two stools on a cluttered workbench.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const borrowedInclude = `
  #include <vector>

  int main() {
    std::vector<int> values{3, 1, 2};
    std::sort(values.begin(), values.end());
  }
`;

const compatibilityBlock = `
  #if defined(_LIBCPP_KEEP_TRANSITIVE_INCLUDES_LLVM23) && _LIBCPP_STD_VER <= 20
  #  include <algorithm>
  #  include <atomic>
  #  include <cctype>
  #  include <concepts>
  #  include <cstdint>
  #  include <iosfwd>
  #  include <optional>
  #  include <string>
  #  include <string_view>
  #  include <tuple>
  #  include <type_traits>
  #  include <utility>
  #endif
`;

const ownedInclude = `
  #include <algorithm>
  #include <vector>

  int main() {
    std::vector<int> values{3, 1, 2};
    std::sort(values.begin(), values.end());
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Here is a C++ file with a dependency missing from the top of it. Depending on your standard library and
          version, it may still compile. That is the annoying part.
        </p>
        <CodeBlock lang="cpp" title="sort.cpp" highlight="1,5" code={borrowedInclude} />
        <p>
          <code>std::sort</code> belongs to <code>&lt;algorithm&gt;</code>, but older libc++ releases could make the name
          visible while this file included only <code>&lt;vector&gt;</code>. The source borrowed an include from the
          implementation details of another header and never wrote the debt down.
        </p>
        <p>
          The current libc++ 23 release notes warn that a large set of those incidental transitive includes has been
          dropped in every language mode. Some builds will fail after the toolchain update. I think those failures are
          doing useful work: they point at dependencies the source already had and finally make the file admit them.
        </p>

        <H2>The old dependency is still in the header</H2>
        <p>
          The nicest piece of evidence is sitting in libc++ itself. On the 23 release branch, the public
          <a href="https://github.com/llvm/llvm-project/blob/release/23.x/libcxx/include/vector"> <code>vector</code>{" "}
          header</a> contains a compatibility block that can put the old incidental includes back. For C++20 and
          earlier, the list includes <code>&lt;algorithm&gt;</code> alongside a surprising amount of unrelated library
          surface.
        </p>
        <AnnotatedCode
          lang="cpp"
          title="libcxx/include/vector, compatibility excerpt"
          code={compatibilityBlock}
          notes={[
            {
              line: 1,
              note: <>
                The compatibility macro is an escape hatch for code that depended on LLVM 22&apos;s include graph.
              </>,
            },
            {
              line: 2,
              note: <>
                This is why a file using <code>std::sort</code> could get away without naming <code>&lt;algorithm&gt;</code>.
              </>,
            },
            {
              line: 8,
              note: <>
                <code>&lt;vector&gt;</code> also happened to expose names from <code>&lt;optional&gt;</code>, strings, tuples,
                traits, and other headers the vector synopsis does not promise.
              </>,
            },
          ]}
          caption="The compatibility block records part of the old accidental API of <vector>."
        />
        <p>
          That list is a useful reminder that transitive inclusion is not one neat chain. A public header includes
          private implementation headers, those need utilities, the utilities need traits, and soon a translation
          unit can see declarations that arrived through a path nobody writing the file intended. Change one internal
          edge and some unrelated source file stops finding a name.
        </p>
        <p>
          libc++ has been trying to reduce this for years. Its
          <a href="https://libcxx.llvm.org/DesignDocs/HeaderRemovalPolicy.html"> header-removal policy</a> names the
          tradeoff plainly: extra includes cost compile time and create accidental dependencies, but removing them can
          break users and leave toolchain vendors repairing upstream packages. Earlier cleanups were often tied to a
          new C++ language mode so that projects crossed the break deliberately. LLVM 23 is a broader cleanup, which
          is why it ships a compatibility macro instead.
        </p>

        <H2>A compiler error is cheaper than a hidden edge</H2>
        <p>
          The repair for the example is one line.
        </p>
        <CodeBlock lang="cpp" title="sort.cpp, with its own dependency" highlight="1" code={ownedInclude} />
        <p>
          Nothing about the program&apos;s behavior changed. The useful change is that a reader can now see why{" "}
          <code>std::sort</code> is available, and the file no longer depends on whether <code>&lt;vector&gt;</code>
          happens to need an algorithm internally this year. The same source is less coupled to libc++&apos;s private
          include graph, and usually more portable across standard-library implementations too.
        </p>
        <p>
          I would not turn this into a contest for the fewest possible includes. The C++ standard sometimes requires
          one public header to provide declarations from another, and implementations still need internal layering.
          The useful rule is narrower: when your source directly names a facility, include the public header that owns
          that facility instead of relying on a neighboring header to drag it in.
        </p>

        <H2>You can find the debt before the upgrade</H2>
        <p>
          libc++ exposes <code>_LIBCPP_REMOVE_TRANSITIVE_INCLUDES</code> for exactly this kind of testing. Define it and
          the library follows a stricter include policy even before a language-version transition. Its
          <a href="https://libcxx.llvm.org/UserDocumentation.html"> user documentation</a> also ships a mapping file for
          include-what-you-use, because automated include advice gets much better when the tool understands libc++&apos;s
          public and private header boundaries.
        </p>
        <p>
          There is a cost here. Large C++ trees can discover hundreds of missing direct includes at once, and distro
          maintainers are the people who get the first unpleasant morning when a new standard library reaches their
          builders. That is why the 23 release notes keep <code>_LIBCPP_KEEP_TRANSITIVE_INCLUDES_LLVM23</code> around as
          a migration switch rather than pretending every downstream project can be fixed in one pass. The same notes
          say the switch goes away in LLVM 24.
        </p>
        <p>
          So I would use the escape hatch to keep a release moving, then remove it by fixing the source. A build that
          breaks on <code>std::sort</code> after an upgrade looks like the library took something away. In this case the
          compiler is showing you a line the file should have contained all along: <code>#include &lt;algorithm&gt;</code>.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
