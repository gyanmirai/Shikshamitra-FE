import type { AdmissionPrintField } from './form-print-model';

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

/** Reserve line height when checking whether text can fit on a fresh page. */
export function estimatePrintTextHeight(value: string, width: number, fontSize: number) {
  return value ? estimatePrintTextLines(value, width, fontSize * 0.6) * fontSize * 1.45 : 0;
}

function estimateStandardTextHeight(value: string, width: number, fontSize: number) {
  if (!value) return 0;
  const lines = value.split(/\r?\n/).reduce((count, line) => {
    // The standard templates use a proportional font. A uniform character width substantially
    // overestimates Latin paragraphs with spaces and narrow letters such as i and l.
    const narrow = line.match(/[ .,;:'!|ilI]/g)?.length ?? 0;
    const wide = line.match(/[MmWw@%]/g)?.length ?? 0;
    const capitals = line.match(/[A-HJ-LN-VX-Z]/g)?.length ?? 0;
    const widthInEm = line.length * 0.6 - narrow * 0.28 + wide * 0.35 + capitals * 0.1;
    return count + Math.max(1, Math.ceil((widthInEm * fontSize) / Math.max(1, width)));
  }, 0);
  return lines * fontSize * 1.45;
}

/** Includes writing space and padding in the standard templates. */
export function estimateStandardPrintFieldHeight(
  field: AdmissionPrintField,
  fieldWidth: number,
  fontSize: number,
  isBlank: boolean
) {
  const text = isBlank
    ? (field.options?.map((option) => option.label).join('    ') ?? '')
    : field.value;
  return (
    estimateStandardTextHeight(field.label, fieldWidth, fontSize - 1) +
    estimateStandardTextHeight(text, fieldWidth, fontSize) +
    (field.kind === 'photo' ? 110 : field.kind === 'multiline' && isBlank ? 78 : 55)
  );
}
