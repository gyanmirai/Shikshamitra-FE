import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormBuilderLivePreview } from './form-builder-live-preview';
import { newField, getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { renderDocumentUi } from '../../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('renders an editable preview without scenarios or validation actions and never submits its builder', async () => {
  const user = userEvent.setup();
  const draft = getBlankAdmissionFormInitialValues();
  draft.name = 'Registration preview';
  const section = draft.sections[0];
  section.fields = [{ ...newField(section.id!, 0, 0), label: 'Student name', required: false }];
  const before = structuredClone(draft);
  const submit = vi.fn((event) => event.preventDefault());
  renderDocumentUi(
    <form onSubmit={submit}>
      <FormBuilderLivePreview form={draft} />
    </form>
  );
  expect(screen.queryByRole('combobox', { name: 'Test scenario' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Validate preview' })).not.toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: 'Student name' });
  await user.type(input, 'Preview student');
  await user.keyboard('{Enter}');
  expect(input).toHaveValue('Preview student');
  expect(submit).not.toHaveBeenCalled();
  expect(draft).toEqual(before);
});
