import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /%[^\n]*/),
  rule("keyword", /\\[a-zA-Z@]+\*?/),
  rule("string", /\$\$[\s\S]*?\$\$|\$[^$\n]*\$/),
  rule("property", /\{[^{}\n]*\}(?=\s*\{)|(?<=\\begin\{|\\end\{)[^}\n]*/),
  rule("attribute", /\[[^\]\n]*\]/),
  rule("number", /\b\d+(?:\.\d+)?(?:pt|mm|cm|in|em|ex|sp|bp|dd|pc)?\b/),
  rule("plain", /[a-zA-Z]+|\s+/),
  rule("punctuation", /[{}&~^_\\]+/),
];
