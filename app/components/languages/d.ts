import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\/|\/\+[\s\S]*?\+\//),
  rule("string", /r?"(?:[^"\\]|\\.)*"[cwd]?|`[^`]*`|'(?:[^'\\\n]|\\.)'/),
  rule("attribute", /@\w+/),
  rule(
    "keyword",
    /\b(?:abstract|alias|align|asm|assert|auto|body|break|case|cast|catch|class|const|continue|debug|default|delegate|delete|deprecated|do|else|enum|export|extern|final|finally|for|foreach|foreach_reverse|function|goto|if|immutable|import|in|inout|interface|invariant|is|lazy|mixin|module|new|nothrow|out|override|package|pragma|private|protected|public|pure|ref|return|scope|shared|static|struct|super|switch|synchronized|template|throw|try|typeid|typeof|union|unittest|version|while|with)\b/,
  ),
  rule("literal", /\b(?:true|false|null|this)\b/),
  rule("number", /\b0[xb][\da-f_]+(?:u?l?|l?u?)\b|\b\d[\d_]*(?:\.[\d_]+)?(?:e[+-]?\d+)?[fluFLU]*\b/i),
  rule("function", /[a-zA-Z_]\w*(?=\s*[(!])/),
  rule("type", /\b(?:void|bool|byte|ubyte|short|ushort|int|uint|long|ulong|cent|ucent|float|double|real|char|wchar|dchar|string|wstring|dstring|size_t|ptrdiff_t|[A-Z]\w*)\b/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~@$]+/),
];
