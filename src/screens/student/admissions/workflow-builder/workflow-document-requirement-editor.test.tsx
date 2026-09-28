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

describe('document requirement editor', { timeout: 15000 }, () => {
  it('selects classes without a form answer and preserves them when saving the stage', async () => {
    const id = '10101010-1010-e010-b010-101010101010';
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/document-verification/classes', () =>
        HttpResponse.json([{ id, name: 'Class 10', context: 'CBSE / English / Secondary' }])
      )
    );
    const { user, onSave } = setupDocumentEditor(json());
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
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification.requirements[0]
        .standardIds
    ).toEqual([id]);
  });
  it('requires a comparison before saving a conditional document and preserves the chosen rule', async () => {
    const { user, onSave } = setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Edit Birth certificate' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
    await chooseDocumentOption(user, 'When is it required?', 'Required when conditions match');
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    expect(
      await dialog.findByText(
        'Choose an application, inquiry, or assessment field for the condition.'
      )
    ).toBeInTheDocument();
    await user.click(dialog.getByRole('combobox', { name: 'Applicant answer or fact' }));
    await user.paste('application.TRANSFER');
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    expect(
      await dialog.findByText('Enter a comparison value for the condition.')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await user.type(dialog.getByRole('textbox', { name: 'Comparison value' }), 'yes');
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure document requirement' })
      ).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const [item] = JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification
      .requirements;
    expect(item.requirement).toBe('conditional');
    expect(JSON.parse(item.conditionJson)).toEqual({
      field: 'application.TRANSFER',
      operator: 'Equals',
      value: 'yes',
    });
  });
  it('keeps an unsaved requirement open when cancellation is declined', async () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    const { user } = setupDocumentEditor(json());
    await user.click(screen.getByRole('button', { name: 'Edit Birth certificate' }));
    const dialog = screen.getByRole('dialog', { name: 'Configure document requirement' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Instructions (optional)' }),
      'Bring the original'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(dialog).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
  it('creates a conditional custom requirement collected as a physical original with one save', async () => {
    const { user, onSave } = setupDocumentEditor();
    await user.click(screen.getByRole('radio', { name: 'Collect and verify documents' }));
    await user.click(screen.getByRole('button', { name: 'Add custom document' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Configure document requirement' }));
    await user.click(dialog.getByRole('textbox', { name: 'Document name *' }));
    await user.paste('Transfer certificate');
    await chooseDocumentOption(user, 'When is it required?', 'Required when conditions match');
    await user.click(dialog.getByRole('combobox', { name: 'Applicant answer or fact' }));
    await user.paste('application.TRANSFER');
    await user.type(dialog.getByRole('textbox', { name: 'Comparison value' }), 'yes');
    await chooseDocumentOption(user, 'Evidence to collect', 'Inspect the physical original');
    await user.click(dialog.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure document requirement' })
      ).not.toBeInTheDocument()
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    const [item] = JSON.parse(onSave.mock.calls[0][0].configurationJson).documentVerification
      .requirements;
    expect(item).toMatchObject({
      code: 'DOCUMENT_1',
      name: 'Transfer certificate',
      requirement: 'conditional',
      collectionMode: 'original',
    });
    expect(JSON.parse(item.conditionJson)).toEqual({
      field: 'application.TRANSFER',
      operator: 'Equals',
      value: 'yes',
    });
  });
});
