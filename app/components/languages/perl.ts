import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|qw?\([^)\n]*\)/),
  rule("property", /[$@%][\w{]\w*}?|\$[_\d!@]/),
  rule(
    "keyword",
    /\b(?:my|our|local|sub|if|elsif|else|unless|while|until|for|foreach|do|return|use|no|package|require|last|next|redo|die|warn|print|printf|say|defined|undef|exists|delete|scalar|wantarray|ref|bless|and|or|not|eq|ne|lt|gt|le|ge|cmp|x)\b/,
  ),
  rule("number", /\b0[xb][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*(?:::\w+)*\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~\\]+/),
];
