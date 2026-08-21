import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("property", /"(?:[^"\\\n]|\\.)*"(?=\s*:)/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule("literal", /\b(?:true|false|null)\b/),
  rule("number", /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\],:]+/),
];
