import type { Rule } from "./languages/types";

export type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "literal"
  | "number"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "attribute"
  | "punctuation"
  | "inserted"
  | "deleted";

export type Token = { type: TokenType; value: string };

export type Language =
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "rust"
  | "json"
  | "css"
  | "html"
  | "xml"
  | "sh"
  | "haskell"
  | "purescript"
  | "grain"
  | "zig"
  | "wat"
  | "wgsl"
  | "glsl"
  | "hlsl"
  | "python"
  | "go"
  | "c"
  | "cpp"
  | "objc"
  | "java"
  | "kotlin"
  | "scala"
  | "csharp"
  | "fsharp"
  | "swift"
  | "dart"
  | "ruby"
  | "php"
  | "perl"
  | "r"
  | "julia"
  | "nim"
  | "crystal"
  | "d"
  | "odin"
  | "fortran"
  | "ada"
  | "pascal"
  | "ocaml"
  | "elixir"
  | "erlang"
  | "gleam"
  | "elm"
  | "rescript"
  | "clojure"
  | "lisp"
  | "scheme"
  | "racket"
  | "lean"
  | "prolog"
  | "bend"
  | "lua"
  | "sql"
  | "yaml"
  | "toml"
  | "ini"
  | "dockerfile"
  | "makefile"
  | "cmake"
  | "graphql"
  | "proto"
  | "hcl"
  | "markdown"
  | "latex"
  | "powershell"
  | "bat"
  | "asm"
  | "llvm"
  | "diff"
  | "text";

/**
 * Each grammar lives in its own module and is imported on demand, so a
 * language's rules only load (as their own server chunk) the first time an
 * article actually uses that language.
 */
const loaders: Partial<Record<Language, () => Promise<{ rules: Rule[] }>>> = {
  ts: () => import("./languages/script"),
  tsx: () => import("./languages/script"),
  js: () => import("./languages/script"),
  jsx: () => import("./languages/script"),
  rust: () => import("./languages/rust"),
  json: () => import("./languages/json"),
  css: () => import("./languages/css"),
  html: () => import("./languages/html"),
  xml: () => import("./languages/html"),
  sh: () => import("./languages/sh"),
  haskell: () => import("./languages/haskell"),
  purescript: () => import("./languages/haskell"),
  grain: () => import("./languages/grain"),
  zig: () => import("./languages/zig"),
  wat: () => import("./languages/wat"),
  wgsl: () => import("./languages/wgsl"),
  glsl: () => import("./languages/glsl"),
  hlsl: () => import("./languages/glsl"),
  python: () => import("./languages/python"),
  go: () => import("./languages/go"),
  c: () => import("./languages/c"),
  cpp: () => import("./languages/c"),
  objc: () => import("./languages/objc"),
  java: () => import("./languages/java"),
  kotlin: () => import("./languages/kotlin"),
  scala: () => import("./languages/scala"),
  csharp: () => import("./languages/csharp"),
  fsharp: () => import("./languages/fsharp"),
  swift: () => import("./languages/swift"),
  dart: () => import("./languages/dart"),
  ruby: () => import("./languages/ruby"),
  php: () => import("./languages/php"),
  perl: () => import("./languages/perl"),
  r: () => import("./languages/r"),
  julia: () => import("./languages/julia"),
  nim: () => import("./languages/nim"),
  crystal: () => import("./languages/crystal"),
  d: () => import("./languages/d"),
  odin: () => import("./languages/odin"),
  fortran: () => import("./languages/fortran"),
  ada: () => import("./languages/ada"),
  pascal: () => import("./languages/pascal"),
  ocaml: () => import("./languages/ocaml"),
  elixir: () => import("./languages/elixir"),
  erlang: () => import("./languages/erlang"),
  gleam: () => import("./languages/gleam"),
  elm: () => import("./languages/elm"),
  rescript: () => import("./languages/rescript"),
  clojure: () => import("./languages/clojure"),
  lisp: () => import("./languages/lisp"),
  scheme: () => import("./languages/lisp"),
  racket: () => import("./languages/lisp"),
  lean: () => import("./languages/lean"),
  prolog: () => import("./languages/prolog"),
  bend: () => import("./languages/bend"),
  lua: () => import("./languages/lua"),
  sql: () => import("./languages/sql"),
  yaml: () => import("./languages/yaml"),
  toml: () => import("./languages/toml"),
  ini: () => import("./languages/ini"),
  dockerfile: () => import("./languages/dockerfile"),
  makefile: () => import("./languages/makefile"),
  cmake: () => import("./languages/cmake"),
  graphql: () => import("./languages/graphql"),
  proto: () => import("./languages/proto"),
  hcl: () => import("./languages/hcl"),
  markdown: () => import("./languages/markdown"),
  latex: () => import("./languages/latex"),
  powershell: () => import("./languages/powershell"),
  bat: () => import("./languages/bat"),
  asm: () => import("./languages/asm"),
  llvm: () => import("./languages/llvm"),
};

const cache = new Map<Language, Rule[]>();

async function loadRules(lang: Language): Promise<Rule[] | undefined> {
  const cached = cache.get(lang);
  if (cached) return cached;
  const loader = loaders[lang];
  if (!loader) return undefined;
  const { rules } = await loader();
  cache.set(lang, rules);
  return rules;
}

function scan(code: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  const push = (type: TokenType, value: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type) last.value += value;
    else tokens.push({ type, value });
  };
  let pos = 0;
  while (pos < code.length) {
    let matched = false;
    for (const { type, pattern } of rules) {
      pattern.lastIndex = pos;
      const match = pattern.exec(code);
      if (match && match[0].length > 0) {
        push(type, match[0]);
        pos += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      push("plain", code[pos]);
      pos += 1;
    }
  }
  return tokens;
}

function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    const parts = token.value.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, value: part });
    });
  }
  return lines;
}

/** Tokenize source code into per-line token arrays, rendered to spans on the server. */
export async function tokenizeLines(code: string, lang: Language): Promise<Token[][]> {
  if (lang === "diff") {
    return code.split("\n").map((line) => {
      if (line.startsWith("+")) return [{ type: "inserted" as const, value: line }];
      if (line.startsWith("-")) return [{ type: "deleted" as const, value: line }];
      if (line.startsWith("@@")) return [{ type: "comment" as const, value: line }];
      return line ? [{ type: "plain" as const, value: line }] : [];
    });
  }
  const rules = await loadRules(lang);
  if (!rules) return code.split("\n").map((line) => (line ? [{ type: "plain" as const, value: line }] : []));
  return toLines(scan(code, rules));
}
