import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Bytes stop pretending to be text",
  description:
    "ECMAScript's Base64 methods put binary conversion on Uint8Array and make callers choose how forgiving a decoder should be.",
  published: "2026-07-16T14:00:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/bytes-stop-pretending-to-be-text-journal.webp",
    alt: "Black glass beads enter a brass four-part die while two incomplete marks wait at the edge.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const oldBase64Ritual = `
  const bytes = crypto.getRandomValues(new Uint8Array(12));

  const encoded = btoa(String.fromCharCode(...bytes));

  const decoded = Uint8Array.from(
    atob(encoded),
    character => character.charCodeAt(0),
  );
`;

const typedArrayBase64 = `
  const bytes = crypto.getRandomValues(new Uint8Array(12));

  const encoded = bytes.toBase64({
    alphabet: "base64url",
    omitPadding: true,
  });

  const decoded = Uint8Array.fromBase64(encoded, {
    alphabet: "base64url",
    lastChunkHandling: "strict",
  });
`;

const incrementalDecode = `
  const target = new Uint8Array(4096);
  const result = target.setFromBase64(chunk, {
    lastChunkHandling: "stop-before-partial",
  });

  chunk = chunk.slice(result.read);
  output.write(target.subarray(0, result.written));
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          You have twelve random bytes and need Base64 for a cookie or a URL. In browser JavaScript, the familiar
          move has been to turn each byte into a character, hand the resulting string to <code>btoa</code>, then
          perform the whole pantomime backward when the value returns. Read the code aloud and it sounds deranged.
          Why are bytes dressing up as text so that a binary encoder will speak to them?
        </p>
        <p>
          The platform finally has an honest answer.{" "}
          <a href="https://github.com/tc39/ecma262/blob/1355a23e48aaf2b1d7b6cbfad0fb98bce999cfd1/spec.html#L181">
            ECMAScript 2026 added Base64 conversion
          </a>{" "}
          directly to{" "}
          <code>Uint8Array</code>, where the binary value already lives, and the new decoder makes its tolerance
          an explicit option instead of folklore buried in a wrapper.
        </p>
        <CodeBlock lang="js" title="The binary-string detour" highlight="3,5-8" code={oldBase64Ritual} />
        <p>
          That intermediate string is stranger than its tidy one-liner suggests. The current{" "}
          <a href="https://github.com/whatwg/html/blob/7600b24f3e156a8c6fdabccf6c961df223835613/source#L124953-L125012">
            HTML specification
          </a>{" "}
          says both <code>btoa</code> and <code>atob</code> operate on Unicode strings for historical reasons.
          Every character passed to <code>btoa</code> must sit between U+0000 and U+00FF, and the algorithm then
          converts those code points back into eight-bit values. The string only carries numbers through an API
          that rejects the original array.
        </p>

        <H2>The bytes get the method</H2>
        <p>
          The{" "}
          <a href="https://github.com/tc39/ecma262/blob/1355a23e48aaf2b1d7b6cbfad0fb98bce999cfd1/spec.html#L43803-L43928">
            ECMAScript methods
          </a>{" "}
          make the call site almost suspiciously plain: <code>toBase64</code> reads a byte array.{" "}
          <code>Uint8Array.fromBase64</code> returns one. A partial <code>Uint8Array</code> view also keeps its
          boundary because the encoder reads that view's length, rather than wandering across the entire backing
          buffer.
        </p>
        <CodeBlock lang="js" title="Bytes on both sides" highlight="3-6,8-11" code={typedArrayBase64} />
        <p>
          Two options carry the protocol choices that Base64's name tends to hide. The alphabet may be ordinary
          Base64 or the URL-safe variant, and the encoder may omit padding. Those switches come from{" "}
          <a href="https://www.rfc-editor.org/rfc/rfc4648.html#section-5">RFC 4648's separate URL alphabet</a>,
          which replaces the two punctuation characters that cause trouble in filenames and URLs. You can now
          see the wire format at the conversion instead of guessing which local function called{" "}
          <code>encodeToken</code> meant which alphabet.
        </p>

        <H2>Forgiveness gets a name</H2>
        <p>
          Decoding is where the small API becomes worth arguing about. The decoder&apos;s tolerance is one named
          option, <code>lastChunkHandling</code>, and its strict setting follows{" "}
          <a href="https://www.rfc-editor.org/rfc/rfc4648.html#section-3.5">RFC 4648&apos;s canonical encoding</a>,
          which warns that nonzero pad bits let several strings represent the same bytes.
        </p>
        <Compare
          attributes={["Partial final chunk", "Nonzero pad bits", "What the caller keeps"]}
          entities={[
            {
              name: "loose (default)",
              values: [
                "a two- or three-character chunk decodes as though padded. A lone character still fails",
                "tolerated",
                "the full result, or an error",
              ],
            },
            {
              name: "strict",
              values: [
                "the final chunk must include its full padding",
                "rejected, since the unused bits must be zero",
                "the full result, or an error",
              ],
            },
            {
              name: "stop-before-partial",
              values: [
                "left unread until the next piece arrives",
                "—",
                <span key="tail">
                  every complete byte, plus <code>read</code> and <code>written</code> counts marking the tail
                </span>,
              ],
            },
          ]}
          caption={
            <>
              How each <code>lastChunkHandling</code> mode treats the end of the input.
            </>
          }
        />
        <p>
          A JWT-shaped token and a canonical value in a signed document should probably make different choices.
          I have not measured whether these methods beat a careful library on any engine, and speed is the least
          interesting promise here anyway. The useful change is visible policy: a reviewer can tell whether the
          parser requires canonical padding and which alphabet it expects without opening another file.
        </p>
        <CodeBlock lang="js" title="Decoding one complete prefix" highlight="2-4,6-7" code={incrementalDecode} />
        <p>
          The third mode, <code>"stop-before-partial"</code>, is for input that arrives in pieces. The{" "}
          <a href="https://github.com/tc39/ecma262/blob/1355a23e48aaf2b1d7b6cbfad0fb98bce999cfd1/spec.html#L43844-L43895">
            in-place decoder
          </a>{" "}
          writes only complete output into an existing array, so a caller never has to pretend that an
          incomplete quantum is malformed.
        </p>
        <p>
          At a network-chunk boundary, <code>setFromBase64</code> may leave the final two characters of{" "}
          <code>chunk</code> unread because they do not complete a four-character group. They sit there waiting
          for the next piece instead of being condemned as bad input.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
