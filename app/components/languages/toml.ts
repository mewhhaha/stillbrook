import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("tag", /(?<=^|\n)\s*\[\[?[^\]\n]+\]\]?/),
  rule("property", /[\w.-]+(?=\s*=)/),
  rule("string", /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/),
  rule("literal", /\b(?:true|false)\b/),
  rule("number", /\b\d{4}-\d\d-\d\d(?:[tT ][\d:.+-zZ]+)?\b|\b0[xbo][\da-f_]+\b|[+-]?\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b|[+-]?\b(?:inf|nan)\b/i),
  rule("plain", /[a-zA-Z_][\w.-]*|\s+/),
  rule("punctuation", /[=[\]{},.]+/),
];
