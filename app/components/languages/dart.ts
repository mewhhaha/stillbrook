import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /@[A-Za-z]\w*/),
  rule(
    "keyword",
    /\b(?:abstract|as|assert|async|await|base|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|final|finally|for|get|hide|if|implements|import|in|interface|is|late|library|mixin|new|on|operator|part|required|rethrow|return|sealed|set|show|static|super|switch|sync|throw|try|typedef|var|void|when|while|with|yield)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this)\b/),
  rule("number", /\b0x[\da-f]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_$]\w*(?=\s*[(<]\s*[\w)>('"])/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_$]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
