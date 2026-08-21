import { rule, type Rule } from "./types";

/** GLSL, close enough for HLSL too. */
export const rules: Rule[] = [
  rule("comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//),
  rule("attribute", /#\s*(?:version|define|ifdef|ifndef|endif|else|elif|include|pragma|extension|undef)\b[^\n]*|\[\[?[a-z_]+\]?\]|:\s*(?:SV_\w+|register\([^)\n]*\))/),
  rule(
    "keyword",
    /\b(?:if|else|for|while|do|return|break|continue|discard|struct|uniform|varying|attribute|in|out|inout|layout|const|flat|smooth|noperspective|precision|highp|mediump|lowp|cbuffer|technique|pass|compile)\b/,
  ),
  rule("literal", /\b(?:true|false)\b/),
  rule("number", /\b0x[\da-f]+u?\b|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?[fFuUlh]*\b/i),
  rule(
    "type",
    /\b(?:void|float|double|half|fixed|int|uint|bool|[biud]?vec[234]|mat[234](?:x[234])?|float[234](?:x[234])?|half[234]|sampler[123]D|samplerCube|sampler2DShadow|texture[123]D|Texture[123]D|SamplerState|[A-Z]\w*)\b/,
  ),
  rule("function", /[a-zA-Z_]\w*(?=\s*\()/),
  rule("plain", /[a-zA-Z_]\w*|\s+/),
  rule("punctuation", /[{}[\]()<>;,.:=+\-*/%!&|?^~]+/),
];
