import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import { PublicAdmissionsShell } from './public-admissions-shell';

describe('PublicAdmissionsShell', () => {
  it('provides localized skip navigation and keeps tenant color decorative', () => {
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    renderWithProviders(
      <PublicAdmissionsShell
        title="Admission status"
        language="gu"
        portal={{
          schoolName: 'Example School',
          primaryColor: '#1976D2',
          defaultLanguage: 'gu',
          supportedLanguages: ['en', 'gu', 'hi'],
        }}
      >
        <button type="button">Continue admission</button>
      </PublicAdmissionsShell>
    );

    const skipLink = screen.getByRole('link', { name: 'પ્રવેશ સામગ્રી પર જાઓ' });
    fireEvent.click(skipLink);

    expect(screen.getByRole('main')).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(screen.getByText('Example School')).not.toHaveStyle({ color: 'rgb(25, 118, 210)' });
  });
});
