import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /![^\n]*/),
  rule("string", /"(?:[^"\n]|"")*"|'(?:[^'\n]|'')*'/),
  rule("literal", /\.(?:true|false)\.|\b(?:\.and\.|\.or\.|\.not\.|\.eqv\.)\b/i),
  rule(
    "keyword",
    /\b(?:program|end|module|submodule|subroutine|function|contains|use|implicit|none|if|then|else|elseif|endif|do|enddo|while|call|return|print|write|read|format|stop|parameter|intent|in|out|inout|pure|elemental|recursive|interface|type|public|private|save|data|common|goto|continue|select|case|default|where|forall|allocate|deallocate|allocatable|dimension|pointer|target|result|only|procedure|class|abstract|extends)\b/i,
  ),
  rule("type", /\b(?:integer|real|complex|character|logical|double\s+precision)\b/i),
  rule("number", /\b\d+(?:\.\d+)?(?:[ed][+-]?\d+)?(?:_\w+)?\b/i),
  rule("function", /[a-zA-Z]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z]\w*|\s+/),
  rule("punctuation", /[(),:=+\-*/%<>&.]+/),
];
