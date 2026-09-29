import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderDocumentUi } from './document-verification/document-ui-test-fixture';
import { ApplicationExperienceNavigation } from './application-experience-navigation';

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
});
