import { rule, type Rule } from "./types";

/** JavaScript and TypeScript, with or without JSX. */
export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/),
  rule(
    "keyword",
    /\b(?:abstract|as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|keyof|let|namespace|never|new|of|readonly|return|satisfies|set|static|super|switch|throw|try|type|typeof|unknown|var|void|while|yield)\b/,
  ),
  rule("literal", /\b(?:true|false|null|undefined|NaN|Infinity|this)\b/),
  rule("number", /\b0[xbo][\da-f_]+n?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?n?\b/i),
  rule("tag", /(?<=<\/?)[a-z][\w-]*/),
  rule("attribute", /[\w-]+(?==["'{])/),
  rule("function", /[a-zA-Z_$][\w$]*(?=\s*\()/),
  rule("type", /\b[A-Z][\w$]*\b/),
  rule("plain", /[a-zA-Z_$][\w$]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@#]+/),
];
