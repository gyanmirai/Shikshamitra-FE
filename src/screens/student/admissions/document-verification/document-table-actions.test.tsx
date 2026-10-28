import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  documentSummary,
  documentEvidence,
} from 'src/redux/student/admissions/document-test-fixture';

import { renderDocumentUi } from './document-ui-test-fixture';
import { DocumentTableActions } from './document-table-actions';

const permissions = {
  view: true,
  upload: true,
  original: true,
  review: true,
  waive: true,
  download: true,
};

describe('DocumentTableActions', () => {
  it('opens upload directly and leaves missing evidence View unavailable', async () => {
    const onAction = vi.fn();
    const onView = vi.fn();
    renderDocumentUi(
      <DocumentTableActions
        requirement={documentSummary.requirements[0]}
        permissions={permissions}
        onAction={onAction}
        onView={onView}
      />
    );
    expect(
      screen.getByRole('button', { name: 'View document for Birth certificate' })
    ).toBeDisabled();
    const upload = screen.getByRole('button', { name: 'Upload document for Birth certificate' });
    expect(upload).toHaveTextContent('');
    await userEvent.click(upload);
    expect(onAction).toHaveBeenCalledExactlyOnceWith('upload');
    expect(onView).not.toHaveBeenCalled();
  });

  it('keeps original and waiver collection available from missing-evidence overflow', async () => {
    const onAction = vi.fn();
    renderDocumentUi(
      <DocumentTableActions
        requirement={{ ...documentSummary.requirements[0], canRecordOriginal: true }}
        permissions={permissions}
        allowWaivers
        onAction={onAction}
        onView={vi.fn()}
      />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    expect(screen.getByRole('menuitem', { name: 'Waive requirement' })).toBeEnabled();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Record physical original' }));
    expect(onAction).toHaveBeenCalledExactlyOnceWith('original');
  });

  it('keeps viewing an uploaded file available while upload is temporarily locked', async () => {
    const onView = vi.fn();
    renderDocumentUi(
      <DocumentTableActions
        requirement={{ ...documentSummary.requirements[0], evidence: [documentEvidence] }}
        permissions={permissions}
        disabled
        onAction={vi.fn()}
        onView={onView}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Upload replacement for Birth certificate' })
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'View document for Birth certificate' })
    );
    expect(onView).toHaveBeenCalledOnce();
  });

  it.each([
    ['historical', { readOnly: true }, permissions],
    ['no upload permission', {}, { ...permissions, upload: false }],
    ['no View permission', {}, { ...permissions, view: false }],
  ])('does not offer upload when %s', (_, props, currentPermissions) => {
    renderDocumentUi(
      <DocumentTableActions
        requirement={documentSummary.requirements[0]}
        permissions={currentPermissions}
        onAction={vi.fn()}
        onView={vi.fn()}
        {...props}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Upload document for Birth certificate' })
    ).not.toBeInTheDocument();
  });

  it('does not offer collection forbidden by the requirement or waiver policy', () => {
    renderDocumentUi(
      <DocumentTableActions
        requirement={{
          ...documentSummary.requirements[0],
          canUpload: false,
          canRecordOriginal: false,
        }}
        permissions={permissions}
        allowWaivers={false}
        onAction={vi.fn()}
        onView={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /Upload|More actions/ })).not.toBeInTheDocument();
  });
});
