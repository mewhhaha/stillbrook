import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("attribute", /@(?:interface|implementation|end|property|synthesize|dynamic|protocol|selector|autoreleasepool|try|catch|finally|throw|class|public|private|protected|encode|synchronized|available)\b|#\s*(?:import|include|define|ifdef|ifndef|endif|pragma|if|else|elif|undef)\b[^\n]*/),
  rule("string", /@?"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/),
  rule(
    "keyword",
    /\b(?:break|case|const|continue|default|do|else|enum|extern|for|goto|if|inline|instancetype|return|sizeof|static|struct|switch|typedef|union|while|void|char|short|int|long|float|double|signed|unsigned|id|self|super|strong|weak|copy|assign|nonatomic|atomic|readonly|readwrite)\b/,
  ),
  rule("literal", /\b(?:YES|NO|nil|Nil|NULL|true|false)\b/),
  rule("number", /\b0[xb][\da-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?[ful]*\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*[(:])/),
  rule("type", /\b(?:NS|UI|CG|CA|CF)[A-Z]\w*\b|\b[A-Z]\w*\b|\bBOOL\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~*]+/),
];
