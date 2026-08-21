import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\(\*[\s\S]*?\*\)/),
  rule("string", /"(?:[^"\\]|\\.)*"/),
  rule(
    "keyword",
    /\b(?:let|rec|in|fun|function|match|with|type|module|struct|sig|end|open|include|if|then|else|begin|and|mutable|of|when|as|try|exception|assert|lazy|do|done|while|for|to|downto|val|method|object|class|new|inherit|external|ref|not|mod|land|lor|lxor)\b/,
  ),
  rule("literal", /\b(?:true|false)\b|\(\)/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]*)?(?:e[+-]?\d+)?\b/i),
  rule("property", /'[a-z]\w*|~[a-z]\w*|`[A-Z]\w*/),
  rule("type", /\b[A-Z][\w']*\b/),
  rule("plain", /[a-zA-Z_][\w']*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@#$]+/),
];
