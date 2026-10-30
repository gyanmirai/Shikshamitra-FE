import { addIcon } from '@iconify/react';
import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
} from 'src/redux/student/admissions/admission-document-policy';

import { renderDocumentEditor, chooseDocumentOption } from './document-editor-test-fixture';

const setupDocumentEditor = async (...args: Parameters<typeof renderDocumentEditor>) => ({
  ...(await renderDocumentEditor(...args)),
  user: userEvent.setup(),
});
afterEach(() => vi.restoreAllMocks());

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('@mui/icons-material', async () => {
  const [Info, Error, CheckCircle, WarningAmber, Close] = await Promise.all([
    import('@mui/icons-material/Info'),
    import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'),
    import('@mui/icons-material/WarningAmber'),
    import('@mui/icons-material/Close'),
  ]);
  return {
    Info: Info.default,
    Error: Error.default,
    CheckCircle: CheckCircle.default,
    WarningAmber: WarningAmber.default,
    Close: Close.default,
  };
});
['close', 'content-save-outline', 'file-check-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
addIcon('basil:cross-solid', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
const policy = {
  ...DEFAULT_DOCUMENT_POLICY,
  requirements: [createDocumentRequirement('BIRTH_CERTIFICATE', 'Birth certificate')],
};
const json = (change = {}) =>
  JSON.stringify({
    documentVerification: { ...policy, ...change },
    extension: { source: 'existing' },
  });

describe('single managed document checklist', { timeout: 15000 }, () => {
  it('adds a standard requirement and keeps retired review and waiver settings off', async () => {
    const { user, onSave } = await setupDocumentEditor('{"extension":{"source":"existing"}}');
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    await chooseDocumentOption(user, 'Add a standard document', 'Birth certificate');
    const dialog = screen.getByRole('dialog', { name: 'Configure document requirement' });
    await user.click(within(dialog).getByRole('button', { name: 'Save requirement' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure document requirement' })
      ).not.toBeInTheDocument()
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeEnabled();
    expect(
      screen.queryByRole('switch', { name: 'Require a different staff member to review' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      extension: { source: 'existing' },
      documentVerification: {
        enabled: true,
        requireIndependentReview: false,
        allowWaivers: false,
        collectionFormStageCode: null,
        requirements: [policy.requirements[0]],
      },
    });
  });
  it('requires at least one document and provides no manual completion bypass', async () => {
    const errorToast = vi.spyOn(shikshaMitraToast, 'error');
    const { onSave } = await setupDocumentEditor(json({ requirements: [] }));
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Apply changes' }).closest('form')!);
    expect(
      screen.getByText('Add at least one document before applying this stage.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Add between 1 and 30 document requirements.')
    ).not.toBeInTheDocument();
    expect(errorToast).not.toHaveBeenCalled();
    expect(screen.queryByRole('radio', { name: 'Complete manually' })).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('disables Apply again after removing the final document', async () => {
    const { user, onSave } = await setupDocumentEditor(json());
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Remove Birth certificate' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Remove document requirement?' })).getByRole(
        'button',
        { name: 'Remove requirement' }
      )
    );
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('requires confirmation before removing a document', async () => {
    const { user } = await setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Remove Birth certificate' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Remove document requirement?' })).getByRole(
        'button',
        { name: 'Cancel' }
      )
    );
    expect(screen.getByText('Birth certificate')).toBeInTheDocument();
  });
  it('retains the configured stage when the journey rejects applying it', async () => {
    const { user, onSave, onClose } = await setupDocumentEditor(json(), false, true, false);
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Birth certificate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeEnabled();
  });
  it('blocks unsupported policies without overwriting them', async () => {
    const { onSave } = await setupDocumentEditor(json({ version: 2 }));
    expect(screen.getByText(/unsupported or incomplete/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Apply changes' }).closest('form')!);
    expect(onSave).not.toHaveBeenCalled();
  });
  it('locks published settings and explains unavailable features', async () => {
    await setupDocumentEditor(json(), true);
    expect(
      screen.queryByRole('button', { name: 'Edit Birth certificate' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument();
    screen.getAllByRole('switch').forEach((option) => expect(option).toBeDisabled());
  });
});
