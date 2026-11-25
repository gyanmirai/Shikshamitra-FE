import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { createIdentityCardPreset } from './presets';
import { IdentityCardSheetPreview } from './sheet-preview';
import { DEFAULT_IDENTITY_CARD_PRINT_SETTINGS } from './geometry';

it('reacts to cut marks, count, gap and mirrored back placement', () => {
  const layout = createIdentityCardPreset('classic-identity');
  const settings = { ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS, cardsPerPage: 1 };
  const view = render(
    <IdentityCardSheetPreview layout={layout} settings={settings} backSideEnabled />
  );
  const page = screen.getByRole('img', { name: 'Front A4 sheet preview' });
  const frontTrim = page.querySelector('[data-trim]')?.getAttribute('x');
  expect(page.querySelectorAll('[data-trim]')).toHaveLength(1);
  expect(page.querySelectorAll('[data-cut-mark]')).toHaveLength(8);
  fireEvent.click(screen.getByRole('button', { name: 'Back sheet' }));
  expect(page.querySelector('[data-trim]')?.getAttribute('x')).not.toBe(frontTrim);

  view.rerender(
    <IdentityCardSheetPreview
      layout={layout}
      settings={{ ...settings, cardsPerPage: 2, gap: 10, showCutMarks: false }}
      backSideEnabled
    />
  );
  expect(page.querySelectorAll('[data-trim]')).toHaveLength(2);
  expect(page.querySelectorAll('[data-cut-mark]')).toHaveLength(0);

  view.rerender(
    <IdentityCardSheetPreview
      layout={layout}
      settings={{ ...settings, gap: 1, bleedMm: 1 }}
      backSideEnabled
    />
  );
  expect(page.querySelectorAll('[data-cut-mark]')).toHaveLength(8);
});
