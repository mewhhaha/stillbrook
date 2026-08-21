import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /%[^\n]*/),
  rule("string", /"(?:[^"\\]|\\.)*"/),
  rule("attribute", /-[a-z]\w*(?=\s*\()|\?[A-Z_]\w*/),
  rule(
    "keyword",
    /\b(?:fun|case|of|end|if|when|receive|after|try|catch|throw|begin|and|or|not|andalso|orelse|band|bor|bxor|bnot|bsl|bsr|div|rem|maybe|else)\b/,
  ),
  rule("literal", /\b(?:true|false|undefined|ok|error)\b/),
  rule("number", /\b\d+#[\da-zA-Z]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\$./),
  rule("function", /[a-z]\w*(?=\s*\()|\b[a-z]\w*:[a-z]\w*(?=\s*\()/),
  rule("type", /\b[A-Z_]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]();,.:=+\-*/<>!|#?]+/),
];
