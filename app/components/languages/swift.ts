import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"/),
  rule("attribute", /@[A-Za-z]\w*/),
  rule(
    "keyword",
    /\b(?:actor|any|as|associatedtype|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|do|else|enum|extension|fileprivate|final|for|func|guard|if|import|in|indirect|init|internal|is|lazy|let|mutating|nonmutating|open|operator|override|private|protocol|public|repeat|required|rethrows|return|self|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|var|weak|where|while)\b/,
  ),
  rule("literal", /\b(?:true|false|nil)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$\\]+/),
];
