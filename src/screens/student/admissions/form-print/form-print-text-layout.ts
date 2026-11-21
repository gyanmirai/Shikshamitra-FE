/** Conservative line reservation for fixed paper headers; keeps configured branding complete. */
export function estimatePrintTextLines(value: string, width: number, characterWidth: number) {
  return value
    .split(/\r?\n/)
    .reduce(
      (lines, line) =>
        lines +
        Math.max(1, Math.ceil(line.length / Math.max(1, Math.floor(width / characterWidth)))),
      0
    );
}
