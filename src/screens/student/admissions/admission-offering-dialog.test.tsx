import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdmissionOfferingDialog } from './admission-offering-dialog';

vi.mock('./admission-offering-edit-drawer', () => ({
  AdmissionOfferingEditDrawer: () => <div>Edit offering stepper drawer</div>,
}));

const cycle = {
  id: 'cycle-1',
  name: 'Admissions 2027-28',
  code: 'ADM-2728',
  academicYearId: 'year-1',
  academicYearName: '2027-28',
  startDate: '2027-10-01T00:00:00Z',
  endDate: '2028-03-31T00:00:00Z',
  status: 1,
} as AdmissionCycle;

describe('Admission Offering dialog routing', () => {
  it('uses the stepped edit drawer for an existing offering', () => {
    render(
      <AdmissionOfferingDialog
        open
        mode="edit"
        cycle={cycle}
        cycles={[cycle]}
        offering={{ id: 'offering-1' } as AdmissionOffering}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('Edit offering stepper drawer')).toBeVisible();
  });
});
