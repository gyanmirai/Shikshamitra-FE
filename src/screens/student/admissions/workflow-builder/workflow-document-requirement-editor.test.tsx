import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
} from 'src/redux/student/admissions/admission-document-policy';

import { renderDocumentEditor, chooseDocumentOption } from './document-editor-test-fixture';

const setupDocumentEditor = async (...args: Parameters<typeof renderDocumentEditor>) => ({
  ...(await renderDocumentEditor(...args)),
  user: userEvent.setup(),
});

vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => true }));

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
['close', 'content-save-outline', 'file-check-outline', 'information-outline'].forEach((name) => {
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

describe('compact document requirement editor', { timeout: 15000 }, () => {
  it('opens standard documents in the same popover and preserves preset references through editing', async () => {
    const { user, onSave } = await setupDocumentEditor();
    await chooseDocumentOption(user, 'Add a standard document', 'Birth certificate');
    const requirementDialog = screen.getByRole('dialog', {
      name: 'Configure document requirement',
    });
    expect(requirementDialog.closest('.MuiPopover-root')).toBeInTheDocument();
    const dialog = within(requirementDialog);
    expect(dialog.getByRole('textbox', { name: 'Document name *' })).toHaveValue(
      'Birth certificate'
    );
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    await user.click(await screen.findByRole('button', { name: 'Edit Birth certificate' }));
    const editor = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
    await user.type(editor.getByRole('textbox', { name: 'Instructions (optional)' }), 'Clear scan');
    await user.click(editor.getByRole('button', { name: 'Save requirement' }));
    await user.click(await screen.findByRole('button', { name: 'Remove Birth certificate' }));
    const confirmation = within(
      screen.getByRole('dialog', { name: 'Remove document requirement?' })
    );
    await user.click(confirmation.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Clear scan')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification.requirements
    ).toMatchObject([
      { code: 'BIRTH_CERTIFICATE', name: 'Birth certificate', description: 'Clear scan' },
    ]);
  });
  it('selects classes without a form answer and preserves them when saving the stage', async () => {
    const id = '10101010-1010-e010-b010-101010101010';
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/document-verification/classes', () =>
        HttpResponse.json([{ id, name: 'Class 10', context: 'CBSE / English / Secondary' }])
      )
    );
    const { user, onSave } = await setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Edit Birth certificate' }));
    await chooseDocumentOption(user, 'Applies to classes', 'Selected classes');
    const dialog = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    expect(
      await dialog.findByText('Select at least one class, or choose all classes')
    ).toBeInTheDocument();
    await user.click(await dialog.findByRole('combobox', { name: 'Classes' }));
    await user.click(await screen.findByRole('option', { name: /Class 10/ }));
    await user.keyboard('{Escape}');
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure document requirement' })
      ).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification.requirements[0]
        .standardIds
    ).toEqual([id]);
  });
  it('creates two custom requirements with server-generated references and optional/required toggles', async () => {
    const { user, onSave } = await setupDocumentEditor();
    const addRequirement = async (name: string) => {
      await user.click(screen.getByRole('button', { name: 'Add custom document' }));
      const dialog = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
      expect(
        screen
          .getByRole('dialog', { name: 'Configure document requirement' })
          .closest('.MuiPopover-root')
      ).toBeInTheDocument();
      expect(dialog.getByRole('button', { name: 'Save requirement' })).toHaveClass(
        'MuiButton-sizeSmall'
      );
      expect(dialog.queryByRole('textbox', { name: 'Document code *' })).not.toBeInTheDocument();
      expect(
        dialog.queryByRole('combobox', { name: 'Evidence to collect' })
      ).not.toBeInTheDocument();
      expect(
        dialog.getByRole('combobox', { name: 'Student document category (optional)' })
      ).toBeInTheDocument();
      expect(
        dialog.getByRole('button', { name: 'Student document category information' })
      ).toBeInTheDocument();
      await user.type(dialog.getByRole('textbox', { name: 'Document name *' }), name);
      if (name === 'Address evidence')
        await user.click(dialog.getByRole('switch', { name: 'Required document' }));
      await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Configure document requirement' })
        ).not.toBeInTheDocument()
      );
    };
    await addRequirement('Transfer proof');
    await addRequirement('Address evidence');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification.requirements
    ).toMatchObject([
      { code: '', name: 'Transfer proof', requirement: 'required', collectionMode: 'upload' },
      { code: '', name: 'Address evidence', requirement: 'optional', collectionMode: 'upload' },
    ]);
  });
  it('uses a shared discard dialog and preserves unsaved values when cancellation is declined', async () => {
    const { user } = await setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Edit Birth certificate' }));
    const dialog = screen.getByRole('dialog', { name: 'Configure document requirement' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Instructions (optional)' }),
      'Bring a clear scan'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    const discard = screen.getByRole('dialog', { name: 'Discard document changes?' });
    await user.click(within(discard).getByRole('button', { name: 'Cancel' }));
    expect(within(dialog).getByRole('textbox', { name: 'Instructions (optional)' })).toHaveValue(
      'Bring a clear scan'
    );
  });
  it('validates custom requirement names before saving', async () => {
    const { user, onSave } = await setupDocumentEditor();
    await user.click(screen.getByRole('button', { name: 'Add custom document' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    expect(await dialog.findByText('Document name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
