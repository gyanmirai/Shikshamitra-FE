import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

  it('directs administrators to deactivate when linked applications block deletion', () => {
    render(<AdmissionOfferingActionImpact action="delete" offering={offering} />);

    expect(screen.getByText(/server will reject deletion/)).toBeVisible();
    expect(screen.getByText(/Deactivate the offering instead/)).toBeVisible();
  });
});
