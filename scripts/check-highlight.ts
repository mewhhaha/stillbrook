// Exercises every registered grammar: tokenizing must preserve the source
// text exactly (per line), terminate, and find the token kinds the sample
// was written to contain.

import { tokenizeLines, type Language, type TokenType } from "../app/components/highlight";

const samples: Array<{ lang: Language; expect: TokenType[]; code: string }> = [
  {
    lang: "ts",
    expect: ["keyword", "string", "comment", "function", "type"],
    code: `// greet\nconst greet = (name: string): Greeting => hello(\`hi \${name}\`);`,
  },
  {
    lang: "rust",
    expect: ["keyword", "string", "comment", "attribute", "type"],
    code: `// entry\n#[derive(Debug)]\nstruct Point { x: f64 }\nfn main() { println!("hi"); }`,
  },
  {
    lang: "json",
    expect: ["property", "string", "number", "literal"],
    code: `{ "name": "blog", "stars": 155, "public": true }`,
  },
  {
    lang: "css",
    expect: ["comment", "property", "number", "keyword"],
    code: `/* card */\n.card { color: #fff; padding: 2rem; }\n@media (min-width: 40rem) {}`,
  },
  {
    lang: "html",
    expect: ["comment", "tag", "attribute", "string"],
    code: `<!-- hero -->\n<img src="a.jpg" alt="a" />`,
  },
  {
    lang: "sh",
    expect: ["comment", "keyword", "property", "attribute"],
    code: `# build\nif true; then echo $HOME "done" --verbose; fi`,
  },
  {
    lang: "haskell",
    expect: ["keyword", "comment", "type", "function", "attribute", "string"],
    code: `{-# LANGUAGE TypeFamilies #-}\n-- | Doc\nmodule Main where\n\nmove :: Query m Position\nmove = queryMapWith go query\n  where\n    go (Velocity v) (Position p) = Position "x"`,
  },
  {
    lang: "grain",
    expect: ["keyword", "comment", "type", "number", "string"],
    code: `// tick\nmodule Tetris\nprovide let move = (dx: Number) => {\n  if (overVal == 0) { pieceX += dx }\n  "ok"\n}`,
  },
  {
    lang: "zig",
    expect: ["keyword", "comment", "type", "function", "string"],
    code: `// main\nconst std = @import("std");\npub fn main() !void {\n    var x: u32 = 42;\n}`,
  },
  {
    lang: "wat",
    expect: ["keyword", "comment", "type", "function", "property"],
    code: `;; add\n(module\n  (func $add (param $a i32) (result i32)\n    local.get $a\n    i32.const 1\n    i32.add))`,
  },
  {
    lang: "python",
    expect: ["keyword", "comment", "string", "attribute", "literal"],
    code: `# entry\n@dataclass\nclass Point:\n    def norm(self) -> float:\n        return abs(self.x) if True else 0.0\n"""doc"""`,
  },
  {
    lang: "go",
    expect: ["keyword", "comment", "string", "type", "literal"],
    code: `// main\npackage main\nfunc main() {\n\tvar s string = "hi"\n\tif s != "" { return }\n\t_ = nil\n}`,
  },
  {
    lang: "c",
    expect: ["keyword", "comment", "string", "attribute", "type"],
    code: `// main\n#include <stdio.h>\nint main(void) {\n    size_t n = 0;\n    printf("hi\\n");\n    return 0;\n}`,
  },
  {
    lang: "cpp",
    expect: ["keyword", "string", "type"],
    code: `template <typename T>\nclass Vec { public: T *data; };\nauto v = new Vec<int>(); const char *s = "hi";`,
  },
  {
    lang: "ocaml",
    expect: ["keyword", "comment", "string", "type", "literal"],
    code: `(* sum *)\nlet rec sum = function\n  | [] -> 0\n  | x :: rest -> x + sum rest\nlet names = List.map string_of_int [1; 2]\nlet greeting = "hello " ^ "ocaml"\nlet ok = Some true`,
  },
  {
    lang: "elixir",
    expect: ["keyword", "comment", "string", "property", "attribute"],
    code: `# server\ndefmodule Server do\n  @timeout 5_000\n  def call(pid, msg), do: send(pid, {:call, msg})\n  defp name, do: "srv"\nend`,
  },
  {
    lang: "gleam",
    expect: ["keyword", "comment", "string", "type"],
    code: `// wibble\npub fn main() {\n  let name: String = "gleam"\n  case name { _ -> Nil }\n}`,
  },
  {
    lang: "lua",
    expect: ["keyword", "comment", "string", "literal"],
    code: `-- greet\nlocal function greet(name)\n  if name ~= nil then print("hi " .. name) end\nend`,
  },
  {
    lang: "sql",
    expect: ["keyword", "comment", "string", "type", "number"],
    code: `-- top posts\nSELECT title, count(*)::int AS n\nFROM posts WHERE status = 'live' AND views > 100\nGROUP BY title ORDER BY n DESC LIMIT 10;`,
  },
  {
    lang: "yaml",
    expect: ["comment", "property", "string", "literal", "number"],
    code: `# deploy\nname: blog\nreplicas: 3\nenabled: true\nimage: "app:latest"\nanchor: &base {}`,
  },
  {
    lang: "toml",
    expect: ["comment", "tag", "property", "string", "literal"],
    code: `# package\n[package]\nname = "blog"\npublish = false\n\n[dependencies]\nserde = { version = "1" }`,
  },
  {
    lang: "diff",
    expect: ["inserted", "deleted"],
    code: `-const a = 1;\n+const a = 2;\n context`,
  },
];

