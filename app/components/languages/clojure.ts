import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /;[^\n]*/),
  rule("string", /"(?:[^"\\]|\\.)*"/),
  rule("property", /:[\w./-]+/),
  rule(
    "keyword",
    /\b(?:def|defn|defn-|defmacro|defmulti|defmethod|defprotocol|defrecord|deftype|ns|fn|let|letfn|if|if-let|if-not|when|when-let|when-not|cond|condp|case|do|loop|recur|for|doseq|dotimes|while|try|catch|finally|throw|quote|var|set!|binding|delay|lazy-seq|and|or|not|require|import|use|refer|in-ns|->|->>|as->|some->|comp|partial|apply|map|filter|reduce)\b/,
  ),
  rule("literal", /\b(?:true|false|nil)\b/),
  rule("number", /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?[MN]?\b|\b\d+\/\d+\b/i),
  rule("function", /(?<=\()[\w!?*+<>=./-]+/),
  rule("type", /\b[A-Z]\w*\b/),
  rule("plain", /[\w!?*+<>=./-]+|\s+/),
  rule("punctuation", /[{}[\]()'`~^@#%&]+/),
];
