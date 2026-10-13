import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';

import {
  customField,
  customSource,
  customSection,
  customDetails,
} from './student-custom-details-test-fixture';
import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileNavigation,
  profileDetailsPath,
  renderStudentProfile,
} from './student-profile-test-fixture';

const readGrants = [
  'Students.Records.StudentList.View',
  'Students.Admissions.Documents.View',
  'Students.Records.Changes.View',
];
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const changePath = '*/api/students/records/changes';
const change = {
  id: 'change-1',
  studentId: profileStudentId,
  studentName: 'Aanya Patel',
  academicYearId: 'year-1',
  requestedBy: 'staff-1',
  requestedByName: 'Anita Shah',
  section: 'custom-details',
  action: 'Correction',
  reason: 'Corrected after verification',
  status: 'Applied',
  concurrencyStamp: 'stamp-1',
  effectiveAt: '2026-09-10T08:00:00Z',
  creationTime: '2026-09-10T08:00:00Z',
  appliedAt: '2026-09-10T09:00:00Z',
  approvalCount: 1,
  requiredApprovals: 1,
  canApprove: false,
  canCancel: false,
  payloadMasked: false,
  decisions: [
    {
      actorId: 'reviewer-1',
      actorName: 'Neha Patel',
      stage: 1,
      decision: 'Approved',
      reason: 'Evidence checked',
      creationTime: '2026-09-10T09:00:00Z',
    },
  ],
};

it('shows the full offering form in Details without changing its original evidence or adding an admission tab', async () => {
  const source = customSource(
    [customSection([customField('blood', 0, { label: 'Blood group' })])],
    { blood: 'B+' }
  );
  source.currentValues.blood = 'O+';
  source.formEditableFieldCodes = ['blood'];
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () =>
      HttpResponse.json({ data: { ...customDetails([source]), formSources: [source] } })
    )
  );
  renderStudentProfile();
  expect(await screen.findByText('Aanya Patel')).toBeVisible();
  const detailsLink = screen.getByRole('tab', { name: 'Details' });
  expect(detailsLink).toHaveAttribute('href', '/student/profile?view=details');
  await userEvent.click(detailsLink);
  expect(await screen.findByRole('textbox', { name: 'Blood group' })).toHaveValue('O+');
  expect(screen.getByRole('textbox', { name: 'Blood group' })).toBeDisabled();
  expect(screen.queryByText('B+')).not.toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Admission & Onboarding' })).not.toBeInTheDocument();
  expect(source.originalValues.blood).toBe('B+');
  expect(new URLSearchParams(profileNavigation.query).get('view')).toBe('details');
});

it.each(['NotRequired', 'Failed', 'Pending'])(
  'shows the real credential state %s for an already active enrollment',
  async (credentialsStatus) => {
    mswServer.use(
      http.get(profilePath, () =>
        HttpResponse.json({
          data: {
            ...studentProfile,
            academicYearId: 'year-1',
            admissionOnboarding: [
              {
                applicationId: 'application-1',
                applicationNumber: 'APP-001',
                academicYearId: 'year-1',
                finalizedAt: '2026-09-02T08:00:00Z',
                onboardingCaseId: 'case-1',
                status: 'Activated',
                activatedAt: '2026-09-03T08:00:00Z',
                credentialsStatus,
              },
            ],
          },
        })
      )
    );
    renderStudentProfile();
    expect(await screen.findByText('Portal credentials')).toBeVisible();
    expect(
      screen.getByText(
        { NotRequired: 'Not required', Failed: 'Failed', Pending: 'Pending' }[credentialsStatus]!
      )
    ).toBeVisible();
    if (credentialsStatus === 'NotRequired')
      expect(screen.queryByText(/credentials are still pending/)).not.toBeInTheDocument();
    if (credentialsStatus === 'Failed')
      expect(screen.getByText(/credentials need attention/)).toBeVisible();
  }
);

it('loads the selected change detail before showing its before/after values and reviewer attribution', async () => {
  const source = customSource(
    [customSection([customField('blood', 0, { label: 'Blood group' })])],
    { blood: 'B+' }
  );
  let detailReads = 0;
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () => HttpResponse.json({ data: customDetails([source]) })),
    http.get(changePath, () => HttpResponse.json({ data: { items: [change], totalCount: 1 } })),
    http.get(`${changePath}/:id`, () => {
      detailReads += 1;
      return HttpResponse.json({
        data: {
          ...change,
          before: { sources: [{ applicationId: 'application-1', values: { blood: 'B+' } }] },
          proposed: { sources: [{ applicationId: 'application-1', values: { blood: 'O+' } }] },
        },
      });
    })
  );
  renderStudentProfile(profileStudentId, readGrants);
  await screen.findByText('Aanya Patel');
  expect(detailReads).toBe(0);
  await userEvent.click(screen.getByRole('tab', { name: 'History' }));
  await userEvent.click(
    await screen.findByRole('button', { name: 'View School details change history' })
  );
  const dialog = await screen.findByRole('dialog');
  expect(await within(dialog).findByText('Blood group')).toBeVisible();
  expect(within(dialog).getByText('B+')).toBeVisible();
  expect(within(dialog).getByText('O+')).toBeVisible();
  expect(within(dialog).getByText('Anita Shah')).toBeVisible();
  expect(within(dialog).getByText(/Neha Patel/)).toBeVisible();
  expect(detailReads).toBe(1);
});

it('reports a history read failure without presenting a false empty-history message', async () => {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(changePath, () =>
      HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
    )
  );
  renderStudentProfile(profileStudentId, readGrants);
  await screen.findByText('Aanya Patel');
  await userEvent.click(screen.getByRole('tab', { name: 'History' }));
  expect(await screen.findByRole('button', { name: 'Retry History' })).toBeVisible();
  expect(screen.queryByText('No record changes yet')).not.toBeInTheDocument();
});

it('uses a contextual missing-form state without fixed detail cards or correction redirects', async () => {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () =>
      HttpResponse.json({
        data: {
          ...customDetails([]),
          structuredSections: [
            {
              section: 'general',
              hasData: true,
              isMasked: false,
              canEdit: true,
              data: { firstName: 'Aanya' },
            },
            { section: 'medical', hasData: false, isMasked: false, canEdit: true },
            { section: 'bank', hasData: false, isMasked: false, canEdit: false },
          ],
        },
      })
    )
  );
  renderStudentProfile(profileStudentId, [...readGrants, 'Students.Records.Changes.Create']);
  await screen.findByText('Aanya Patel');
  await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
  expect(await screen.findByText('No Registration form available')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Add details' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Request change' })).not.toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.queryByText('No details have been collected for this section.')
    ).not.toBeInTheDocument()
  );
});
