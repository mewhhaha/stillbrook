import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /(?:[rbuf]{0,2})(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/i),
  rule("attribute", /@[\w.]+/),
  rule(
    "keyword",
    /\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|lambda|pass|break|continue|global|nonlocal|yield|assert|del|async|await|match|case|is)\b/,
  ),
  rule("literal", /\b(?:True|False|None|self|cls)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?j?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@]+/),
];
