import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
} from 'src/redux/student/admissions/admission-document-policy';

import { renderDocumentEditor, chooseDocumentOption } from './document-editor-test-fixture';

const setupDocumentEditor = (...args: Parameters<typeof renderDocumentEditor>) => ({
  ...renderDocumentEditor(...args),
  user: userEvent.setup(),
});

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

describe('document verification stage editor', { timeout: 15000 }, () => {
  it('preserves basic completion and unrelated settings when saving stage details', async () => {
    const original = '{"extension":{"source":"existing"}}';
    const { user, onSave } = setupDocumentEditor(original);
    expect(
      screen.getByRole('radio', { name: 'Basic completion (existing process)' })
    ).toBeChecked();
    await user.type(
      screen.getByRole('textbox', { name: 'Staff instructions' }),
      'Review originals at reception'
    );
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ configurationJson: original }))
    );
  });
  it('adds a standard requirement, enables independent review, and saves the stage only after the requirement', async () => {
    const { user, onSave } = setupDocumentEditor('{"extension":{"source":"existing"}}');
    await user.click(screen.getByRole('radio', { name: 'Collect and verify documents' }));
    await chooseDocumentOption(user, 'Add a standard document', 'Birth certificate');
    const dialog = screen.getByRole('dialog', { name: 'Configure document requirement' });
    await user.click(within(dialog).getByRole('button', { name: 'Save requirement' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure document requirement' })
      ).not.toBeInTheDocument()
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('switch', { name: 'Require a different staff member to review' })
    );
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      extension: { source: 'existing' },
      documentVerification: {
        enabled: true,
        requireIndependentReview: true,
        requirements: [policy.requirements[0]],
      },
    });
  });
  it('blocks empty enabled checklists and preserves requirements when returning to basic completion', async () => {
    const { user, onSave } = setupDocumentEditor(json({ requirements: [] }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Add between 1 and 30 document requirements.')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Basic completion (existing process)' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification
    ).toMatchObject({ enabled: false, requirements: [] });
  });
  it('requires confirmation before removing a configured document', async () => {
    const { user } = setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Remove Birth certificate' }));
    const dialog = screen.getByRole('dialog', { name: 'Remove document requirement?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Birth certificate')).toBeInTheDocument();
  });
  it('prevents unsupported policy versions from being silently overwritten', async () => {
    const { user, onSave } = setupDocumentEditor(json({ version: 2 }));
    expect(screen.getByRole('radio', { name: 'Collect and verify documents' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    expect(onSave).not.toHaveBeenCalled();
  });
  it('keeps published settings read-only', () => {
    setupDocumentEditor(json(), true);
    expect(screen.getByRole('radio', { name: 'Collect and verify documents' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Edit Birth certificate' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save stage' })).not.toBeInTheDocument();
  });
  it('explains unavailable document features before enabling them', () => {
    setupDocumentEditor(undefined, false, false);
    expect(screen.getByText(/not available in this environment/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Collect and verify documents' })).toBeDisabled();
  });
});
