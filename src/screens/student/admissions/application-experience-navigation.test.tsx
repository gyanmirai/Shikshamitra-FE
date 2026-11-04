import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';

import { renderDocumentUi } from './document-verification/document-ui-test-fixture';
import { ApplicationExperienceNavigation } from './application-experience-navigation';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('admission form navigation', () => {
  it('links only the two supported form views', () => {
    renderDocumentUi(<ApplicationExperienceNavigation value="inquiry" />);

    expect(screen.getByRole('tablist', { name: 'Admission Form Views' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('tab', { name: 'Correction forms' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Consent forms' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Document Requirements' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Parent communication' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Registration Forms' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/forms?view=registration'
    );
  });

  it.each(['inquiry', 'registration'] as const)(
    'keeps the rounded surface and selected state for %s forms',
    (value) => {
      renderDocumentUi(<ApplicationExperienceNavigation value={value} />);

      const tablist = screen.getByRole('tablist', { name: 'Admission Form Views' });
      expect(tablist.closest('.MuiPaper-root')).toHaveStyle({
        borderRadius: 'calc(2 * var(--shape-borderRadius))',
        overflow: 'hidden',
      });
      const selectedLabel = value === 'inquiry' ? 'Inquiry Forms' : 'Registration Forms';
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
    expect(screen.getByRole('tab', { name: 'Inquiry Forms' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Registration Forms' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Inquiry Forms' })).toHaveAttribute(
      'href',
      '/student/admissions/settings/forms?view=inquiry'
    );
  });
});
