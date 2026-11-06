import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { Button } from '@mui/material';
import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useState, useCallback } from 'react';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, cleanup, waitFor } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

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
    expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).toBeEnabled()
  );
  await user.click(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' }));
  await user.click(screen.getByRole('option', { name: 'Counsellor One' }));
  await user.click(screen.getByRole('button', { name: 'Assign Owner' }));
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
    screen.queryByRole('combobox', { name: 'Change Journey Counsellor' })
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
    screen.queryByRole('combobox', { name: 'Change Journey Counsellor' })
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Change Counsellor' }));

  expect(screen.getByRole('combobox', { name: 'Change Journey Counsellor' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Reason for Change (Optional)' })).toBeInTheDocument();
});

it('uses compact ownership without repeating guidance and keeps the assignment form reachable', async () => {
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () =>
      HttpResponse.json({ data: [{ id: 'counsellor-1', name: 'Counsellor One' }] })
    )
  );
  renderDocumentUi(
    <ApplicationCounsellorCard
      compact
      application={{
        ...application,
        assignedCounsellorId: 'counsellor-1',
        assignedCounsellorName: 'Counsellor One',
      }}
    />,
    ['Students.Admissions.Applications.Add']
  );
  expect(screen.getByText('Counsellor One')).toBeVisible();
  expect(screen.getByText('Counsellor')).toBeVisible();
  expect(
    screen.queryByText(/The journey counsellor follows this application/)
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Change' }));
  expect(screen.getByRole('combobox', { name: 'Change Journey Counsellor' })).toBeVisible();
});

it('locks compact counsellor form controls while the workspace is busy', () => {
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () =>
      HttpResponse.json({ data: [] })
    )
  );
  renderDocumentUi(<ApplicationCounsellorCard compact disabled application={application} />, [
    'Students.Admissions.Applications.Add',
  ]);
  expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('textbox', { name: 'Reason for Change (Optional)' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Assign Owner' })).toBeDisabled();
});

it('reports a pending counsellor save and lets it finish while the workspace is locked', async () => {
  let finish: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const sent = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () =>
      HttpResponse.json({ data: [{ id: 'counsellor-1', name: 'Counsellor One' }] })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application-1/assign-counsellor',
      async () => {
        sent();
        await pending;
        return HttpResponse.json({
          data: { ...application, assignedCounsellorId: 'counsellor-1' },
        });
      }
    )
  );
  const onBusyChange = vi.fn();
  function Workspace() {
    const [busy, setBusy] = useState(false);
    const change = useCallback((value: boolean) => {
      onBusyChange(value);
      setBusy(value);
    }, []);
    return (
      <ApplicationCounsellorCard
        compact
        presentation="header"
        application={application}
        disabled={busy}
        onBusyChange={change}
      />
    );
  }
  renderDocumentUi(<Workspace />, ['Students.Admissions.Applications.Add']);
  const user = userEvent.setup();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  );
  await user.click(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' }));
  await user.click(screen.getByRole('option', { name: 'Counsellor One' }));
  await user.click(screen.getByRole('button', { name: 'Assign Owner' }));
  await waitFor(() => expect(sent).toHaveBeenCalledOnce());
  await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(true));
  expect(screen.getByRole('textbox', { name: 'Reason for Change (Optional)' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  finish();
  await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Assign Journey Counsellor' })).toBeEnabled();
  cleanup();
  expect(onBusyChange).toHaveBeenLastCalledWith(false);
});

it('shows header ownership for view-only users without loading edit options', () => {
  const getOptions = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () => {
      getOptions();
      return HttpResponse.json({ data: [] });
    })
  );
  renderDocumentUi(
    <ApplicationCounsellorCard
      presentation="header"
      application={{
        ...application,
        assignedCounsellorId: 'counsellor-1',
        assignedCounsellorName: 'Counsellor One',
      }}
    />,
    ['Students.Admissions.Applications.View']
  );
  expect(screen.getByText('Counsellor One')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(getOptions).not.toHaveBeenCalled();
});

