import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("property", /[\w.$/-]+(?=\s*:(?:\s|$))/),
  rule("attribute", /[&*][\w-]+|!!?[\w/]+/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\n]|'')*'/),
  rule("literal", /\b(?:true|false|null|yes|no|on|off)\b|~/i),
  rule("number", /\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("plain", /[a-zA-Z_][\w./-]*|\s+/),
  rule("punctuation", /[-:>|[\]{},?]+/),
];
