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
  it('shows file rules as individual facts for requirements that collect uploads', async () => {
    await setupDocumentEditor(
      json({
        requirements: [
          ...policy.requirements,
          {
            ...createDocumentRequirement('ORIGINAL', 'Original proof'),
            collectionMode: 'original',
            requirement: 'optional',
            allowedExtensions: ['pdf'],
            maxFileSizeMb: 5,
            standardIds: ['10101010-1010-e010-b010-101010101010'],
          },
        ],
      })
    );

    const [uploadCard, legacyCard] = within(
      screen.getByRole('list', { name: 'Selected Documents' })
    ).getAllByRole('listitem');
    const upload = within(uploadCard);
    expect(upload.getByText('Birth certificate')).toBeVisible();
    expect(upload.getByText('Required')).toBeVisible();
    expect(upload.getByText('File Upload')).toBeVisible();
    expect(upload.getByText('All Classes')).toBeVisible();
    expect(upload.getByText('PDF, JPG, JPEG, PNG')).toBeVisible();
    expect(upload.getByText('Max 10 MB')).toBeVisible();

    const legacy = within(legacyCard);
    expect(legacy.getByText('Optional')).toBeVisible();
    expect(legacy.getByText('File Upload')).toBeVisible();
    expect(legacy.getByText('1 selected class')).toBeVisible();
    expect(legacy.getByText('PDF')).toBeVisible();
    expect(legacy.getByText('Max 5 MB')).toBeVisible();
  });

  it('opens standard documents in the same popover and preserves preset references through editing', async () => {
    const { user, onSave } = await setupDocumentEditor();
    const addDocuments = within(screen.getByRole('group', { name: 'Add documents' }));
    expect(addDocuments.getByRole('button', { name: 'Add Custom Document' })).toBeEnabled();
    await user.click(addDocuments.getByRole('combobox', { name: 'Add a Standard Document' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Search Add a Standard Document' }),
      'birth'
    );
    expect(screen.queryByRole('option', { name: 'Address Proof' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Birth Certificate' }));
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    );
    const requirementDialog = screen.getByRole('dialog', {
      name: 'Configure Document Requirement',
    });
    expect(requirementDialog.closest('.MuiPopover-root')).toBeInTheDocument();
    const dialog = within(requirementDialog);
    expect(dialog.getByRole('button', { name: 'Document requirement information' })).toBeVisible();
    expect(dialog.getByRole('textbox', { name: 'Document Name *' })).toHaveValue(
      'Birth certificate'
    );
    await user.click(dialog.getByRole('button', { name: 'Submit' }));
    await user.click(await screen.findByRole('button', { name: 'Edit Birth certificate' }));
    const editor = within(screen.getByRole('dialog', { name: 'Configure Document Requirement' }));
    await user.type(editor.getByRole('textbox', { name: 'Instructions' }), 'Clear scan');
    await user.click(editor.getByRole('button', { name: 'Submit' }));
    await user.click(await screen.findByRole('button', { name: 'Remove Birth certificate' }));
    const confirmation = within(
      screen.getByRole('dialog', { name: 'Remove Document Requirement?' })
    );
    await user.click(confirmation.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Clear scan')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
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
        HttpResponse.json([
          { id, name: 'Class 10', context: '2026-2027 / CBSE / English / Secondary' },
        ])
      )
    );
    const { user, onSave } = await setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Edit Birth certificate' }));
    await chooseDocumentOption(user, 'Applies to Classes', 'Selected Classes');
    const dialog = within(screen.getByRole('dialog', { name: 'Configure Document Requirement' }));
    await user.click(dialog.getByRole('button', { name: 'Submit' }));
    expect(
      await dialog.findByText('Select at least one class, or choose all classes')
    ).toBeInTheDocument();
    await user.click(await dialog.findByRole('combobox', { name: 'Board' }));
    await user.click(await screen.findByRole('option', { name: 'CBSE' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(dialog.getByRole('combobox', { name: 'Classes' }));
    const picker = within(await screen.findByRole('dialog', { name: 'Select Classes' }));
    await user.type(picker.getByRole('textbox', { name: 'Search Classes' }), 'Class 10');
    await user.click(picker.getByRole('checkbox', { name: /Class 10/ }));
    await user.click(picker.getByRole('button', { name: 'Done' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Select Classes' })).not.toBeInTheDocument()
    );
    await user.click(dialog.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure Document Requirement' })
      ).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification.requirements[0]
        .standardIds
    ).toEqual([id]);
  });
  it('creates two custom requirements with server-generated references and optional/required toggles', async () => {
    const { user, onSave } = await setupDocumentEditor();
    const addRequirement = async (name: string) => {
      await user.click(screen.getByRole('button', { name: 'Add Custom Document' }));
      const dialog = within(screen.getByRole('dialog', { name: 'Configure Document Requirement' }));
      expect(
        screen
          .getByRole('dialog', { name: 'Configure Document Requirement' })
          .closest('.MuiPopover-root')
      ).toBeInTheDocument();
      expect(dialog.getByRole('button', { name: 'Submit' })).toHaveClass('MuiButton-sizeSmall');
      expect(dialog.queryByRole('textbox', { name: 'Document code *' })).not.toBeInTheDocument();
      expect(
        dialog.queryByRole('combobox', { name: 'Evidence to collect' })
      ).not.toBeInTheDocument();
      expect(
        dialog.getByRole('combobox', { name: 'Student Document Category' })
      ).toBeInTheDocument();
      expect(
        dialog.getByRole('button', { name: 'Student Document Category Information' })
      ).toBeInTheDocument();
      await user.type(dialog.getByRole('textbox', { name: 'Document Name *' }), name);
      if (name === 'Address evidence')
        await user.click(dialog.getByRole('switch', { name: 'Required document' }));
      await user.click(dialog.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Configure Document Requirement' })
        ).not.toBeInTheDocument()
      );
    };
    await addRequirement('Transfer proof');
    await addRequirement('Address evidence');
    await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
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
    const dialog = screen.getByRole('dialog', { name: 'Configure Document Requirement' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Instructions' }),
      'Bring a clear scan'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    const discard = screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
    await user.click(within(discard).getByRole('button', { name: 'Keep editing' }));
    expect(within(dialog).getByRole('textbox', { name: 'Instructions' })).toHaveValue(
      'Bring a clear scan'
    );
  });
  it('validates custom requirement names before saving', async () => {
    const { user, onSave } = await setupDocumentEditor();
    await user.click(screen.getByRole('button', { name: 'Add Custom Document' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Configure Document Requirement' }));
    await user.click(dialog.getByRole('button', { name: 'Submit' }));
    expect(await dialog.findByText('Document name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
