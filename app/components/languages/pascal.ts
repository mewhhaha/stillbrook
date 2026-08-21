import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\{[^}]*\}|\(\*[\s\S]*?\*\)|\/\/[^\n]*/),
  rule("string", /'(?:[^'\n]|'')*'/),
  rule(
    "keyword",
    /\b(?:program|unit|interface|implementation|uses|type|var|const|begin|end|procedure|function|if|then|else|case|of|for|to|downto|do|while|repeat|until|record|array|set|file|packed|pointer|nil|new|dispose|with|goto|label|and|or|not|xor|div|mod|shl|shr|in|is|as|class|object|constructor|destructor|inherited|private|public|protected|published|property|virtual|override|overload|abstract|out|try|except|finally|raise|initialization|finalization)\b/i,
  ),
  rule("literal", /\b(?:true|false|nil)\b/i),
  rule("number", /\$[\da-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b(?:integer|real|boolean|char|byte|word|longint|cardinal|string|ansistring|widestring|double|single|extended|[A-Z]\w*)\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[();,:=+\-*/<>.^@[\]]+/),
];
