import { rule, type Rule } from "./types";

/** Scheme, Racket, and other parenthesized relatives. */
export const rules: Rule[] = [
  rule("comment", /;[^\n]*|#\|[\s\S]*?\|#/),
  rule("string", /"(?:[^"\\]|\\.)*"/),
  rule("literal", /#[tf]\b|#true\b|#false\b|\bnil\b/),
  rule(
    "keyword",
    /\b(?:define|define-syntax|define-record-type|define-values|lambda|let|let\*|letrec|letrec\*|if|cond|case|when|unless|do|begin|set!|quote|quasiquote|unquote|unquote-splicing|syntax-rules|require|provide|module|import|export|else|and|or|not|delay|force|call\/cc|call-with-current-continuation)\b/,
  ),
  rule("property", /'[\w!?*+<>=./-]+|#:[\w-]+/),
  rule("number", /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|#x[\da-f]+\b|#b[01]+\b/i),
  rule("function", /(?<=\()[\w!?*+<>=./-]+/),
  rule("plain", /[\w!?*+<>=./-]+|\s+/),
  rule("punctuation", /[()[\]'`,#]+/),
];
