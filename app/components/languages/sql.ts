import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /--[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /'(?:[^'\\\n]|\\.|'')*'/),
  rule(
    "keyword",
    /\b(?:select|from|where|insert|into|values|update|set|delete|create|table|index|view|drop|alter|add|column|primary|key|foreign|references|join|left|right|inner|outer|full|cross|on|as|and|or|not|is|in|exists|between|like|ilike|order|by|group|having|limit|offset|union|all|distinct|case|when|then|else|end|begin|commit|rollback|transaction|constraint|unique|default|check|if|returning|with|asc|desc|cascade|explain|analyze|vacuum)\b/i,
  ),
  rule("literal", /\b(?:true|false|null)\b/i),
  rule(
    "type",
    /\b(?:int|integer|bigint|smallint|serial|bigserial|text|varchar|char|boolean|date|time|timestamp|timestamptz|interval|numeric|decimal|real|double precision|uuid|jsonb?|bytea|blob)\b/i,
  ),
  rule("number", /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[();,.*=<>!+\-/%]+/),
];
