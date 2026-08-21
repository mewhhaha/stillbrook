import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /@[A-Za-z]\w*/),
  rule(
    "keyword",
    /\b(?:abstract|as|break|by|catch|class|companion|constructor|continue|crossinline|data|do|else|enum|final|finally|for|fun|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|super|suspend|tailrec|throw|try|typealias|val|var|when|where|while)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this|it)\b/),
  rule("number", /\b0[xb][\da-f_]+L?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fFL]?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*[({])/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
