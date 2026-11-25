import type { AdmissionPrintAssetPlacement } from 'src/redux/student/admissions/admission-form-print-settings';

const MIN_SIZE = 5;
const round = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const fit = (value: number, min: number, max: number) =>
  clamp(round(value), min, Math.floor(max * 10) / 10);

export function movePrintAsset(placement: AdmissionPrintAssetPlacement, x: number, y: number) {
  return {
    ...placement,
    x: x === placement.x ? x : fit(x, 0, 100 - placement.width),
    y: y === placement.y ? y : fit(y, 0, 100 - placement.height),
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
      width: fit(
        dimension === 'width' ? value : (otherValue ?? placement.width),
        MIN_SIZE,
        availableWidth
      ),
      height: fit(
        dimension === 'height' ? value : (otherValue ?? placement.height),
        MIN_SIZE,
        availableHeight
      ),
    };
  }
  const min = Math.max(MIN_SIZE / placement.width, MIN_SIZE / placement.height);
  const max = Math.min(availableWidth / placement.width, availableHeight / placement.height);
  const scale = clamp(value / placement[dimension], min, max);
  return {
    ...placement,
    width: fit(placement.width * scale, MIN_SIZE, availableWidth),
    height: fit(placement.height * scale, MIN_SIZE, availableHeight),
  };
}
