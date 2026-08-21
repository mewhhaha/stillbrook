import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /#[^\n]*/),
  rule("string", /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/),
  rule("property", /\$\{[^}\n]*\}|\$\w+/),
  rule(
    "keyword",
    /\b(?:FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL|AS)\b/,
  ),
  rule("attribute", /(?<=\s)--[\w-]+(?==|\b)/),
  rule("number", /\b\d+(?:\.\d+)?\b/),
  rule("plain", /[a-zA-Z_][\w./:@-]*|\s+/),
  rule("punctuation", /[[\]=,&|\\]+/),
];
