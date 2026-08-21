import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /;;[^\n]*|\(;[\s\S]*?;\)/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule("function", /\b(?:i32|i64|f32|f64|v128|memory|local|global|ref|table|elem)\.[a-z0-9_]+\b/),
  rule(
    "keyword",
    /\b(?:module|func|param|result|local|global|export|import|memory|table|elem|data|start|type|if|then|else|block|loop|br|br_if|br_table|call|call_indirect|return|end|unreachable|nop|drop|select|mut|offset|align|item|declare)\b/,
  ),
  rule("type", /\b(?:i32|i64|f32|f64|v128|funcref|externref)\b/),
  rule("property", /\$[\w.]+/),
  rule("number", /\b0x[\da-f_.p+-]+\b|[+-]?\b\d[\d_]*(?:\.[\d_]*)?(?:e[+-]?\d+)?\b/i),
  rule("plain", /[a-zA-Z_][\w.]*|\s+/),
  rule("punctuation", /[()=]+/),
];