const moreSamples: Array<{ lang: Language; expect: TokenType[]; code: string }> = [
  {
    lang: "java",
    expect: ["keyword", "comment", "string", "attribute", "type"],
    code: `// service\n@Override\npublic final class Greeter {\n  String greet() { return "hi"; }\n}`,
  },
  {
    lang: "kotlin",
    expect: ["keyword", "comment", "string", "literal", "type"],
    code: `// main\nfun main() {\n  val name: String? = null\n  println("hi $name")\n}`,
  },
  {
    lang: "scala",
    expect: ["keyword", "string", "type", "literal"],
    code: `case class User(name: String)\nval u = User("ada")\nif (u != null) println(u)`,
  },
  {
    lang: "csharp",
    expect: ["keyword", "comment", "string", "attribute", "type"],
    code: `// handler\n[HttpGet]\npublic async Task<string> Get() => await Fetch("x");`,
  },
  {
    lang: "fsharp",
    expect: ["keyword", "comment", "string", "type"],
    code: `(* pipeline *)\nlet greet (name: string) =\n    match Some name with\n    | Some n -> sprintf "hi %s" n\n    | None -> "hi"`,
  },
  {
    lang: "swift",
    expect: ["keyword", "comment", "string", "literal", "attribute"],
    code: `// view\n@MainActor\nfunc greet(name: String?) -> String {\n  guard let n = name else { return "hi" }\n  return n\n}\nlet x = nil`,
  },
  {
    lang: "objc",
    expect: ["keyword", "attribute", "string", "literal", "type"],
    code: `#import <Foundation/Foundation.h>\n@interface Greeter : NSObject\n@end\nstatic BOOL ready = YES;\nNSString *s = @"hi";`,
  },
  {
    lang: "dart",
    expect: ["keyword", "comment", "string", "literal", "type"],
    code: `// widget\nclass Greeter {\n  final String name;\n  Greeter(this.name);\n}\nvar g = null; print("hi");`,
  },
  {
    lang: "ruby",
    expect: ["keyword", "comment", "string", "property", "literal"],
    code: `# greeter\nclass Greeter\n  def initialize(name)\n    @name = name || :anon\n  end\nend\nputs "hi" if true`,
  },
  {
    lang: "php",
    expect: ["keyword", "comment", "string", "property", "literal"],
    code: `<?php\n// greet\nfunction greet($name) {\n  return $name ?? null ? "hi $name" : "hi";\n}`,
  },
  {
    lang: "perl",
    expect: ["keyword", "comment", "string", "property"],
    code: `# greet\nmy $name = shift // "world";\nsub greet { my @args = @_; print "hi $name\\n"; }`,
  },
  {
    lang: "r",
    expect: ["keyword", "comment", "string", "literal", "function"],
    code: `# fit\nlibrary(stats)\nmsg <- "fitting"\nfit <- function(x) {\n  if (is.null(x)) return(NA)\n  mean(x, na.rm = TRUE)\n}`,
  },
  {
    lang: "julia",
    expect: ["keyword", "comment", "string", "attribute", "literal"],
    code: `# solver\n@inbounds function solve(xs)\n    isempty(xs) && return nothing\n    sum(xs) / length(xs)\nend\nprintln("done")`,
  },
  {
    lang: "nim",
    expect: ["keyword", "comment", "string", "attribute", "literal"],
    code: `# greeter\nproc greet(name: string): string {.inline.} =\n  if name.len == 0: return "hi"\n  echo true\n  "hi " & name`,
  },
  {
    lang: "crystal",
    expect: ["keyword", "comment", "string", "property", "literal"],
    code: `# greeter\nclass Greeter\n  property name : String\n  def greet\n    @name.empty? ? :anon : "hi"\n  end\nend\nputs nil`,
  },
  {
    lang: "d",
    expect: ["keyword", "comment", "string", "attribute", "type"],
    code: `// range\n@safe pure string greet(string name) {\n  import std.format : format;\n  return format("hi %s", name);\n}`,
  },
  {
    lang: "odin",
    expect: ["keyword", "comment", "string", "literal", "type"],
    code: `// entry\npackage main\nmain :: proc() {\n  name: string = "odin"\n  if name != "" do fmt.println(true)\n}`,
  },
  {
    lang: "fortran",
    expect: ["keyword", "comment", "string", "type", "number"],
    code: `! sum\nprogram main\n  implicit none\n  integer :: i\n  real :: total = 0.0\n  do i = 1, 10\n    total = total + 1.5\n  end do\n  print *, 'total'\nend program main`,
  },
  {
    lang: "ada",
    expect: ["keyword", "comment", "string", "type"],
    code: `-- greeter\nprocedure Greet is\n   Name : constant String := "Ada";\nbegin\n   Put_Line ("hi " & Name);\nend Greet;`,
  },
  {
    lang: "pascal",
    expect: ["keyword", "comment", "string", "type", "number"],
    code: `{ classic }\nprogram Hello;\nvar i: integer;\nbegin\n  for i := 1 to 3 do\n    writeln('hi');\nend.`,
  },
  {
    lang: "wgsl",
    expect: ["keyword", "comment", "attribute", "type", "number"],
    code: `// plasma\n@fragment\nfn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {\n  let uv = pos.xy / vec2f(640.0, 360.0);\n  return vec4f(uv, 0.5, 1.0);\n}`,
  },
  {
    lang: "glsl",
    expect: ["keyword", "comment", "attribute", "type", "number"],
    code: `// frag\n#version 300 es\nprecision highp float;\nuniform vec2 res;\nout vec4 color;\nvoid main() { color = vec4(1.0, 0.5, 0.0, 1.0); }`,
  },
  {
    lang: "hlsl",
    expect: ["keyword", "type", "number", "function"],
    code: `float4 main(float2 uv : TEXCOORD) : SV_Target {\n  if (uv.x > 0.5) discard;\n  return float4(uv, 0.0, 1.0);\n}`,
  },
  {
    lang: "asm",
    expect: ["keyword", "comment", "property", "number", "function"],
    code: `; add two\nmain:\n    mov %rax, $1\n    add %rbx, 0x10\n    jmp done\ndone:\n    ret`,
  },
  {
    lang: "llvm",
    expect: ["keyword", "comment", "property", "type", "number"],
    code: `; square\ndefine i32 @square(i32 %x) {\nentry:\n  %r = mul nsw i32 %x, %x\n  %s = add i32 %r, 42\n  ret i32 %s\n}`,
  },
  {
    lang: "xml",
    expect: ["comment", "tag", "attribute", "string"],
    code: `<!-- config -->\n<server port="8080">\n  <name>blog</name>\n</server>`,
  },
  {
    lang: "ini",
    expect: ["comment", "tag", "property", "literal", "number"],
    code: `; app config\n[server]\nport = 8080\ndebug = true\nname = "blog"`,
  },
  {
    lang: "dockerfile",
    expect: ["keyword", "comment", "string", "property"],
    code: `# build\nFROM node:22 AS build\nENV PORT=$PORT\nRUN npm ci\nCMD ["node", "server.js"]`,
  },
  {
    lang: "makefile",
    expect: ["comment", "property", "keyword", "function"],
    code: `# build\n.PHONY: all\nCC = gcc\nall: main.o\n\tifdef DEBUG\n\t$(CC) -o app $(OBJS)\n\tendif`,
  },
  {
    lang: "cmake",
    expect: ["comment", "keyword", "property", "function", "string"],
    code: `# project\ncmake_minimum_required(VERSION 3.20)\nproject(blog)\nif(NOT DEFINED ENV{CI})\n  target_link_libraries(app PRIVATE \${DEPS} "m")\nendif()`,
  },
  {
    lang: "graphql",
    expect: ["comment", "keyword", "property", "type", "attribute"],
    code: `# lookup\nquery User($id: ID!) @cached {\n  user(id: $id) {\n    name\n    posts { title }\n  }\n}`,
  },
  {
    lang: "proto",
    expect: ["comment", "keyword", "type", "number", "string"],
    code: `// api\nsyntax = "proto3";\nmessage User {\n  string name = 1;\n  repeated int32 scores = 2;\n}`,
  },
  {
    lang: "hcl",
    expect: ["comment", "keyword", "string", "property", "literal"],
    code: `# bucket\nresource "aws_s3_bucket" "logs" {\n  bucket        = "my-logs"\n  force_destroy = true\n  count         = 2\n}`,
  },
  {
    lang: "markdown",
    expect: ["tag", "string", "keyword", "property", "comment"],
    code: `# Title\n\n> a quote\n\nSome **bold** text with \`code\` and a [link](https://example.com).`,
  },
  {
    lang: "latex",
    expect: ["comment", "keyword", "string", "attribute"],
    code: `% paper\n\\documentclass[12pt]{article}\n\\begin{document}\nEnergy: $E = mc^2$\n\\end{document}`,
  },
  {
    lang: "powershell",
    expect: ["comment", "keyword", "property", "function", "string"],
    code: `# deploy\nfunction Deploy-App {\n  param($Name)\n  if ($Name -eq "prod") { Write-Host "careful" }\n}`,
  },
  {
    lang: "bat",
    expect: ["comment", "keyword", "property", "function"],
    code: `@echo off\nrem build script\nset NAME=blog\nif exist "%NAME%" goto done\n:done\necho %NAME%`,
  },
  {
    lang: "erlang",
    expect: ["comment", "attribute", "keyword", "literal", "type"],
    code: `% server\n-module(server).\n-export([loop/1]).\nloop(State) ->\n  receive\n    {call, From} -> From ! ok, loop(State)\n  after 5000 -> true\n  end.`,
  },
  {
    lang: "clojure",
    expect: ["comment", "keyword", "property", "string", "function"],
    code: `; greeter\n(ns app.core)\n(defn greet [name]\n  (if (nil? name)\n    {:msg "hi"}\n    (str "hi " name)))`,
  },
  {
    lang: "lisp",
    expect: ["comment", "keyword", "literal", "string", "function"],
    code: `; classic\n(define (fact n)\n  (if (<= n 1)\n      1\n      (* n (fact (- n 1)))))\n(display "done") #t`,
  },
  {
    lang: "scheme",
    expect: ["comment", "keyword", "function"],
    code: `; fold\n(define (sum xs) (fold + 0 xs))\n(sum (list 1 2 3))`,
  },
  {
    lang: "racket",
    expect: ["comment", "keyword", "string", "function"],
    code: `; module\n(module hello racket\n  (provide greet)\n  (define (greet) "hi"))`,
  },
  {
    lang: "elm",
    expect: ["comment", "keyword", "string", "type", "function"],
    code: `-- greeter\nmodule Main exposing (greet)\n\ngreet : Maybe String -> String\ngreet name =\n    case name of\n        Just n -> "hi " ++ n\n        Nothing -> "hi"`,
  },
  {
    lang: "purescript",
    expect: ["comment", "keyword", "string", "type"],
    code: `-- greeter\nmodule Main where\n\ngreet :: Maybe String -> String\ngreet name = case name of\n  Just n -> "hi " <> n\n  Nothing -> "hi"`,
  },
  {
    lang: "rescript",
    expect: ["comment", "keyword", "string", "type", "attribute"],
    code: `// greeter\n@react.component\nlet make = (~name: option<string>) => {\n  switch name {\n  | Some(n) => "hi " ++ n\n  | None => "hi"\n  }\n}`,
  },
  {
    lang: "lean",
    expect: ["comment", "keyword", "type", "attribute"],
    code: `-- arithmetic\n#check Nat\ntheorem add_zero (n : Nat) : n + 0 = n := by\n  simp`,
  },
  {
    lang: "prolog",
    expect: ["comment", "attribute", "keyword", "type", "function"],
    code: `% family\n:- use_module(library(lists)).\nancestor(X, Y) :- parent(X, Y).\nancestor(X, Y) :- parent(X, Z), ancestor(Z, Y), X \\= Y, true.`,
  },
  {
    lang: "bend",
    expect: ["comment", "keyword", "number", "function"],
    code: `# tree sum\ndef sum_tree(tree):\n  fold tree:\n    case Tree/node:\n      return tree.left + tree.right\n    case Tree/leaf:\n      return tree.value + 1`,
  },
];

for (const sample of moreSamples) samples.push(sample);

let failures = 0;

for (const { lang, expect, code } of samples) {
  const lines = await tokenizeLines(code, lang);
  const rejoined = lines.map((tokens) => tokens.map((t) => t.value).join("")).join("\n");
  if (rejoined !== code) {
    failures += 1;
    console.error(`✗ ${lang}: tokenization altered the source text`);
    continue;
  }
  const seen = new Set(lines.flat().map((t) => t.type));
  const missing = expect.filter((type) => !seen.has(type));
  if (missing.length > 0) {
    failures += 1;
    console.error(`✗ ${lang}: expected token kinds not found: ${missing.join(", ")} (saw: ${[...seen].join(", ")})`);
    continue;
  }
  console.log(`✓ ${lang}`);
}

if (failures > 0) {
  console.error(`${failures} grammar check(s) failed.`);
  process.exit(1);
}
console.log(`All ${samples.length} grammar checks passed.`);
