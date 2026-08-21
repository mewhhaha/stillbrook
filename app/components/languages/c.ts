import { rule, type Rule } from "./types";

/** C and C++. */
export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("attribute", /#\s*(?:include|define|ifdef|ifndef|endif|elif|else|if|pragma|undef|error|warning)\b[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule(
    "keyword",
    /\b(?:auto|break|case|char|const|constexpr|continue|default|delete|do|double|else|enum|extern|float|for|goto|if|inline|int|long|namespace|new|noexcept|operator|override|private|protected|public|register|restrict|return|short|signed|sizeof|static|struct|switch|template|typedef|typename|union|unsigned|using|virtual|void|volatile|while|class|final)\b/,
  ),
  rule("literal", /\b(?:true|false|NULL|nullptr|this)\b/),
  rule("number", /\b0[xbo][\da-f']+[ul]*\b|\b\d[\d']*(?:\.[\d']+)?(?:e[+-]?\d+)?[fdul]*\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("type", /\b(?:u?int(?:8|16|32|64)_t|size_t|ssize_t|ptrdiff_t|wchar_t|bool|[A-Z]\w*)\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
