import { rule, type Rule } from "./types";

/** HCL / Terraform. */
export const rules: Rule[] = [
  rule("comment", /#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("string", /"(?:[^"\\\n]|\\.|\$\{[^}]*\})*"|<<-?\w+[\s\S]*?\n\s*\w+/),
  rule(
    "keyword",
    /\b(?:resource|variable|output|module|provider|terraform|locals|data|for_each|count|depends_on|lifecycle|backend|required_providers|required_version|dynamic|for|in|if|each|source|version)\b/,
  ),
  rule("literal", /\b(?:true|false|null)\b/),
  rule("number", /\b\d+(?:\.\d+)?\b/),
  rule("function", /[a-z_]\w*(?=\s*\()/),
  rule("property", /[\w-]+(?=\s*=[^=])/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[a-zA-Z_][\w-]*|\s+/),
  rule("punctuation", /[{}[\]()=,.:?*]+/),
];
