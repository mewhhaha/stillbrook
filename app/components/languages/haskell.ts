import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("attribute", /\{-#[\s\S]*?#-\}/),
  rule("comment", /--[^\n]*|\{-[\s\S]*?-\}/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule(
    "keyword",
    /\b(?:module|where|import|qualified|hiding|data|type|newtype|class|instance|deriving|via|let|in|do|case|of|if|then|else|infixl|infixr|infix|foreign|forall|mdo|pattern)\b/,
  ),
  rule("literal", /\b(?:True|False|otherwise|undefined)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /`[a-zA-Z_][\w']*`|[a-z_][\w']*(?=\s*::)/),
  rule("type", /\b[A-Z][\w']*\b/),
  rule("string", /'(?:[^'\\\n]|\\[^\n])'/),
  rule("plain", /[a-zA-Z_][\w']*|\s+/),
  rule("punctuation", /[{}[\]();,.:=+\-*/%!&|?^~@#<>\\$]+/),
];
