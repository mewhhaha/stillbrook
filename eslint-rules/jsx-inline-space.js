/**
 * Flags prose where JSX's whitespace rules swallow the space between an inline
 * element and an adjacent word.
 *
 * When an inline element (`<a>`, `<code>`, `<em>`, …) sits on its own line, the
 * newline separating it from the neighbouring text is stripped at build time,
 * so the words render jammed together ("1971minimal-group", "turncall_indirect").
 * The fix is an explicit `{" "}` at the boundary, which this rule inserts.
 *
 * It reproduces JSX's own rules, so it only fires on the failure case:
 * - a newline-only separator is swallowed → flagged,
 * - a same-line space is preserved by JSX → allowed,
 * - an explicit `{" "}` is a separate sibling → allowed,
 * - direct attachment with no whitespace (`<code>a</code>s` plural) → allowed.
 *
 * Edge whitespace *inside* the element follows the same JSX rules: a
 * same-line space (`<a> text</a>`) survives, but a newline-containing run
 * (`<a>\n  text\n</a>`, the multi-line anchor shape) is stripped at build
 * time and cannot supply the boundary's space.
 */

const INLINE_TAGS = new Set([
  "a", "code", "em", "strong", "i", "b", "kbd", "abbr", "sup", "sub",
  "mark", "small", "cite", "q", "time", "var", "samp", "ins", "del", "u", "s",
]);

