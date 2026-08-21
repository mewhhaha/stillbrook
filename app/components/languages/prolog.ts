import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /%[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/),
  rule("attribute", /:-|\?-/),
  rule(
    "keyword",
    /\b(?:is|not|fail|true|false|member|append|length|reverse|assert|asserta|assertz|retract|findall|bagof|setof|between|succ|atom|number|var|nonvar|atomic|compound|copy_term|functor|arg|call|catch|throw|halt|write|writeln|read|nl|forall|aggregate_all|msort|sort)\b/,
  ),
  rule("type", /\b[A-Z_]\w*\b/),
  rule("number", /\b0'.|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-z]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]();,.|!+\-*/<>=\\^]+/),
];
