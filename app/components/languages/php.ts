import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/),
  rule("property", /\$\w+/),
  rule("attribute", /<\?php|\?>|#\[[^\]\n]*\]/),
  rule(
    "keyword",
    /\b(?:abstract|as|break|case|catch|class|clone|const|continue|declare|default|do|echo|else|elseif|enum|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|match|namespace|new|print|private|protected|public|readonly|require|require_once|return|static|switch|throw|trait|try|use|var|while|yield|array|list|isset|unset|empty)\b/i,
  ),
  rule("literal", /\b(?:true|false|null|this|self|parent)\b/i),
  rule("number", /\b0[xb][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@]+/),
];
