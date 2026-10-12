import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdmissionOfferingActionImpact } from './admission-offering-action-impact';

const offering = {
  code: 'ADM-GRADE-5',
  standardName: 'Grade 5',
  campusName: 'Main Campus',
  boardName: 'CBSE',
  mediumName: 'English',
  stageName: 'Primary',
  applicationCount: 12,
} as AdmissionOfferingListItem;

describe('AdmissionOfferingActionImpact', () => {
  it('explains that deactivation stops new intake without removing existing applications', () => {
    render(<AdmissionOfferingActionImpact action="deactivate" offering={offering} />);

    expect(screen.getByText('New inquiries and applications will stop immediately')).toBeVisible();
    expect(screen.getByText(/12 applications already linked/)).toBeVisible();
  });

  it.each([0, 12])('keeps deletion text simple with %i linked applications', (applicationCount) => {
    render(
      <AdmissionOfferingActionImpact
        action="delete"
        offering={{ ...offering, name: 'General intake', applicationCount }}
      />
    );

    expect(screen.getByText(/permanently delete “General intake”/)).toBeVisible();
    expect(screen.getByText(/This action cannot be undone/)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Current usage|Grade 5|Main Campus|CBSE|server will reject/)
    ).not.toBeInTheDocument();
  });

  it('uses the offering code when no name is available', () => {
    render(<AdmissionOfferingActionImpact action="delete" offering={offering} />);

    expect(screen.getByText(/permanently delete “ADM-GRADE-5”/)).toBeVisible();
  });

  it('keeps activation confirmation to one sentence without usage or extra information', () => {
    render(<AdmissionOfferingActionImpact action="activate" offering={offering} />);

    expect(screen.getByText('“ADM-GRADE-5” will become active.')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Current usage|Main Campus|server will recheck/)
    ).not.toBeInTheDocument();
  });
});
