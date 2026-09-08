import { it, expect, describe } from 'vitest';
import { createTheme } from 'src/theme/create-theme';
import { getContrastRatio } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';

import { stylesMode } from './utils';
import { getSemanticTextColor, getSemanticTextStyles } from './semantic-colors';
import {
  info,
  text,
  error,
  primary,
  success,
  warning,
  secondary,
  background,
} from '../core/palette';

const semanticColors = [primary, secondary, info, success, warning, error].map(
  ({ light, darker }) => ({ light, darker })
);

describe('dark-mode readable semantic colors', () => {
  it.each([
    ['light', background.light.paper],
    ['dark', background.dark.paper],
  ] as const)('keeps semantic text readable on the %s paper surface', (mode, surface) => {
    semanticColors.forEach((color) => {
      expect(getContrastRatio(getSemanticTextColor(color, mode), surface)).toBeGreaterThanOrEqual(
        4.5
      );
    });
  });

  it('keeps secondary text readable on dark neutral and paper surfaces', () => {
    expect(getContrastRatio(text.dark.secondary, background.dark.neutral)).toBeGreaterThanOrEqual(
      4.5
    );
    expect(getContrastRatio(text.dark.secondary, background.dark.paper)).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it('emits separate light and dark mode style tokens', () => {
    const theme = createTheme(defaultSettings);
    const styles = getSemanticTextStyles(theme, 'success');

    expect(styles.color).toBe(theme.vars.palette.success.darker);
    expect(styles[stylesMode.dark]).toEqual({ color: theme.vars.palette.success.light });
  });
});
