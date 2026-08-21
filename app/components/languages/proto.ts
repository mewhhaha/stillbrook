import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule(
    "keyword",
    /\b(?:syntax|package|import|option|message|enum|service|rpc|returns|repeated|optional|required|oneof|map|reserved|extend|extensions|to|max|stream|weak|public|group)\b/,
  ),
  rule("literal", /\b(?:true|false)\b/),
  rule(
    "type",
    /\b(?:double|float|int32|int64|uint32|uint64|sint32|sint64|fixed32|fixed64|sfixed32|sfixed64|bool|string|bytes|[A-Z]\w*)\b/,
  ),
  rule("number", /\b0x[\da-f]+\b|-?\b\d+(?:\.\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z_][\w.]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,=.]+/),
];
