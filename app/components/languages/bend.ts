import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule(
    "keyword",
    /\b(?:def|switch|case|when|if|else|elif|match|fold|bend|open|with|use|return|let|in|type|object|lambda|λ|do|ask|Some|None)\b/,
  ),
  rule("number", /\b0x[\da-f]+\b|\b\d+(?:\.\d+)?\b/i),
  rule("function", /[a-zA-Z_][\w.]*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*(?:\/\w+)?\b/),
  rule("property", /[a-zA-Z_]\w*(?=\s*:)/),
  rule("plain", /[a-zA-Z_][\w.]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~λ@$]+/),
];
