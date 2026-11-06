import { presetBack } from './preset-back';
import { presetFront } from './preset-front';
import { portraitPresetElements } from './preset-portrait';

import type { IdentityCardLayout } from './types';

type PresetOptions = {
  widthMm?: number;
  heightMm?: number;
  themeColor?: string;
  backgroundColor?: string;
};

export function createIdentityCardPreset(
  key: 'classic-identity' | 'staff-professional',
  options: PresetOptions = {}
): IdentityCardLayout {
  const staff = key === 'staff-professional';
  const themeColor = options.themeColor ?? '#007867';
  const backgroundColor = options.backgroundColor ?? '#FFFFFF';
  const widthMm = options.widthMm ?? 85.6;
  const heightMm = options.heightMm ?? 53.98;
  const front = presetFront(staff, themeColor);
  const back = presetBack(staff, themeColor);
  const portrait = widthMm < heightMm;
  return {
    orientation: widthMm >= heightMm ? 'Horizontal' : 'Vertical',
    width: portrait ? 270 : 428,
    height: portrait ? 428 : 270,
    widthMm,
    heightMm,
    themeColor,
    backgroundColor,
    presetKey: key,
    front: { elements: portrait ? portraitPresetElements(front, false) : front },
    back: { elements: portrait ? portraitPresetElements(back, true) : back },
  };
}
