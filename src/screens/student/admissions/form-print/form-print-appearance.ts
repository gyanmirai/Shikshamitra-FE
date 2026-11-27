import type {
  AdmissionPrintAdvancedSettings,
  AdmissionPrintPaperSize,
} from 'src/redux/student/admissions/admission-form-print-settings';

import COLORS from 'src/theme/core/colors.json';
import { ADMISSION_PRINT_PALETTES } from 'src/redux/student/admissions/admission-form-print-settings';

/** Only settings that depend on advanced layout may select the advanced renderer. */
export function usesAdvancedAdmissionPrintLayout(
  advanced?: AdmissionPrintAdvancedSettings | null,
  paperSize?: AdmissionPrintPaperSize
) {
  if (paperSize && paperSize !== 'A4') return true;
  if (!advanced) return false;

  const { border, style, ...layout } = advanced;
  return (
    border?.sectionBorders != null ||
    border?.fieldBorders != null ||
    border?.dividers != null ||
    style?.fontFamily != null ||
    style?.baseSize != null ||
    style?.titleSize != null ||
    style?.labelWeight != null ||
    Object.values(layout).some(
      (group) => group && Object.values(group).some((value) => value != null)
    )
  );
}

export function getLegacyAdmissionPrintColors(style?: AdmissionPrintAdvancedSettings['style']) {
  const palette = style?.palette ? ADMISSION_PRINT_PALETTES[style.palette] : undefined;
  const overrides = style?.palette === 'monochrome' ? undefined : style;
  const text = overrides?.textColor ?? palette?.textColor;
  const border = overrides?.borderColor ?? palette?.borderColor;

  return {
    text: text ?? COLORS.grey[800],
    mutedText: text ?? COLORS.grey[600],
    border: border ?? COLORS.grey[500],
    strongBorder: border ?? COLORS.grey[700],
    detailBorder: border ?? COLORS.grey[600],
    lightBorder: border ?? COLORS.grey[300],
    sectionFill: overrides?.sectionFill ?? palette?.sectionFill ?? COLORS.grey[100],
  };
}
