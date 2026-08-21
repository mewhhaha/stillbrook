import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("attribute", /#!?\[[^\n]*?\]/),
  rule("string", /b?"(?:[^"\\\n]|\\.)*"|b?'(?:[^'\\\n]|\\.)'/),
  rule(
    "keyword",
    /\b(?:abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
  ),
  rule("literal", /\b(?:true|false)\b/),
  rule(
    "number",
    /\b0[xbo][\da-f_]+(?:u|i)?(?:8|16|32|64|128|size)?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?(?:u|i|f)?(?:8|16|32|64|128|size)?\b/i,
  ),
  rule("function", /[a-zA-Z_]\w*(?=\s*!|\s*(?:<[^>\n]*>)?\s*\()/),
  rule(
    "type",
    /\b(?:u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|bool|char|str|[A-Z][A-Za-z0-9_]*)\b/,
  ),
  rule("property", /'[a-zA-Z_]\w*/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@#]+/),
];
