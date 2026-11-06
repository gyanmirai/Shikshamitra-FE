import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { act, screen, within, waitFor } from '@testing-library/react';

import { profileOverviewContacts } from './student-profile-overview-model';
import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileDetailsPath,
  renderStudentProfile,
  renderProfileToastAction,
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
  expect(screen.getByText('Date of birth').nextElementSibling).toHaveTextContent('01/04/2016');
  expect(screen.getByRole('region', { name: 'Academic context' })).toHaveTextContent(
    'Approved historical entry'
  );
  expect(screen.getByRole('heading', { name: 'Record Activity' })).toBeVisible();
  expect(screen.getAllByText('Meera Patel')).toHaveLength(2);
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

it('explains each saved overview section through keyboard-accessible help without changing student context', async () => {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () => HttpResponse.json({ data: details }))
  );
  renderStudentProfile();
  await screen.findByText('guardian@example.test');
  const overview = screen.getByRole('tab', { name: 'Overview' });
  const user = userEvent.setup();
  const sections = [
    ['Student Details', 'Saved date of birth, age and gender for this student.'],
    ['Parents & Contact', 'Saved parents, optional other guardian and the main school contact.'],
    ['Record Activity', 'Linked admission and onboarding milestones'],
    [
      'Admission & Onboarding',
      'Saved admission, enrollment activation and portal credential status',
    ],
    ['Recent Changes', 'The three most recent student record changes'],
  ] as const;
  await sections.reduce(async (previous, [title, explanation]) => {
    await previous;
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    const help = screen.getByRole('button', { name: `${title} information` });
    await user.keyboard('{Tab}');
    act(() => help.focus());
    expect(help).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(explanation);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  }, Promise.resolve());
  expect(screen.getByRole('tab', { name: 'Overview' })).toBe(overview);
  expect(screen.getByText('Date of birth').nextElementSibling).toHaveTextContent('01/04/2016');
  expect(screen.getByText('guardian@example.test')).toBeVisible();
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
  expect(await screen.findByLabelText('Loading parents and contact details')).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Overview' })).toBeVisible();
  expect(await screen.findByText('guardian@example.test')).toBeVisible();
});

it('reports a failed contact read through the standard toast and retries without replacing the current profile', async () => {
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
  renderStudentProfile();
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
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const notice = toast.mock.calls.findLast(
      ([options]) =>
        options.message ===
        'Student details could not be loaded. Your profile context has been kept.'
    )?.[0];
    const recovery = renderProfileToastAction(notice);
    await userEvent.click(
      within(recovery.container).getByRole('button', { name: 'Retry details' })
    );
    expect(await screen.findByText('guardian@example.test')).toBeVisible();
    expect(reads).toBe(2);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBe(overview);
  } finally {
    toast.mockRestore();
  }
});

it('retains the restricted history message without a false empty state or a history API request', async () => {
  mswServer.use(http.get(profilePath, () => HttpResponse.json({ data: studentProfile })));
  renderStudentProfile();
  await screen.findByText('Aanya Patel');
  const activity = screen.getByRole('heading', { name: 'Record Activity' }).closest('section')!;
  expect(
    within(activity).getByText('Record change history is not available with your current access.')
  ).toBeVisible();
  expect(within(activity).queryByText('No record changes are available.')).not.toBeInTheDocument();
});