it('reuses the header assignment dialog and permission guard through a custom menu action', async () => {
  const getOptions = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () => {
      getOptions();
      return HttpResponse.json({ data: [] });
    })
  );
  renderDocumentUi(
    <ApplicationCounsellorCard
      presentation="header"
      application={application}
      renderHeaderAction={({ canEdit, onEdit, busy }) => (
        <Button disabled={!canEdit || busy} onClick={onEdit}>
          Menu assignment
        </Button>
      )}
    />,
    ['Students.Admissions.Applications.Add']
  );
  expect(getOptions).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Menu assignment' }));
  expect(await screen.findByRole('dialog', { name: 'Assign Journey Counsellor' })).toBeVisible();
  await waitFor(() => expect(getOptions).toHaveBeenCalledOnce());
});

it('loads the scoped counsellor pool only when the header editor opens and reuses it on reopen', async () => {
  const getOptions = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', ({ request }) => {
      getOptions(new URL(request.url).searchParams.get('offeringId'));
      return HttpResponse.json({ data: [{ id: 'counsellor-1', name: 'Counsellor One' }] });
    })
  );
  const user = userEvent.setup();
  renderDocumentUi(<ApplicationCounsellorCard presentation="header" application={application} />, [
    'Students.Admissions.Applications.Add',
  ]);
  await user.tab();
  expect(getOptions).not.toHaveBeenCalled();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  );
  expect(getOptions).toHaveBeenCalledExactlyOnceWith('offering-1');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).not.toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(getOptions).toHaveBeenCalledTimes(1);
});

it('keeps entered header assignment values after a failed save and protects dirty cancellation', async () => {
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () =>
      HttpResponse.json({ data: [{ id: 'counsellor-1', name: 'Counsellor One' }] })
    ),
    http.post(
      '*/api/student/enrollment/admissions/applications/application-1/assign-counsellor',
      () =>
        HttpResponse.json({ detail: 'Refresh this application before assigning.' }, { status: 409 })
    )
  );
  const user = userEvent.setup();
  renderDocumentUi(<ApplicationCounsellorCard presentation="header" application={application} />, [
    'Students.Admissions.Applications.Add',
  ]);
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  );
  await user.click(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' }));
  await user.click(screen.getByRole('option', { name: 'Counsellor One' }));
  await user.type(
    screen.getByRole('textbox', { name: 'Reason for Change (Optional)' }),
    'Admission follow-through'
  );
  await user.click(screen.getByRole('button', { name: 'Assign Owner' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Assign Owner' })).toBeEnabled());
  expect(screen.getByRole('dialog', { name: 'Assign Journey Counsellor' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Reason for Change (Optional)' })).toHaveValue(
    'Admission follow-through'
  );
  const confirm = vi.fn().mockReturnValue(false);
  vi.stubGlobal('confirm', confirm);
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(confirm).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('dialog', { name: 'Assign Journey Counsellor' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('recovers header option-loading errors and explains an empty eligible list', async () => {
  let fail = true;
  const getOptions = vi.fn();
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/applications/counsellors', () => {
      getOptions();
      return fail
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
        : HttpResponse.json({ data: [] });
    })
  );
  const user = userEvent.setup();
  renderDocumentUi(<ApplicationCounsellorCard presentation="header" application={application} />, [
    'Students.Admissions.Applications.Add',
  ]);
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  await expectStudentErrorToast('Eligible counsellors could not be loaded.');
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Assign Journey Counsellor' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('button', { name: 'Assign Owner' })).toBeDisabled();
  fail = false;
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Assign Journey Counsellor' }));
  expect(
    await screen.findByText('No eligible counsellors are available for this offering.')
  ).toBeVisible();
  expect(getOptions).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'Assign Owner' })).toBeDisabled();
});
