import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"/),
  rule("attribute", /@\w+/),
  rule("property", /\$\w+|[a-z_]\w*(?=\s*:)/i),
  rule(
    "keyword",
    /\b(?:query|mutation|subscription|fragment|on|type|input|interface|union|enum|scalar|schema|directive|extend|implements|repeatable)\b/,
  ),
  rule("literal", /\b(?:true|false|null)\b/),
  rule("number", /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()!:=|&.]+/),
];
