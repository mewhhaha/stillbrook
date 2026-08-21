import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("keyword", /@[\w-]+|::?[-\w]+/),
  rule("number", /#[\da-f]{3,8}\b|-?\d[\d.]*(?:%|[a-z]+)?/i),
  rule("function", /[-\w]+(?=\()/),
  rule("property", /[-a-z][-\w]*(?=\s*:)/),
  rule("type", /[.#&][-\w]+/),
  rule("plain", /[a-zA-Z][-\w]*|\s+/),
  rule("punctuation", /[{}();:,>~*+=[\]]+/),
];
