import type { TokenType } from "../highlight";

export type Rule = { type: TokenType; pattern: RegExp };

/** Build a rule whose pattern is compiled as sticky so the scanner can anchor it. */
export const rule = (type: TokenType, pattern: RegExp): Rule => ({
  type,
  pattern: new RegExp(pattern.source, `${pattern.flags}y`),
});
