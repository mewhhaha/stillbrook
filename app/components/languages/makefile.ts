import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("property", /\$[({][^)}\n]*[)}]|\$[@<^*?%+]/),
  rule(
    "keyword",
    /\b(?:ifeq|ifneq|ifdef|ifndef|else|endif|include|-include|define|endef|export|unexport|override|vpath)\b|\.(?:PHONY|SUFFIXES|DEFAULT|PRECIOUS|SECONDARY|DELETE_ON_ERROR|EXPORT_ALL_VARIABLES|NOTPARALLEL|ONESHELL|SILENT)\b/,
  ),
  rule("function", /(?<=^|\n)[^\s:=#][^:=\n]*(?=:(?!=))/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/),
  rule("attribute", /(?<=\s)--?[\w-]+/),
  rule("plain", /[a-zA-Z_][\w./-]*|\s+/),
  rule("punctuation", /[:=+?@|;\\]+/),
];
