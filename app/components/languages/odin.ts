import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"|`[^`]*`|'(?:[^'\\\n]|\\.)'/),
  rule("attribute", /#[a-z_]+|@\(?[\w,= ]*\)?/),
  rule(
    "keyword",
    /\b(?:package|import|foreign|proc|struct|enum|union|bit_set|map|dynamic|if|else|when|for|switch|case|in|not_in|defer|return|break|continue|fallthrough|using|transmute|cast|auto_cast|distinct|matrix|where|or_else|or_return|context|do)\b/,
  ),
  rule("literal", /\b(?:true|false|nil)\b|---/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[ij]?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule(
    "type",
    /\b(?:[iu](?:8|16|32|64|128)(?:le|be)?|int|uint|uintptr|f(?:16|32|64)(?:le|be)?|complex\d+|quaternion\d+|byte|rune|string|cstring|bool|b(?:8|16|32|64)|rawptr|typeid|any|[A-Z]\w*)\b/,
  ),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~$]+/),
];
