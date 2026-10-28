import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, screen, within, waitFor } from '@testing-library/react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  documentPath,
  documentSummary,
  documentEvidence,
} from 'src/redux/student/admissions/document-test-fixture';

import { renderDocumentUi } from './document-ui-test-fixture';
import { DocumentActionDialog } from './document-action-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
it('retains reviewer notes after a conflict and preserves the underlying dirty application on discard', async () => {
  mswServer.use(
    http.post(`${documentPath}/evidence/evidence-1/review`, () =>
      HttpResponse.json(
        { detail: 'The application changed. Reopen this document before reviewing it.' },
        { status: 409 }
      )
    )
  );
  const close = vi.fn();
  const store = renderDocumentUi(
    <DocumentActionDialog
      action="reject"
      summary={documentSummary}
      requirement={{ ...documentSummary.requirements[0], evidence: [documentEvidence] }}
      onClose={close}
    />
  );
  act(() => {
    store.dispatch(setIsChanges(true));
  });
  const dialog = within(screen.getByRole('dialog'));
  await userEvent.type(dialog.getByLabelText(/^Rejection reason/), 'Replace the blurred scan');
  await userEvent.click(dialog.getByRole('button', { name: 'Request replacement' }));
  expect(
    await dialog.findByText('The application changed. Reopen this document before reviewing it.')
  ).toBeInTheDocument();
  expect(dialog.getByLabelText(/^Rejection reason/)).toHaveValue('Replace the blurred scan');
  expect(close).not.toHaveBeenCalled();
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true)
  );
  await waitFor(() => expect(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled());
  await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledOnce();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
}, 15000);
