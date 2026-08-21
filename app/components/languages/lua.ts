import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /--\[\[[\s\S]*?\]\]|--[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\[\[[\s\S]*?\]\]/),
  rule(
    "keyword",
    /\b(?:and|break|do|else|elseif|end|for|function|goto|if|in|local|not|or|repeat|return|then|until|while)\b/,
  ),
  rule("literal", /\b(?:true|false|nil|self)\b/),
  rule("number", /\b0x[\da-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*[({"'])/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%#^~]+/),
];
