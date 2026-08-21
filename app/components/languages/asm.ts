import { rule, type Rule } from "./types";

/** Generic assembly: x86 (AT&T and Intel) and ARM flavors. */
export const rules: Rule[] = [
  rule("comment", /;[^\n]*|#[^\n]*|\/\/[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule("attribute", /\.[a-z_][\w.]*/i),
  rule("function", /^[ \t]*[.\w$]+:/m),
  rule("property", /%\w+|\$-?\w+|\b(?:[re]?[abcd]x|[abcd][lh]|[re]?(?:si|di|sp|bp|ip)|r\d+[dwb]?|[wx]\d+|[qsdv]\d+|sp|lr|pc|xmm\d+|ymm\d+)\b/),
  rule(
    "keyword",
    /\b(?:mov[a-z]*|lea|add[a-z]*|sub[a-z]*|i?mul[a-z]*|i?div[a-z]*|inc|dec|neg|not|and|orr?|xor|eor|shl|shr|sal|sar|lsl|lsr|asr|ror|cmp|test|tst|jmp|j[a-z]{1,3}|call|ret|push|pop|nop|int|syscall|leave|enter|b|bl|blx|bx|beq|bne|blt|bgt|ble|bge|ldr[bh]?|str[bh]?|ldp|stp|adr|adrp|cbz|cbnz|movz|movk|svc)\b/i,
  ),
  rule("number", /\b0[xb][\da-f]+\b|\b\d+\b|#-?\d+/i),
  rule("plain", /[a-zA-Z_$][\w$.]*|\s+/),
  rule("punctuation", /[[\](),:+\-*!@]+/),
];
