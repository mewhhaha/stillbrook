import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\(\*[\s\S]*?\*\)/),
  rule("string", /"""[\s\S]*?"""|"(?:[^"\\]|\\.)*"/),
  rule("attribute", /\[<[^\]\n]*>\]/),
  rule(
    "keyword",
    /\b(?:abstract|and|as|async|begin|class|default|delegate|do|done|downcast|downto|elif|else|end|exception|extern|finally|for|fun|function|if|in|inherit|inline|interface|internal|lazy|let|match|member|module|mutable|namespace|new|of|open|or|override|private|public|rec|return|static|struct|then|to|try|type|upcast|use|val|when|while|with|yield)\b|\b(?:let!|do!|use!|return!|yield!)/,
  ),
  rule("literal", /\b(?:true|false|null)\b|\(\)/),
  rule("number", /\b0x[\da-f_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fFmMuUyLln]*\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b[A-Z]\w*\b|'[a-z]\w*/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
