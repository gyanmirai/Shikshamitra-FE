import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { ApplicationCounsellorCard } from './application-counsellor-card';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

const application = {
  id: 'application-1',
  admissionOfferingId: 'offering-1',
  status: 6,
  concurrencyStamp: 'current-stamp',
  assignedCounsellorId: null,
  assignedCounsellorName: null,
} as AdmissionApplication;

it('saves a scoped counsellor assignment with the application concurrency stamp', async () => {
  const sent = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () =>
      HttpResponse.json({ data: [{ id: 'counsellor-1', name: 'Counsellor One', userName: 'one' }] })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application-1/assign-counsellor',
      async ({ request }) => {
        sent(await request.json());
        return HttpResponse.json({
          data: { ...application, assignedCounsellorId: 'counsellor-1' },
        });
      }
    )
  );
  const user = userEvent.setup();
  renderDocumentUi(<ApplicationCounsellorCard application={application} />, [
    'Students.Admissions.Applications.Add',
  ]);

  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Assign journey counsellor' })).toBeEnabled()
  );
  await user.click(screen.getByRole('combobox', { name: 'Assign journey counsellor' }));
  await user.click(screen.getByRole('option', { name: 'Counsellor One' }));
  await user.click(screen.getByRole('button', { name: 'Assign owner' }));
  await waitFor(() =>
    expect(sent).toHaveBeenCalledWith(
      expect.objectContaining({
        counsellorId: 'counsellor-1',
        concurrencyStamp: 'current-stamp',
      })
    )
  );
});

it('shows ownership without offering assignment controls to a view-only user', () => {
  renderDocumentUi(
    <ApplicationCounsellorCard
      application={{
        ...application,
        assignedCounsellorId: 'counsellor-1',
        assignedCounsellorName: 'Counsellor One',
      }}
    />,
    ['Students.Admissions.Applications.View']
  );

  expect(screen.getByText('Counsellor One')).toBeInTheDocument();
  expect(screen.getByText(/The journey counsellor follows this application/)).toBeInTheDocument();
  expect(
    screen.queryByRole('combobox', { name: 'Change journey counsellor' })
  ).not.toBeInTheDocument();
});

it('keeps an assigned counsellor compact until the user chooses to change it', async () => {
  const user = userEvent.setup();
  renderDocumentUi(
    <ApplicationCounsellorCard
      application={{
        ...application,
        assignedCounsellorId: 'counsellor-1',
        assignedCounsellorName: 'Counsellor One',
      }}
    />,
    ['Students.Admissions.Applications.Add']
  );

  expect(screen.getByText('Counsellor One')).toBeInTheDocument();
  expect(
    screen.queryByRole('combobox', { name: 'Change journey counsellor' })
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Change counsellor' }));

  expect(screen.getByRole('combobox', { name: 'Change journey counsellor' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Reason for change (optional)' })).toBeInTheDocument();
});
