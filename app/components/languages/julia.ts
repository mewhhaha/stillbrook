import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#=[\s\S]*?=#|#[^\n]*/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)'/),
  rule("attribute", /@[\w!]+/),
  rule(
    "keyword",
    /\b(?:function|end|if|elseif|else|for|while|begin|let|local|global|const|return|break|continue|macro|struct|mutable|abstract|primitive|type|quote|do|module|baremodule|using|import|export|try|catch|finally|throw|where|in|isa)\b/,
  ),
  rule("literal", /\b(?:true|false|nothing|missing|undef|NaN|Inf)\b/),
  rule("number", /\b0[xb][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?(?:im)?\b/i),
  rule("function", /[a-zA-Z_][\w!]*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_][\w!]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~$\\]+/),
];
