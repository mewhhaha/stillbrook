import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /--[^\n]*|\{-[\s\S]*?-\}/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)'/),
  rule(
    "keyword",
    /\b(?:module|import|exposing|as|type|alias|port|if|then|else|case|of|let|in|where)\b/,
  ),
  rule("literal", /\b(?:True|False)\b/),
  rule("number", /\b0x[\da-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-z_]\w*(?=\s*:(?!:))/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]();,.:=+\-*/<>!&|^\\]+/),
];
