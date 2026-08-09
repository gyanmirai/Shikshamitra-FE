import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorklistStageFilter } from './applicant-worklist-stage-filter';

const stages = [
  { key: AdmissionCrmPipelineColumnKey.Eligible, label: 'Eligible' },
  { key: AdmissionCrmPipelineColumnKey.RegistrationPending, label: 'Registration Pending' },
  { key: AdmissionCrmPipelineColumnKey.RegistrationDone, label: 'Registration Done' },
];

describe('Applicant worklist stage filter', () => {
  it('identifies registration stages as one exclusive filter group', () => {
    render(
      <ApplicantWorklistStageFilter
        title="Registration"
        label="Registration Stage"
        description="Choose the stage of registration work you want to review."
        columns={stages}
        selectedColumn={AdmissionCrmPipelineColumnKey.RegistrationPending}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('region', { name: 'Registration Stage filter' })).toBeVisible();
    expect(
      screen.getByText('Choose the stage of registration work you want to review.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Registration Pending' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('reports a new stage and ignores deselection of the active stage', () => {
    const onChange = vi.fn();
    render(
      <ApplicantWorklistStageFilter
        title="Registration"
        label="Registration Stage"
        description="Choose the stage of registration work you want to review."
        columns={stages}
        selectedColumn={AdmissionCrmPipelineColumnKey.RegistrationPending}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Registration Done' }));
    expect(onChange).toHaveBeenCalledWith(AdmissionCrmPipelineColumnKey.RegistrationDone);

    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Registration Pending' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
