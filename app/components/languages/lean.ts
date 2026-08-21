import { rule, type Rule } from "./types";

export const rules: Rule[] = [
  rule("comment", /--[^\n]*|\/-[\s\S]*?-\//),
  rule("string", /"(?:[^"\\\n]|\\.)*"/),
  rule("attribute", /#\w+|@\[[^\]\n]*\]/),
  rule(
    "keyword",
    /\b(?:theorem|lemma|def|example|structure|inductive|class|instance|where|by|exact|intro|intros|apply|simp|rw|rfl|fun|match|with|if|then|else|let|in|do|return|namespace|end|open|import|universe|variable|variables|axiom|sorry|have|show|from|calc|deriving|extends|mutual|partial|noncomputable|private|protected|section|abbrev|macro|syntax|notation)\b/,
  ),
  rule("literal", /\b(?:true|false|True|False)\b/),
  rule("number", /\b0x[\da-f]+\b|\b\d+(?:\.\d+)?\b/i),
  rule("function", /[a-zA-Z_][\w']*(?=\s*\()/),
  rule("type", /\b[A-Z][\w']*\b|\bProp\b|\bType\b|\bSort\b/),
  rule("plain", /[a-zA-Z_][\w'!?]*|\s+/),
  rule("punctuation", /[{}[\]()⟨⟩;,.:=+\-*/<>!&|λ∀∃→↔∧∨¬≤≥≠∈·]+/),
];
