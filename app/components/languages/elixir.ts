import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule("attribute", /@\w+/),
  rule("property", /:[\w!?]+|[a-z_][\w!?]*:(?=\s)/),
  rule(
    "keyword",
    /\b(?:def|defp|defmodule|defmacro|defmacrop|defstruct|defprotocol|defimpl|defguard|do|end|fn|if|else|unless|case|cond|with|for|when|and|or|not|in|import|alias|require|use|receive|after|raise|rescue|try|catch|throw|quote|unquote|super)\b/,
  ),
  rule("literal", /\b(?:true|false|nil|self)\b/),
  rule("number", /\b0[xbo][\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-z_][\w!?]*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*(?:\.[A-Z]\w*)*\b/),
  rule("plain", /[a-zA-Z_][\w!?]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
