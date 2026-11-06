import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { screen, within, waitFor } from '@testing-library/react';

import { profileOverviewContacts } from './student-profile-overview-model';
import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileDetailsPath,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const details: StudentRecordDetails = {
  studentId: profileStudentId,
  recordsAccess: 'Full',
  structuredSections: [
    {
      section: 'general',
      hasData: true,
      isMasked: false,
      canEdit: false,
      data: {
        primaryContactNo: '+91-9000012345',
        email: 'student@example.test',
        address1: '12 School Road',
        address2: 'West Colony',
        city: 'Ahmedabad',
        state: { name: 'Gujarat', isoCode: 'GJ' },
        country: { name: 'India', isoCode: 'IN' },
        pincode: '380015',
      },
    },
    {
      section: 'family',
      hasData: true,
      isMasked: false,
      canEdit: false,
      data: {
        mainContactRelationship: 'guardian',
        guardianDetails: { fullName: 'Meera Patel', email: 'guardian@example.test' },
        fatherDetails: { fullName: 'Father name', email: 'father@example.test' },
      },
    },
  ],
  registrationSources: [],
  customDetailsMasked: false,
  customDetailsEditable: false,
};

it('uses saved guardian data and formats saved location objects without confusing student and guardian email', () => {
  expect(profileOverviewContacts(details)).toEqual([
    { label: 'Main contact', value: 'Meera Patel' },
    { label: 'Relationship', value: 'Other guardian' },
    { label: 'Phone', value: undefined },
    { label: 'Email', value: 'guardian@example.test' },
    { label: 'Father', value: 'Father name' },
    { label: 'Mother', value: undefined },
    { label: 'Other guardian', value: 'Meera Patel' },
    { label: 'Address', value: '12 School Road, West Colony, Ahmedabad, Gujarat, 380015, India' },
  ]);
});

it('shows the saved father as the only parent contact and uses his own mailbox', () => {
  const withoutGuardian = {
    ...details,
    structuredSections: details.structuredSections.map((section) =>
      section.section === 'family'
        ? {
            ...section,
            data: { fatherDetails: { fullName: 'Father name', email: 'father@example.test' } },
          }
        : section
    ),
  };
  expect(profileOverviewContacts(withoutGuardian)).toEqual(
    expect.arrayContaining([
      { label: 'Main contact', value: 'Father name' },
      { label: 'Relationship', value: 'Father' },
      { label: 'Email', value: 'father@example.test' },
      { label: 'Other guardian', value: undefined },
    ])
  );
});

it.each(['masked sections', 'summary access'])('does not reveal saved values under %s', (mode) => {
  const restricted: StudentRecordDetails = {
    ...details,
    recordsAccess: mode === 'summary access' ? 'Summary' : 'Full',
    structuredSections: details.structuredSections.map((section) => ({
      ...section,
      isMasked: mode === 'masked sections',
    })),
  };
  expect(profileOverviewContacts(restricted).every((field) => field.value === 'Restricted')).toBe(
    true
  );
});

it('renders the approved overview with actual saved contacts and retains detail/history navigation', async () => {
  mswServer.use(
    http.get(profilePath, () =>
      HttpResponse.json({ data: { ...studentProfile, entrySource: 'LegacyOverride' } })
    ),
    http.get(profileDetailsPath, () => HttpResponse.json({ data: details }))
  );
  renderStudentProfile();
  expect(await screen.findByText('guardian@example.test')).toBeVisible();
  expect(screen.getByRole('region', { name: 'Academic context' })).toHaveTextContent(
    'Approved historical entry'
  );
  expect(screen.getByRole('region', { name: 'Student Details' })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Admission & Onboarding' })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Recent Changes' })).toBeVisible();
  expect(screen.getAllByText('Meera Patel')).toHaveLength(2);
  expect(screen.queryByText('student@example.test')).not.toBeInTheDocument();
  expect(
    screen.getByText('12 School Road, West Colony, Ahmedabad, Gujarat, 380015, India')
  ).toBeVisible();
  expect(screen.getAllByText('GR number')).toHaveLength(1);
  expect(screen.getAllByText('Roll number')).toHaveLength(1);
  expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute(
    'href',
    '/student/profile?view=history'
  );
  await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
  expect(await screen.findByText('No Registration form available')).toBeVisible();
});

it('keeps a missing source and absent contact values empty instead of inventing historical or family data', async () => {
  mswServer.use(http.get(profilePath, () => HttpResponse.json({ data: studentProfile })));
  renderStudentProfile();
  await screen.findByText('Aanya Patel');
  expect(screen.queryByText('Historical record')).not.toBeInTheDocument();
  expect(screen.getByText('Not linked')).toBeVisible();
  expect(screen.getByText('No linked journey available.')).toBeVisible();
  expect(screen.queryByText('Meera Patel')).not.toBeInTheDocument();
});

