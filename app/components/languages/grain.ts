import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /@[\w.]+/),
  rule(
    "keyword",
    /\b(?:module|include|from|provide|abstract|foreign|wasm|primitive|exception|let|mut|rec|enum|record|type|if|else|while|for|continue|break|match|when|assert|fail|return|as|use|and|throw|try|catch)\b/,
  ),
  rule("literal", /\b(?:true|false|void)\b/),
  rule("number", /\b0[xbo][\da-f_]+[lLsS]?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[lLsSfFdD]?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@#]+/),
];
