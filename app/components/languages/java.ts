import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /@[A-Za-z]\w*/),
  rule(
    "keyword",
    /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|permits|private|protected|public|record|return|sealed|short|static|strictfp|super|switch|synchronized|throw|throws|transient|try|var|void|volatile|while|yield)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this)\b/),
  rule("number", /\b0[xb][\da-f_]+L?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fdlFDL]?\b/i),
  rule("function", /[a-zA-Z_$][\w$]*(?=\s*\()/),
  rule("type", /\b[A-Z][\w$]*\b/),
  rule("plain", /[a-zA-Z_$][\w$]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@]+/),
];