it('keeps the saved academic context in the identity header across profile tabs', async () => {
  mswServer.use(
    http.get(profilePath, () =>
      HttpResponse.json({
        data: {
          ...studentProfile,
          academicYearId: 'previous-year',
          enrollmentHistory: [
            {
              id: 'enrollment-1',
              academicYearId: 'previous-year',
              academicYearName: '2025–2026',
              isActive: false,
            },
          ],
        },
      })
    )
  );
  renderStudentProfile();
  const context = await screen.findByRole('region', { name: 'Academic context' });
  expect(context).toHaveTextContent('2025–2026');
  expect(context.closest('[role="tabpanel"]')).toBeNull();
  expect(screen.getAllByText('Academic year')).toHaveLength(1);
  await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
  expect(await screen.findByText('No Registration form available')).toBeVisible();
  expect(screen.getByRole('region', { name: 'Academic context' })).toHaveTextContent('2025–2026');
});

it.each([
  ['Students.Admissions.Applications.View', 'View Admission'],
  ['Students.Onboarding.View', 'Continue Onboarding'],
])('retains the separately authorized journey action for %s', async (permission, action) => {
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
              credentialsStatus: 'Failed',
            },
          ],
        },
      })
    )
  );
  renderStudentProfile(profileStudentId, ['Students.Records.StudentList.View', permission]);
  const activity = await screen.findByRole('region', { name: 'Admission & Onboarding' });
  expect(within(activity).getByRole('link', { name: action })).toHaveAttribute(
    'href',
    expect.stringContaining(permission.includes('Onboarding') ? 'case=case-1' : 'application-1')
  );
  expect(
    within(activity).queryByRole('link', {
      name: action === 'View Admission' ? 'Continue Onboarding' : 'View Admission',
    })
  ).not.toBeInTheDocument();
  expect(within(activity).getByText('Failed')).toBeVisible();
  expect(within(activity).getAllByText('APP-001')).toHaveLength(1);
});

it('keeps the profile context and shows a contact skeleton while saved details are loading', async () => {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, async () => {
      await delay(250);
      return HttpResponse.json({ data: details });
    })
  );
  renderStudentProfile();
  expect(await screen.findByLabelText('Loading parents and contact details')).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Overview' })).toBeVisible();
  expect(await screen.findByText('guardian@example.test')).toBeVisible();
});

it('reports a failed contact read through the standard toast and recovers on normal profile reload', async () => {
  let reads = 0;
  const toast = vi.spyOn(shikshaMitraToast, 'error');
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
        : HttpResponse.json({ data: details });
    })
  );
  const profile = renderStudentProfile();
  try {
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Student details could not be loaded. Your profile context has been kept.',
        })
      )
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeVisible();
    expect(screen.getByText('Aanya Patel')).toBeVisible();
    expect(
      screen.queryByText(/Parents and contact details could not be loaded/)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry details' })).not.toBeInTheDocument();
    expect(screen.queryByText('guardian@example.test')).not.toBeInTheDocument();
    profile.unmount();
    renderStudentProfile();
    expect(await screen.findByText('guardian@example.test')).toBeVisible();
    expect(reads).toBe(2);
  } finally {
    toast.mockRestore();
  }
});

it('retains the restricted history message without a false empty state or a history API request', async () => {
  mswServer.use(http.get(profilePath, () => HttpResponse.json({ data: studentProfile })));
  renderStudentProfile();
  await screen.findByText('Aanya Patel');
  const activity = screen.getByRole('region', { name: 'Recent Changes' });
  expect(
    within(activity).getByText('Record change history is not available with your current access.')
  ).toBeVisible();
  expect(within(activity).queryByText('No record changes are available.')).not.toBeInTheDocument();
});

it('reports overview history failures once through the Student toast without an inline error or empty state', async () => {
  const toast = vi.spyOn(shikshaMitraToast, 'error');
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get('*/api/students/records/changes', () =>
      HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
    )
  );
  try {
    renderStudentProfile(profileStudentId, [
      'Students.Records.StudentList.View',
      'Students.Records.Changes.View',
    ]);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Record change history could not be loaded.' })
      )
    );
    const recent = screen.getByRole('region', { name: 'Recent Changes' });
    expect(
      within(recent).queryByText('Recent changes could not be loaded.')
    ).not.toBeInTheDocument();
    expect(within(recent).queryByText('No record changes are available.')).not.toBeInTheDocument();
    expect(within(recent).queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  } finally {
    toast.mockRestore();
  }
});
