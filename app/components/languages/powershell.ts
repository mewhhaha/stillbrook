import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /<#[\s\S]*?#>|#[^\n]*/),
  rule("string", /@"[\s\S]*?"@|"(?:[^"`\n]|`.)*"|'(?:[^'\n]|'')*'/),
  rule("property", /\$(?:\w+|\{[^}\n]*\})/),
  rule(
    "keyword",
    /\b(?:function|param|begin|process|end|filter|if|else|elseif|switch|foreach|for|while|do|until|return|break|continue|try|catch|finally|throw|trap|class|enum|using|in|-eq|-ne|-gt|-ge|-lt|-le|-like|-notlike|-match|-notmatch|-contains|-notcontains|-and|-or|-not|-replace|-join|-split)\b/i,
  ),
  rule("literal", /\$(?:true|false|null)\b/i),
  rule("function", /\b[A-Z]\w+-[A-Z]\w+\b/),
  rule("attribute", /(?<=\s)-[A-Za-z]\w*/),
  rule("number", /\b0x[\da-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:kb|mb|gb|tb|pb)?\b/i),
  rule("type", /\[[A-Za-z][\w.[\]]*\]/),
  rule("plain", /[a-zA-Z_][\w-]*|\s+/),
  rule("punctuation", /[{}()<>;,.:=+\-*/%!&|@]+/),
];
