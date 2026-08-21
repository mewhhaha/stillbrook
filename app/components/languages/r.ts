import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule(
    "keyword",
    /\b(?:function|if|else|for|while|repeat|break|next|return|library|require|in|switch|tryCatch|stop|warning|message|source)\b/,
  ),
  rule("literal", /\b(?:TRUE|FALSE|NULL|NA|NA_integer_|NA_real_|NA_character_|Inf|NaN|T|F)\b/),
  rule("number", /\b0x[\da-f]+L?\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?L?i?\b/i),
  rule("function", /[a-zA-Z._][\w.]*(?=\s*\()/),
  rule("property", /[a-zA-Z._][\w.]*(?=\s*=[^=])/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z._][\w.]*|\s+/),
  rule("punctuation", /<-|->|%[\w.]+%|[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
