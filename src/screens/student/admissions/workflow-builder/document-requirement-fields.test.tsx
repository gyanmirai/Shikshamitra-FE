import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { createDocumentRequirement } from 'src/redux/student/admissions/admission-document-policy';

import { chooseDocumentOption } from './document-editor-test-fixture';
import { DocumentRequirementDialog } from './components/document-requirement-dialog';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => true }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const category = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Identity document',
  isRequired: true,
  allowedExtensions: ['pdf', 'png'],
  maxFileSizeMb: 5,
};

describe('document requirement fields', { timeout: 15000 }, () => {
  it('keeps format selections readable without wrapping chips and saves the full selection', async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentRequirementDialog
        initial={createDocumentRequirement('IDENTITY', 'Identity')}
        documentTypes={[]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    const formats = screen.getByRole('combobox', { name: 'Allowed file formats' });
    expect(formats).toHaveTextContent('PDF, JPG, JPEG, PNG');
    expect(formats.querySelector('.MuiChip-root')).toBeNull();
    await user.click(formats);
    await user.click(screen.getByRole('option', { name: 'JPG' }));
    await user.keyboard('{Escape}');
    expect(formats).toHaveTextContent('PDF, JPEG, PNG');
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0].allowedExtensions).toEqual(['pdf', 'jpeg', 'png']);
  });

  it('selects categories inside the anchored popover and preserves mapping and category limits', async () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    const save = vi.fn();
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentRequirementDialog
        anchorEl={anchor}
        initial={createDocumentRequirement('IDENTITY', 'Identity')}
        documentTypes={[category]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    const dialog = screen.getByRole('dialog', { name: 'Configure document requirement' });
    expect(dialog.closest('.MuiPopover-root')).toBeInTheDocument();
    await chooseDocumentOption(user, 'Student document category (optional)', category.name);
    expect(within(dialog).getByRole('combobox', { name: 'Student document category (optional)' }))
      .toHaveTextContent(category.name);
    expect(within(dialog).getByRole('combobox', { name: 'Allowed file formats' }))
      .toHaveTextContent('PDF, PNG');
    await user.click(within(dialog).getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0]).toMatchObject({
      documentTypeId: category.id,
      allowedExtensions: ['pdf', 'png'],
      maxFileSizeMb: 5,
    });
    anchor.remove();
  });

  it('explains an empty category catalogue and keeps admission evidence available', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    renderDocumentUi(
      <DocumentRequirementDialog
        initial={createDocumentRequirement('IDENTITY', 'Identity')}
        documentTypes={[]}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Student document category (optional)' }));
    expect(screen.getByRole('option', { name: /No student document categories configured/ }))
      .toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('option', { name: 'Keep as admission evidence' }));
    await user.click(screen.getByRole('button', { name: 'Save requirement' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0].documentTypeId).toBeUndefined();
  });

  it('offers category retry inside the editor and preserves requirement values', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentRequirementDialog
        initial={createDocumentRequirement('IDENTITY', 'Identity')}
        documentTypes={[]}
        documentTypesError
        onRetryDocumentTypes={retry}
        existingCodes={[]}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByText(/Student document categories could not load/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Document name *' })).toHaveValue('Identity');
    expect(screen.getByRole('combobox', { name: 'Allowed file formats' }))
      .toHaveTextContent('PDF, JPG, JPEG, PNG');
  });
});
