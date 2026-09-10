import { stylesMode } from './utils';

export type SemanticColorName = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export type ColorSchemeName = 'light' | 'dark';

interface SemanticTonalColor {
  darker: string;
  light: string;
}

interface ThemeWithSemanticPalette {
  vars: {
    palette: Record<SemanticColorName, SemanticTonalColor>;
  };
}

export function getSemanticTextColor(color: SemanticTonalColor, mode: ColorSchemeName): string {
  return mode === 'dark' ? color.light : color.darker;
}

export function getSemanticTextStyles(theme: ThemeWithSemanticPalette, color: SemanticColorName) {
  const paletteColor = theme.vars.palette[color];

  return {
    color: getSemanticTextColor(paletteColor, 'light'),
    [stylesMode.dark]: {
      color: getSemanticTextColor(paletteColor, 'dark'),
    },
  };
}
