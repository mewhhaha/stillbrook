import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /<!--[\s\S]*?-->|<!doctype[^>]*>/i),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("tag", /(?<=<\/?)[a-zA-Z][\w-]*/),
  rule("attribute", /[\w-]+(?==)/),
  rule("plain", /[a-zA-Z]\w*|\s+/),
  rule("punctuation", /[<>/=!-]+/),
];
