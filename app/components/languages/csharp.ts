import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /\$?@?"(?:[^"\\\n]|\\.|"")*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /\[[A-Z][^\]\n]*\]/),
  rule(
    "keyword",
    /\b(?:abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|finally|fixed|float|for|foreach|get|goto|if|implicit|in|init|int|interface|internal|is|lock|long|namespace|new|object|operator|out|override|params|private|protected|public|readonly|record|ref|return|sbyte|sealed|set|short|sizeof|stackalloc|static|string|struct|switch|throw|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|when|where|while|yield)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this)\b/),
  rule("number", /\b0[xb][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fdmul]*\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
