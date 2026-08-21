import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\]|\\.)*"/),
  rule("property", /\$\{[^}\n]*\}|\$ENV\{[^}\n]*\}/),
  rule(
    "keyword",
    /\b(?:if|elseif|else|endif|foreach|endforeach|while|endwhile|function|endfunction|macro|endmacro|return|break|continue|include|NOT|AND|OR|STREQUAL|EQUAL|LESS|GREATER|MATCHES|EXISTS|DEFINED|TRUE|FALSE|ON|OFF|PUBLIC|PRIVATE|INTERFACE|REQUIRED|QUIET|STATUS|FATAL_ERROR|WARNING)\b/,
  ),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("number", /\b\d+(?:\.\d+)*\b/),
  rule("plain", /[a-zA-Z_][\w.-]*|\s+/),
  rule("punctuation", /[(){}<>=;]+/),
];
