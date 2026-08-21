import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /(?:@?rem\b|::)[^\n]*/i),
  rule("string", /"[^"\n]*"/),
  rule("property", /%%?~?\w+%?|![^!\n]+!/),
  rule(
    "keyword",
    /\b(?:echo|set|if|else|exist|not|defined|goto|call|exit|for|in|do|shift|pause|setlocal|endlocal|enabledelayedexpansion|errorlevel|start|choice|type|copy|move|del|mkdir|rmdir|cd|pushd|popd|cls|title|off|on)\b/i,
  ),
  rule("function", /(?<=^|\n):[a-zA-Z]\w*/),
  rule("attribute", /(?<=\s)\/[a-zA-Z?]+/),
  rule("number", /\b\d+\b/),
  rule("plain", /[a-zA-Z_][\w.\\-]*|\s+/),
  rule("punctuation", /[()=,&|<>^@]+/),
];
