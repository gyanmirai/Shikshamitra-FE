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
describe('document requirement compatibility', { timeout: 15000 }, () => {
  it.each(['Required for every applicant', 'Optional'])(
    'clears a condition when staff explicitly choose %s',
    async (choice) => {
      const save = vi.fn();
      const user = userEvent.setup();
      renderDocumentUi(
        <DocumentRequirementDialog
          initial={{
            ...createDocumentRequirement('TRANSFER', 'Transfer certificate'),
            requirement: 'conditional',
            conditionJson: '{"field":"application.PREVIOUS_SCHOOL","operator":"IsEmpty"}',
          }}
          forms={[]}
          documentTypes={[]}
          existingCodes={[]}
          onClose={vi.fn()}
          onSave={save}
        />
      );
      await chooseDocumentOption(user, 'When is it required?', choice);
      await user.click(screen.getByRole('button', { name: 'Save requirement' }));
      await waitFor(() => expect(save).toHaveBeenCalledOnce());
      expect(save.mock.calls[0][0].conditionJson).toBeUndefined();
    }
  );

  it('blocks incompatible upload mapping but allows switching to an original-only requirement', async () => {
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
        forms={[]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    await chooseDocumentOption(user, 'Student document category (optional)', 'Word template');
    expect(screen.getByText(/no format in common/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    expect(save).not.toHaveBeenCalled();
    await chooseDocumentOption(user, 'Evidence to collect', 'Inspect the physical original');
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0]).toMatchObject({
      collectionMode: 'original',
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    });
  });
});
