import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'/),
  rule("property", /:[\w?!]+|@@?\w+/),
  rule(
    "keyword",
    /\b(?:abstract|alias|annotation|as|begin|break|case|class|def|do|else|elsif|end|ensure|enum|extend|for|fun|if|in|include|instance_sizeof|lib|macro|module|next|of|offsetof|out|pointerof|private|protected|require|rescue|return|select|sizeof|struct|super|then|type|typeof|uninitialized|union|unless|until|verbatim|when|while|with|yield|property|getter|setter|record)\b/,
  ),
  rule("literal", /\b(?:true|false|nil|self)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?(?:_?[iuf]\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*[?!]?(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*[?!]?|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
