// Sample Brainfuck programs for the demo. rot13 and reverse fit the GPU's
// 256-source-byte workgroup and compile on the GPU; wc is Daniel B. Cristofani's
// public-domain word counter (brainfuck.org), large enough that it exceeds the
// workgroup and takes the CPU fallback. Stored verbatim.

export type BrainfuckSample = { id: string; label: string; source: string; input: string };

export const BRAINFUCK_SAMPLES: readonly BrainfuckSample[] = [
  {
    id: "rot13",
    label: "rot13",
    input: "The quick brown fox jumps over the lazy dog.",
    source: `-,+[-[>>++++[>++++++++<-]<+<-[>+>+>-[>>>]<[[>+<-]>>+>]<<<<<-]]>>>[-]+>--[-[<->+++[-]]]<[++++++++++++<[>-[>+>>]>[+[<+>-]>+>>]<<<<<-]>>[<+>-]>[-[-<<[-]>>]<<[<<->>-]>>]<<[<<+>>-]]<[-]<.[-]<-,+]`,
  },
  {
    id: "reverse",
    label: "reverse",
    input: "Was it a car or a cat I saw",
    source: ">,[>,]<[.<]",
  },
  {
    id: "wc",
    label: "word count (large)",
    input: "the fold in the map\nis where the road forks\nand the ink pools dark\n",
    source: `>>>+>>>>>+>>+>>+[<<],[
    -[-[-[-[-[-[-[-[<+>-[>+<-[>-<-[-[-[<++[<++++++>-]<
        [>>[-<]<[>]<-]>>[<+>-[<->[-]]]]]]]]]]]]]]]]
    <[-<<[-]+>]<<[>>>>>>+<<<<<<-]>[>]>>>>>>>+>[
        <+[
            >+++++++++<-[>-<-]++>[<+++++++>-[<->-]+[+>>>>>>]]
            <[>+<-]>[>>>>>++>[-]]+<
        ]>[-<<<<<<]>>>>
    ],
]+<++>>>[[+++++>>>>>>]<+>+[[<++++++++>-]<.<<<<<]>>>>>>>>]
[Counts lines, words, bytes. Assumes no-change-on-EOF or EOF->0.
Daniel B Cristofani (cristofdathevanetdotcom)
http://www.hevanet.com/cristofd/brainfuck/]
`,
  },
];

export const DEFAULT_SAMPLE = BRAINFUCK_SAMPLES[0];
