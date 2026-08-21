import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*|^=begin[\s\S]*?^=end/m),
  rule("string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|%[wiq]?\([^)\n]*\)/),
  rule("property", /:[\w?!]+|@@?\w+|\$\w+/),
  rule(
    "keyword",
    /\b(?:alias|and|begin|break|case|class|def|defined\?|do|else|elsif|end|ensure|for|if|in|module|next|not|or|raise|redo|require|require_relative|rescue|retry|return|super|then|undef|unless|until|when|while|yield|attr_accessor|attr_reader|attr_writer|include|extend|private|protected|public|lambda|proc|new)\b/,
  ),
  rule("literal", /\b(?:true|false|nil|self)\b/),
  rule("number", /\b0[xb][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*[?!]?(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_]\w*[?!]?|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
