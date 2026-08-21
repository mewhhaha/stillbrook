import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#\[[\s\S]*?\]#|#[^\n]*/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)'/),
  rule("attribute", /\{\.[^.}\n]*\.?\}/),
  rule(
    "keyword",
    /\b(?:proc|func|method|iterator|converter|macro|template|if|elif|else|case|of|when|while|for|in|notin|return|yield|break|continue|var|let|const|type|object|enum|tuple|ref|ptr|distinct|concept|import|include|from|export|block|defer|try|except|finally|raise|discard|echo|asm|static|and|or|not|xor|shl|shr|div|mod|is|isnot|as|do|end|interface|mixin|bind|out)\b/,
  ),
  rule("literal", /\b(?:true|false|nil)\b/),
  rule("number", /\b0[xbo][\da-f_]+(?:'?[iuf]\d+)?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?(?:'?[iuf]\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b|\b(?:int|uint|float|bool|char|string|seq|array|set|openArray)(?:8|16|32|64)?\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
