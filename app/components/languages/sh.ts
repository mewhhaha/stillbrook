import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/),
  rule("property", /\$\{[^}\n]*\}|\$\w+/),
  rule(
    "keyword",
    /\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|exit|export|local|set|source|echo|cd)\b/,
  ),
  rule("attribute", /(?<=\s)--?[\w-]+/),
  rule("number", /\b\d+\b/),
  rule("plain", /[a-zA-Z_][\w./-]*|\s+/),
  rule("punctuation", /[|&;<>(){}[\]=]+/),
];
