import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"/),
  rule("attribute", /@[\w.]+|%%?\w+/),
  rule(
    "keyword",
    /\b(?:let|rec|type|module|open|include|external|if|else|switch|when|for|while|in|to|downto|try|catch|exception|assert|lazy|and|as|async|await|private|mutable|constraint|of)\b/,
  ),
  rule("literal", /\b(?:true|false)\b|\(\)/),
  rule("number", /\b0x[\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b|'[a-z]\w*/),
  rule("property", /#[A-Za-z]\w*|~\w+/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
