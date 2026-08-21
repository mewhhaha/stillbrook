import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /--[^\n]*/),
  rule("string", /"(?:[^"\n]|"")*"/),
  rule(
    "keyword",
    /\b(?:abort|abstract|accept|access|aliased|all|and|array|at|begin|body|case|constant|declare|delay|delta|digits|do|else|elsif|end|entry|exception|exit|for|function|generic|goto|if|in|interface|is|limited|loop|mod|new|not|null|of|or|others|out|overriding|package|pragma|private|procedure|protected|raise|range|record|rem|renames|requeue|return|reverse|select|separate|some|subtype|synchronized|tagged|task|terminate|then|type|until|use|when|while|with|xor)\b/i,
  ),
  rule("literal", /\b(?:True|False)\b/),
  rule("number", /\b\d[\d_]*(?:#[\da-f_]+#)?(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*(?:_\w+)*\b/),
  rule("property", /'\w+/),
  rule("plain", /[a-zA-Z]\w*|\s+/),
  rule("punctuation", /[();,:=+\-*/<>&.|]+/),
];
