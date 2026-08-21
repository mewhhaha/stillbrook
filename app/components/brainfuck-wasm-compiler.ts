/**
 * A small Brainfuck-to-WebAssembly compiler that runs in the browser. It
 * parses Brainfuck into one instruction per command, then emits
 * both a readable WAT rendering (for display) and an actual WebAssembly module
 * (for execution). The emitted module imports two host functions — `write` for
 * `.`, and `read` for `,` — keeps the tape in linear memory, and holds the data
 * pointer in a mutable global.
 *
 * EOF convention: `read` takes the current cell value and returns the next input
 * byte, or that same value when input is exhausted. So `,` at end-of-input
 * leaves the cell unchanged — the convention the classic programs (ROT13 and
 * friends) are written for.
 *
 * The executable module carries one extra piece the WAT omits: a fuel counter
 * decremented on every loop iteration that traps when it runs out, so a runaway
 * program stops instead of hanging the tab.
 */

export const TAPE_PAGES = 16; // 16 * 64KiB = 1 MiB of tape.
export const DEFAULT_FUEL = 200_000_000;

type Instr =
  | { op: "add"; value: number } // add value to the current cell (mod 256)
  | { op: "move"; value: number } // move the data pointer by value
  | { op: "clear" } // set the current cell to zero ([-] / [+])
  | { op: "write" } // .
  | { op: "read" } // ,
  | { op: "open" } // [
  | { op: "close" }; // ]

export type BrainfuckProgram = {
  instructions: readonly Instr[];
  /** Number of Brainfuck command characters after comments are dropped. */
  sourceOps: number;
};

const COMMANDS = new Set(["+", "-", "<", ">", ".", ",", "[", "]"]);

export class BrainfuckSyntaxError extends Error {}

/**
 * Parse Brainfuck source into one instruction per command — deliberately not
 * coalescing runs. Every command lowers to a fixed-length WebAssembly sequence,
 * which is what lets the GPU emitter give each lane a known output offset from a
 * prefix scan. Only bracket balance is checked here.
 */
export function parseBrainfuck(source: string): BrainfuckProgram {
  const instructions: Instr[] = [];
  let sourceOps = 0;
  let depth = 0;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (!COMMANDS.has(char)) continue;
    sourceOps += 1;

    if (char === "+") instructions.push({ op: "add", value: 1 });
    else if (char === "-") instructions.push({ op: "add", value: -1 });
    else if (char === ">") instructions.push({ op: "move", value: 1 });
    else if (char === "<") instructions.push({ op: "move", value: -1 });
    else if (char === ".") instructions.push({ op: "write" });
    else if (char === ",") instructions.push({ op: "read" });
    else if (char === "[") {
      depth += 1;
      instructions.push({ op: "open" });
    } else {
      depth -= 1;
      if (depth < 0) {
        throw new BrainfuckSyntaxError(
          "A ] has no matching [ before it — brackets are unbalanced.",
        );
      }
      instructions.push({ op: "close" });
    }
  }

  if (depth !== 0) {
    throw new BrainfuckSyntaxError(
      `${depth} opening bracket${depth === 1 ? "" : "s"} never closed.`,
    );
  }
  return { instructions, sourceOps };
}

// --- WAT rendering -------------------------------------------------------

/** Render the parsed program as readable WebAssembly text (no fuel counter). */
export function toWat(program: BrainfuckProgram): string {
  const lines: string[] = [
    "(module",
    '  (import "bf" "read" (func $read (param i32) (result i32)))',
    '  (import "bf" "write" (func $write (param i32)))',
    `  (memory (export "memory") ${TAPE_PAGES})`,
    "  (global $p (mut i32) (i32.const 0))",
    '  (func (export "run")',
  ];
  let indent = 4;
  const pad = () => " ".repeat(indent);
  for (const instr of program.instructions) {
    switch (instr.op) {
      case "add":
        lines.push(
          `${pad()}(i32.store8 (global.get $p) (i32.add (i32.load8_u (global.get $p)) (i32.const ${instr.value})))`,
        );
        break;
      case "move":
        lines.push(`${pad()}(global.set $p (i32.add (global.get $p) (i32.const ${instr.value})))`);
        break;
      case "clear":
        lines.push(`${pad()}(i32.store8 (global.get $p) (i32.const 0))`);
        break;
      case "write":
        lines.push(`${pad()}(call $write (i32.load8_u (global.get $p)))`);
        break;
      case "read":
        lines.push(
          `${pad()}(i32.store8 (global.get $p) (call $read (i32.load8_u (global.get $p))))`,
        );
        break;
      case "open":
        lines.push(`${pad()}(block`);
        lines.push(`${pad()}  (loop`);
        indent += 4;
        lines.push(`${pad()}(br_if 1 (i32.eqz (i32.load8_u (global.get $p))))`);
        break;
      case "close":
        lines.push(`${pad()}(br 0)`);
        indent -= 4;
        lines.push(`${pad()}  )`);
        lines.push(`${pad()})`);
        break;
    }
  }
  lines.push("  )", ")");
  return lines.join("\n");
}

// --- WASM binary emission ------------------------------------------------

