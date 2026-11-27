import { View } from '@react-pdf/renderer';

import { PRINT_MM } from './form-print-advanced-layout';

import type { AdvancedPrintOptions } from './form-print-advanced-layout';

export function AdmissionPrintPageBorder({
  border,
  color,
  margin,
}: {
  border: AdvancedPrintOptions['border'];
  color: string;
  margin: number;
}) {
  if (!border.enabled) return null;

  // Keep the frame outside the content without changing the page layout.
  const inset = Math.min(border.inset * PRINT_MM, margin - 2 * PRINT_MM);
  const borderWidth = { thin: 0.5, medium: 1, thick: 1.5 }[border.thickness];
  const rounded = border.corners === 'rounded';

  return (
    <View
      fixed
      style={{ position: 'absolute', top: inset, bottom: inset, left: inset, right: inset }}
      render={({ pageNumber }) =>
        border.placement === 'every' || pageNumber === 1 ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              borderWidth,
              borderColor: color,
              borderRadius: rounded ? 7 : 0,
            }}
          >
            {border.style === 'double' && (
              <View
                style={{
                  position: 'absolute',
                  top: 3,
                  bottom: 3,
                  left: 3,
                  right: 3,
                  borderWidth: 0.5,
                  borderColor: color,
                  borderRadius: rounded ? 5 : 0,
                }}
              />
            )}
          </View>
        ) : null
      }
    />
  );
}
