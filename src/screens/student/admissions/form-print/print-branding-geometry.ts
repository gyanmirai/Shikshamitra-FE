import type { AdmissionPrintAssetPlacement } from 'src/redux/student/admissions/admission-form-print-settings';

const MIN_SIZE = 5;
const round = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function movePrintAsset(placement: AdmissionPrintAssetPlacement, x: number, y: number) {
  return {
    ...placement,
    x: round(clamp(x, 0, 100 - placement.width)),
    y: round(clamp(y, 0, 100 - placement.height)),
  };
}

export function resizePrintAsset(
  placement: AdmissionPrintAssetPlacement,
  dimension: 'width' | 'height',
  value: number,
  otherValue?: number
): AdmissionPrintAssetPlacement {
  const availableWidth = 100 - placement.x;
  const availableHeight = 100 - placement.y;
  if (placement.lockAspectRatio === false) {
    return {
      ...placement,
      width: round(
        clamp(
          dimension === 'width' ? value : (otherValue ?? placement.width),
          MIN_SIZE,
          availableWidth
        )
      ),
      height: round(
        clamp(
          dimension === 'height' ? value : (otherValue ?? placement.height),
          MIN_SIZE,
          availableHeight
        )
      ),
    };
  }
  const min = Math.max(MIN_SIZE / placement.width, MIN_SIZE / placement.height);
  const max = Math.min(availableWidth / placement.width, availableHeight / placement.height);
  const scale = clamp(value / placement[dimension], min, max);
  return {
    ...placement,
    width: round(placement.width * scale),
    height: round(placement.height * scale),
  };
}
