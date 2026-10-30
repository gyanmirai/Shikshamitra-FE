import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyContent } from 'src/components/empty-content';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import SeoIllustration from './seo-illustration';
import ForbiddenIllustration from './forbidden-illustration';
import MotivationIllustration from './motivation-illustration';
import ComingSoonIllustration from './coming-soon-illustration';
import MaintenanceIllustration from './maintenance-illustration';
import ServerErrorIllustration from './server-error-illustration';
import PageNotFoundIllustration from './page-not-found-illustration';
import OrderCompleteIllustration from './order-complete-illustration';
import { TableLoadingIllustration } from './table-loading-illustration';
import { AccountAccessIllustration } from './account-access-illustration';
import { STUDENT_CHARACTER_SRC, STUDENT_EMPTY_STATE_SRC } from './student-character-asset';

const character = '/assets/illustrations/characters/shikshamitra-student.png';

describe('shared student mascot replacement', () => {
  it('loads the public mascot from the current app instead of a configured unrelated origin', () => {
    expect(STUDENT_CHARACTER_SRC).toBe(character);
  });
  it.each([
    ['coming soon', ComingSoonIllustration], ['motivation', MotivationIllustration],
    ['overview', SeoIllustration], ['forbidden', ForbiddenIllustration],
    ['maintenance', MaintenanceIllustration], ['404', PageNotFoundIllustration],
    ['server error', ServerErrorIllustration], ['order complete', OrderCompleteIllustration],
  ] as const)('keeps the same supplied character in the %s scene', (_name, Illustration) => {
    const { container } = render(<ThemeProvider theme={createTheme({ cssVariables: true })}><Illustration /></ThemeProvider>);
    expect(container.querySelector('svg image')?.getAttribute('href')).toMatch(/shikshamitra-student\.png$/);
  });
  it.each(['light', 'dark'] as const)(
    'shows the supplied character in empty, loading and account-access scenes in %s',
    (mode) => {
      const { container } = render(
        <ThemeProvider theme={createTheme({ cssVariables: true, palette: { mode } })}>
          <EmptyContent title="No students" description="Add a student to see records." />
          <TableLoadingIllustration />
          <AccountAccessIllustration />
        </ThemeProvider>
      );
      const images = Array.from(container.querySelectorAll('svg image'));
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute('href', STUDENT_EMPTY_STATE_SRC);
      expect(STUDENT_EMPTY_STATE_SRC).toBe(
        '/assets/illustrations/characters/shikshamitra-student-empty.webp'
      );
      images.slice(1).forEach((image) => {
        expect(image.getAttribute('href')).toMatch(
          new RegExp(`${character.replaceAll('.', '\\.')}\u0024`)
        );
      });
      images.forEach((image) => {
        expect(image.closest('svg')).toHaveAttribute('aria-hidden', 'true');
      });
      expect(screen.getByText('No students')).toBeVisible();
      expect(screen.getByText('Add a student to see records.')).toBeVisible();
    }
  );

  it('keeps an explicitly supplied contextual empty image', () => {
    const { container } = render(
      <EmptyContent title="No documents" imgUrl="/contextual-document.svg" />
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/contextual-document.svg');
    expect(container.querySelector('svg image')).toBeNull();
  });
});
