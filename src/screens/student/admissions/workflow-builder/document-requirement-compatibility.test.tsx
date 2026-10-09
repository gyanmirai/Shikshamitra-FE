import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { createDocumentRequirement } from 'src/redux/student/admissions/admission-document-policy';

import { chooseDocumentOption } from './document-editor-test-fixture';
import { DocumentRequirementDialog } from './components/document-requirement-dialog';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
describe('document requirement validation', { timeout: 15000 }, () => {
  it('clears a saved condition only when staff explicitly choose required or optional', async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentRequirementDialog
        initial={{
          ...createDocumentRequirement('TRANSFER', 'Transfer certificate'),
          requirement: 'conditional',
          conditionJson: '{"field":"application.PREVIOUS_SCHOOL","operator":"IsEmpty"}',
        }}
        documentTypes={[]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    await user.click(screen.getByRole('switch', { name: 'Required document' }));
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0]).toMatchObject({
      requirement: 'required',
      conditionJson: undefined,
      collectionMode: 'upload',
    });
  });
  it('blocks incompatible categories and provides no original-inspection bypass', async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentRequirementDialog
        initial={createDocumentRequirement('TRANSFER', 'Transfer certificate')}
        documentTypes={[
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Word template',
            isRequired: false,
            allowedExtensions: ['docx'],
            maxFileSizeMb: 5,
          },
        ]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    await chooseDocumentOption(user, 'Student document category (optional)', 'Word template');
    expect(screen.getByText(/no format in common/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Evidence to collect' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    expect(save).not.toHaveBeenCalled();
    await chooseDocumentOption(
      user,
      'Student document category (optional)',
      'Keep as admission evidence'
    );
    await user.click(screen.getByRole('combobox', { name: 'Allowed file formats' }));
    await user.click(screen.getByRole('option', { name: 'PDF' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0]).toMatchObject({
      collectionMode: 'upload',
      allowedExtensions: ['pdf'],
    });
  });
});
