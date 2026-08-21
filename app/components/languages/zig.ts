import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|\\\\[^\n]*|'(?:[^'\\\n]|\\.)*'/),
  rule("function", /@\w+|[a-zA-Z_]\w*(?=\s*\()/),
  rule(
    "keyword",
    /\b(?:const|var|fn|pub|return|if|else|while|for|switch|defer|errdefer|try|catch|orelse|unreachable|break|continue|struct|enum|union|error|comptime|inline|export|extern|packed|align|volatile|allowzero|async|await|suspend|resume|test|and|or|usingnamespace|threadlocal|linksection)\b/,
  ),
  rule("literal", /\b(?:true|false|null|undefined)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule(
    "type",
    /\b(?:[iu]\d+|f16|f32|f64|f128|bool|void|type|anytype|anyerror|anyopaque|isize|usize|c_int|c_char|c_long|noreturn|[A-Z]\w*)\b/,
  ),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
