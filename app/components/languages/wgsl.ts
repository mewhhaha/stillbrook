import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("attribute", /@[a-z_]+/),
  rule(
    "keyword",
    /\b(?:fn|let|var|const|override|struct|alias|return|if|else|loop|for|while|break|continue|continuing|switch|case|default|discard|enable|requires|diagnostic|virtual|private|storage|uniform|workgroup|function|read|write|read_write)\b/,
  ),
  rule("literal", /\b(?:true|false)\b/),
  rule("number", /\b0[xX][\da-fA-F]+[iu]?\b|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?[fhiu]?\b/),
  rule(
    "type",
    /\b(?:bool|f16|f32|i32|u32|vec[234][fhiu]?|mat[234]x[234][fh]?|array|atomic|ptr|sampler(?:_comparison)?|texture_[a-z_\d]+)\b|\b[A-Z]\w*\b/,
  ),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@]+/),
];