function unsignedLEB(value: number): number[] {
  const bytes: number[] = [];
  let v = value >>> 0;
  do {
    let byte = v & 0x7f;
    v >>>= 7;
    if (v !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (v !== 0);
  return bytes;
}

function signedLEB(value: number): number[] {
  const bytes: number[] = [];
  let more = true;
  let v = value | 0;
  while (more) {
    let byte = v & 0x7f;
    v >>= 7;
    const signBit = byte & 0x40;
    if ((v === 0 && signBit === 0) || (v === -1 && signBit !== 0)) more = false;
    else byte |= 0x80;
    bytes.push(byte);
  }
  return bytes;
}

function section(id: number, payload: number[]): number[] {
  return [id, ...unsignedLEB(payload.length), ...payload];
}

function vec(items: number[][]): number[] {
  const out = [...unsignedLEB(items.length)];
  for (const item of items) out.push(...item);
  return out;
}

// Opcodes and helpers used in the function body.
const GET_P = [0x23, 0x00]; // global.get $p
const SET_P = [0x24, 0x00]; // global.set $p
const LOAD8 = [0x2d, 0x00, 0x00]; // i32.load8_u align=0 offset=0
const STORE8 = [0x3a, 0x00, 0x00]; // i32.store8 align=0 offset=0
const constI32 = (n: number) => [0x41, ...signedLEB(n)];

type WasmOptions = { fuel?: number | null };

/** Emit the executable WebAssembly module bytes for the program. */
export function toWasm(program: BrainfuckProgram, options: WasmOptions = {}): Uint8Array {
  const fuel = options.fuel ?? DEFAULT_FUEL;
  const useFuel = fuel !== null;
  const F = 1; // global $fuel (global $p is index 0)
  const getFuel = [0x23, F];
  const setFuel = [0x24, F];

  const body: number[] = [];
  for (const instr of program.instructions) {
    switch (instr.op) {
      case "add":
        // store8(p, load8(p) + value)
        body.push(...GET_P, ...GET_P, ...LOAD8, ...constI32(instr.value), 0x6a, ...STORE8);
        break;
      case "move":
        body.push(...GET_P, ...constI32(instr.value), 0x6a, ...SET_P);
        break;
      case "clear":
        body.push(...GET_P, ...constI32(0), ...STORE8);
        break;
      case "write":
        body.push(...GET_P, ...LOAD8, 0x10, 0x01); // call $write
        break;
      case "read":
        // store8(p, read(load8(p))) — EOF leaves the cell unchanged.
        body.push(...GET_P, ...GET_P, ...LOAD8, 0x10, 0x00, ...STORE8);
        break;
      case "open":
        body.push(0x02, 0x40); // block
        body.push(0x03, 0x40); // loop
        if (useFuel) {
          // if fuel == 0 trap; else fuel -= 1
          body.push(...getFuel, 0x45, 0x04, 0x40, 0x00, 0x0b); // if (i32.eqz fuel) unreachable
          body.push(...getFuel, ...constI32(1), 0x6b, ...setFuel); // fuel = fuel - 1
        }
        body.push(...GET_P, ...LOAD8, 0x45, 0x0d, 0x01); // br_if 1 (i32.eqz load8)
        break;
      case "close":
        body.push(0x0c, 0x00); // br 0
        body.push(0x0b); // end loop
        body.push(0x0b); // end block
        break;
    }
  }
  body.push(0x0b); // end of function

  const funcBody = [...vec([]), ...body]; // locals vec (empty) + body
  const code = section(10, vec([[...unsignedLEB(funcBody.length), ...funcBody]]));

  const types = section(
    1,
    vec([
      [0x60, ...vec([[0x7f]]), ...vec([[0x7f]])], // (i32) -> (i32)  read
      [0x60, ...vec([[0x7f]]), ...vec([])], // (i32) -> ()  write
      [0x60, ...vec([]), ...vec([])], // () -> ()      run
    ]),
  );

  const enc = (s: string) => {
    const bytes = [...new TextEncoder().encode(s)];
    return [...unsignedLEB(bytes.length), ...bytes];
  };
  const imports = section(
    2,
    vec([
      [...enc("bf"), ...enc("read"), 0x00, 0x00], // func type 0
      [...enc("bf"), ...enc("write"), 0x00, 0x01], // func type 1
    ]),
  );

  const funcs = section(3, vec([[0x02]])); // run: type 2
  const mems = section(5, vec([[0x00, ...unsignedLEB(TAPE_PAGES)]])); // min pages, no max

  const globals: number[][] = [
    [0x7f, 0x01, ...constI32(0), 0x0b], // $p: mut i32 = 0
  ];
  if (useFuel) globals.push([0x7f, 0x01, ...constI32(fuel), 0x0b]); // $fuel: mut i32 = budget
  const globalSection = section(6, vec(globals));

  const exports = section(
    7,
    vec([
      [...enc("run"), 0x00, 0x02], // func index 2
      [...enc("memory"), 0x02, 0x00], // memory index 0
    ]),
  );

  const bytes = [
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // magic + version
    ...types,
    ...imports,
    ...funcs,
    ...mems,
    ...globalSection,
    ...exports,
    ...code,
  ];
  return Uint8Array.from(bytes);
}

export type CompileResult = {
  program: BrainfuckProgram;
  wat: string;
  wasm: Uint8Array;
};

/** Parse, then emit both the display WAT and the executable module. */
export function compileBrainfuck(source: string, options: WasmOptions = {}): CompileResult {
  const program = parseBrainfuck(source);
  return { program, wat: toWat(program), wasm: toWasm(program, options) };
}
