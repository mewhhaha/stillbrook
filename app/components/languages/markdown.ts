import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("tag", /(?<=^|\n)#{1,6}[^\n]*/),
  rule("comment", /(?<=^|\n)>[^\n]*/),
  rule("string", /```[\s\S]*?```|`[^`\n]+`/),
  rule("property", /!?\[[^\]\n]*\]\([^)\n]*\)/),
  rule("keyword", /\*\*[^*\n]+\*\*|__[^_\n]+__/),
  rule("literal", /\*[^*\n]+\*|_[^_\n]+_/),
  rule("punctuation", /(?<=^|\n)(?:[-*+]|\d+\.)(?=\s)|(?<=^|\n)(?:---+|\*\*\*+|===+)(?=\n|$)/),
  rule("plain", /[^\n*_`[\]#>-]+|\s+|./),
];
