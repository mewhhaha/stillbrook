import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /;[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule("property", /[%@][-\w$.]+/),
  rule(
    "keyword",
    /\b(?:define|declare|ret|br|switch|invoke|resume|unreachable|call|tail|musttail|icmp|fcmp|add|fadd|sub|fsub|mul|fmul|udiv|sdiv|fdiv|urem|srem|frem|shl|lshr|ashr|and|or|xor|load|store|alloca|fence|getelementptr|phi|select|trunc|zext|sext|fptrunc|fpext|fptoui|fptosi|uitofp|sitofp|ptrtoint|inttoptr|bitcast|addrspacecast|to|label|global|constant|private|internal|external|linkonce|weak|common|appending|extern_weak|linkonce_odr|weak_odr|unnamed_addr|nounwind|readonly|readnone|willreturn|align|byval|sret|noalias|nocapture|nest|nsw|nuw|exact|volatile|inbounds|eq|ne|ugt|uge|ult|ule|sgt|sge|slt|sle|oeq|ogt|oge|olt|ole|one|ord|uno|target|datalayout|triple|source_filename|attributes|type)\b/,
  ),
  rule("literal", /\b(?:true|false|null|undef|poison|zeroinitializer|none)\b/),
  rule("type", /\bi\d+\b|\b(?:void|half|bfloat|float|double|fp128|ptr|x86_amx|x86_mmx|metadata|token|opaque)\b/),
  rule("number", /\b0x[\da-fA-F]+\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/),
  rule("function", /[a-zA-Z_][\w.]*(?=\s*\()/),
  rule("plain", /[a-zA-Z_$][\w$.]*|\s+/),
  rule("punctuation", /[{}[\]()<>;,=*!]+/),
];
