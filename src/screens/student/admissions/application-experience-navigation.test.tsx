import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';

import { renderDocumentUi } from './document-verification/document-ui-test-fixture';
import { ApplicationExperienceNavigation } from './application-experience-navigation';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('admission form navigation', () => {
  it('links only the two supported form views', () => {
    renderDocumentUi(<ApplicationExperienceNavigation value="inquiry" />);

    expect(screen.getByRole('tablist', { name: 'Admission form views' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('tab', { name: 'Correction forms' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Consent forms' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Document requirements' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Parent communication' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Registration forms' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/forms?view=registration'
    );
  });

  it.each(['inquiry', 'registration'] as const)(
    'keeps the rounded surface and selected state for %s forms',
    (value) => {
      renderDocumentUi(<ApplicationExperienceNavigation value={value} />);

      const tablist = screen.getByRole('tablist', { name: 'Admission form views' });
      expect(tablist.closest('.MuiPaper-root')).toHaveStyle({
        borderRadius: 'calc(2 * var(--shape-borderRadius))',
        overflow: 'hidden',
      });
      const selectedLabel = value === 'inquiry' ? 'Inquiry forms' : 'Registration forms';
      expect(screen.getByRole('tab', { name: selectedLabel })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('tab', { name: selectedLabel })).toHaveAttribute(
        'aria-controls',
        `application-experience-${value}-panel`
      );
    }
  );

  it('preserves arrow-key focus and destination links', async () => {
    renderDocumentUi(<ApplicationExperienceNavigation value="inquiry" />);
    const user = userEvent.setup();

    await user.tab();
    expect(screen.getByRole('tab', { name: 'Inquiry forms' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Registration forms' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Inquiry forms' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/forms?view=inquiry'
    );
  });
});
