import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { http, HttpResponse, delay } from 'msw';
import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

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
    { label: 'Primary contact', value: '+91-9000012345' },
    { label: 'Primary guardian', value: 'Meera Patel' },
    { label: 'Guardian email', value: 'guardian@example.test' },
    { label: 'Address', value: '12 School Road, West Colony, Ahmedabad, Gujarat, 380015, India' },
  ]);
});

it('does not infer a guardian from father details or use the student email as a guardian email', () => {
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
  expect(profileOverviewContacts(withoutGuardian).slice(1, 3)).toEqual([
    { label: 'Primary guardian', value: undefined },
    { label: 'Guardian email', value: undefined },
  ]);
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
  expect(screen.getByRole('heading', { name: 'Record activity' })).toBeVisible();
  expect(screen.getByText('Meera Patel')).toBeVisible();
  expect(screen.queryByText('student@example.test')).not.toBeInTheDocument();
  expect(
    screen.getByText('12 School Road, West Colony, Ahmedabad, Gujarat, 380015, India')
  ).toBeVisible();
  expect(screen.getAllByText('GR number')).toHaveLength(1);
  expect(screen.getAllByText('Roll number')).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'View History' })).toHaveAttribute(
    'href',
    '/student/profile?view=history'
  );
  await userEvent.click(screen.getByRole('link', { name: 'View All Details' }));
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

it('keeps the profile context and shows a contact skeleton while saved details are loading', async () => {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, async () => {
      await delay(250);
      return HttpResponse.json({ data: details });
    })
  );
  renderStudentProfile();
  expect(await screen.findByLabelText('Loading guardian and contact details')).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Overview' })).toBeVisible();
  expect(await screen.findByText('guardian@example.test')).toBeVisible();
});

it('reports a failed contact read with the existing retry and recovers to the saved data', async () => {
  let reads = 0;
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
        : HttpResponse.json({ data: details });
    })
  );
  renderStudentProfile();
  const retry = await screen.findByRole('button', { name: 'Retry details' });
  expect(screen.getByText(/Guardian and contact details could not be loaded/)).toBeVisible();
  await userEvent.click(retry);
  expect(await screen.findByText('guardian@example.test')).toBeVisible();
});

it('retains the restricted history message without a false empty state or a history API request', async () => {
  mswServer.use(http.get(profilePath, () => HttpResponse.json({ data: studentProfile })));
  renderStudentProfile();
  await screen.findByText('Aanya Patel');
  const activity = screen.getByRole('heading', { name: 'Record activity' }).closest('section')!;
  expect(
    within(activity).getByText('Record change history is not available with your current access.')
  ).toBeVisible();
  expect(within(activity).queryByText('No record changes are available.')).not.toBeInTheDocument();
});
