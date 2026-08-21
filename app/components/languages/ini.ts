import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /[;#][^\n]*/),
  rule("tag", /(?<=^|\n)\s*\[[^\]\n]+\]/),
  rule("property", /[\w.-]+(?=\s*=)/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/),
  rule("literal", /\b(?:true|false|yes|no|on|off|none|null)\b/i),
  rule("number", /\b\d+(?:\.\d+)?\b/),
  rule("plain", /[a-zA-Z_][\w./:\\-]*|\s+/),
  rule("punctuation", /[=,]+/),
];
