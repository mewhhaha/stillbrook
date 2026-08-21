import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)'/),
  rule("attribute", /@[A-Za-z]\w*/),
  rule(
    "keyword",
    /\b(?:abstract|case|catch|class|def|do|else|enum|extends|extension|final|finally|for|forSome|given|if|implicit|import|lazy|match|new|object|override|package|private|protected|return|sealed|super|then|throw|trait|try|type|using|val|var|while|with|yield)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this)\b/),
  rule("number", /\b0x[\da-f_]+L?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fFdDlL]?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@]+/),
];