// "Word-ish" across the languages these essays use (accents, digits).
const WORD = /[\p{L}\p{N}]/u;
// Delimiters that still want a space against a neighbouring word: an opening
// quote/paren beginning an element, or a closing one ending it. Straight quotes
// sit in both sets; their position (start vs end of the element) disambiguates.
const OPEN_DELIM = /["'“‘«([{¿¡]/u;
const CLOSE_DELIM = /["'”’»)\]}]/u;
// Sentence punctuation ending the left side of a boundary ("array." before
// <code>, "default," before <a>) still wants the space that follows it.
const SENTENCE_PUNCT = /[.,:;!?…]/u;

/** Decode the entity forms these essays use, for character-class checks only. */
function decodeEntities(str) {
  return str
    .replace(/&(?:quot|#34|#x22);/gi, '"')
    .replace(/&(?:apos|#39|#x27);/gi, "'")
    .replace(/&(?:ldquo|#8220);/gi, "“")
    .replace(/&(?:rdquo|#8221);/gi, "”")
    .replace(/&(?:lsquo|#8216);/gi, "‘")
    .replace(/&(?:rsquo|#8217);/gi, "’")
    .replace(/&(?:laquo|#171);/gi, "«")
    .replace(/&(?:raquo|#187);/gi, "»")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

function isInlineElement(node) {
  return (
    node &&
    node.type === "JSXElement" &&
    node.openingElement.name.type === "JSXIdentifier" &&
    INLINE_TAGS.has(node.openingElement.name.name)
  );
}

/**
 * The concatenated text an element renders, following nested inline elements,
 * with entities decoded. For character-class checks only — never for source
 * offsets, since decoding changes lengths.
 */
function elementText(node) {
  let out = "";
  for (const child of node.children) {
    if (child.type === "JSXText") {
      out += decodeEntities(child.value);
    } else if (child.type === "JSXElement") {
      out += elementText(child);
    } else if (
      child.type === "JSXExpressionContainer" &&
      child.expression.type === "Literal" &&
      typeof child.expression.value === "string"
    ) {
      out += child.expression.value;
    }
  }
  return out;
}

function firstNonWs(str) {
  const m = /\S/.exec(str);
  return m ? { char: m[0], index: m.index } : null;
}

function lastNonWs(str) {
  for (let i = str.length - 1; i >= 0; i -= 1) {
    if (!/\s/.test(str[i])) return { char: str[i], index: i };
  }
  return null;
}

function lastWord(str) {
  const parts = str.trimEnd().split(/\s+/);
  return parts[parts.length - 1].slice(-24);
}

function firstWord(str) {
  return str.trimStart().split(/\s+/)[0].slice(0, 24);
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require an explicit space where JSX would otherwise swallow the newline between prose text and an inline element.",
    },
    fixable: "code",
    schema: [],
    messages: {
      swallowed:
        'Swallowed space: JSX strips this newline, so "{{left}}" and "{{right}}" render with no space between them. Add {" "} at the boundary.',
    },
  },
  create(context) {
    function checkChildren(children) {
      for (let i = 0; i < children.length - 1; i += 1) {
        const a = children[i];
        const b = children[i + 1];

        // Case A — inline element then text: the space after the element.
        // The element ends a word or a quoted/parenthesised phrase; the text
        // resumes with a word.
        if (isInlineElement(a) && b.type === "JSXText") {
          const eText = elementText(a);
          const lastE = lastNonWs(eText);
          const firstT = firstNonWs(b.value);
          if (
            lastE && firstT &&
            // The element does not already end with a preserved space of its
            // own: trailing whitespace with a newline is stripped by JSX.
            (lastE.index === eText.length - 1 || eText.slice(lastE.index + 1).includes("\n")) &&
            (WORD.test(lastE.char) || CLOSE_DELIM.test(lastE.char) || SENTENCE_PUNCT.test(lastE.char)) &&
            WORD.test(firstT.char)
          ) {
            const leadingWs = b.value.slice(0, firstT.index);
            if (leadingWs.includes("\n")) {
              context.report({
                node: b,
                messageId: "swallowed",
                data: { left: lastWord(eText), right: firstWord(b.value) },
                fix: (fixer) => fixer.insertTextAfter(a, '{" "}'),
              });
            }
          }
        }

        // Case B — text then inline element: the space before the element.
        // The text ends with a word; the element opens with a word or a quote
        // or paren beginning a phrase. a.value stays raw so the fix offset maps
        // to source; only firstE is checked against decoded element text.
        if (a.type === "JSXText" && isInlineElement(b)) {
          const lastT = lastNonWs(a.value);
          const eText = elementText(b);
          const firstE = firstNonWs(eText);
          if (
            lastT && firstE &&
            // The element does not already begin with a preserved space of its
            // own: leading whitespace with a newline is stripped by JSX.
            (firstE.index === 0 || eText.slice(0, firstE.index).includes("\n")) &&
            (WORD.test(lastT.char) || SENTENCE_PUNCT.test(lastT.char)) &&
            (WORD.test(firstE.char) || OPEN_DELIM.test(firstE.char))
          ) {
            const trailingWs = a.value.slice(lastT.index + 1);
            if (trailingWs.includes("\n")) {
              const at = a.range[0] + lastT.index + 1;
              context.report({
                node: a,
                messageId: "swallowed",
                data: { left: lastWord(a.value), right: firstWord(eText) },
                fix: (fixer) => fixer.insertTextAfterRange([at, at], '{" "}'),
              });
            }
          }
        }

        // Case C — two inline elements separated only by a newline: the
        // whitespace-only text between them is stripped, jamming both.
        if (isInlineElement(a) && b.type === "JSXText" && b.value.trim() === "" && b.value.includes("\n")) {
          const c = children[i + 2];
          if (isInlineElement(c)) {
            const aText = elementText(a);
            const cText = elementText(c);
            const lastE = lastNonWs(aText);
            const firstC = firstNonWs(cText);
            if (
              lastE && firstC &&
              (lastE.index === aText.length - 1 || aText.slice(lastE.index + 1).includes("\n")) &&
              (firstC.index === 0 || cText.slice(0, firstC.index).includes("\n")) &&
              WORD.test(lastE.char) && WORD.test(firstC.char)
            ) {
              context.report({
                node: b,
                messageId: "swallowed",
                data: { left: lastWord(elementText(a)), right: firstWord(elementText(c)) },
                fix: (fixer) => fixer.insertTextAfter(a, '{" "}'),
              });
            }
          }
        }
      }
    }

    return {
      JSXElement(node) {
        checkChildren(node.children);
      },
      JSXFragment(node) {
        checkChildren(node.children);
      },
    };
  },
};
