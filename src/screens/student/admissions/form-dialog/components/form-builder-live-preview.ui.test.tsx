import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

import { FormBuilderLivePreview } from './form-builder-live-preview';
import { newField, getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { renderDocumentUi } from '../../document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('allows applicants to enter the three builder-locked Inquiry defaults', async () => {
  const user = userEvent.setup();
  const draft = getBlankAdmissionFormInitialValues(0);
  draft.supportedLanguages = ['en', 'gu', 'hi'];
  const before = structuredClone(draft);
  renderDocumentUi(<FormBuilderLivePreview form={draft} />);
  const student = screen.getByRole('textbox', { name: /^Student name/ });
  const parent = screen.getByRole('textbox', { name: /^Parent\/Guardian name/ });
  const mobile = screen.getByRole('textbox', { name: /^Parent\/Guardian mobile/ });
  expect(student).toBeEnabled();
  expect(parent).toBeEnabled();
  expect(mobile).toBeEnabled();
  await user.type(student, 'QA Student');
  await user.type(parent, 'QA Parent');
  await user.type(mobile, '9876543210');
  expect(student).toHaveValue('QA Student');
  expect(parent).toHaveValue('QA Parent');
  expect((mobile as HTMLInputElement).value.replace(/\D/g, '')).toContain('9876543210');
  await user.click(screen.getByRole('combobox', { name: 'Form language' }));
  await user.click(screen.getByRole('option', { name: 'Gujarati' }));
  expect(screen.getByRole('textbox', { name: /^વિદ્યાર્થીનું નામ/ })).toHaveValue('QA Student');
  expect(screen.getByRole('textbox', { name: /^માતા-પિતા\/વાલીનું નામ/ })).toHaveValue('QA Parent');
  await user.click(screen.getByRole('combobox', { name: 'Form language' }));
  await user.click(screen.getByRole('option', { name: 'Hindi' }));
  expect(screen.getByRole('textbox', { name: /^विद्यार्थी का नाम/ })).toHaveValue('QA Student');
  expect(screen.getByRole('textbox', { name: /^माता-पिता\/अभिभावक का नाम/ })).toHaveValue(
    'QA Parent'
  );
  expect(draft).toEqual(before);
});

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

it('switches English, Gujarati, and Hindi field copy without section translations or losing answers', async () => {
  const user = userEvent.setup();
  const draft = getBlankAdmissionFormInitialValues();
  draft.name = 'Multilingual inquiry';
  draft.supportedLanguages = ['en', 'gu', 'hi'];
  const section = draft.sections[0];
  section.name = 'Student details';
  section.fields = [
    {
      ...newField(section.id!, 0, 0),
      label: 'Student name',
      placeholder: 'Enter student name',
      required: false,
      translations: {
        gu: {
          label: 'વિદ્યાર્થીનું નામ',
          placeholder: 'વિદ્યાર્થીનું નામ લખો',
          helpText: 'પૂર્ણ નામ લખો',
        },
        hi: {
          label: 'विद्यार्थी का नाम',
          placeholder: 'विद्यार्थी का नाम लिखें',
          helpText: 'पूरा नाम लिखें',
        },
      },
    },
    { ...newField(section.id!, 0, 1), label: 'Untranslated field', required: false },
  ];
  const before = structuredClone(draft);
  renderDocumentUi(<FormBuilderLivePreview form={draft} />);
  await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'QA student');

  const checkLanguage = async (
    language: string,
    label: string,
    placeholder: string,
    help: string
  ) => {
    await user.click(screen.getByRole('combobox', { name: 'Form language' }));
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: language }));
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('QA student');
    expect(screen.getByRole('textbox', { name: label })).toHaveAttribute(
      'placeholder',
      placeholder
    );
    if (help) expect(screen.getByText(help)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Student details' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Untranslated field' })).toBeVisible();
  };
  await checkLanguage('Gujarati', 'વિદ્યાર્થીનું નામ', 'વિદ્યાર્થીનું નામ લખો', 'પૂર્ણ નામ લખો');
  await checkLanguage('Hindi', 'विद्यार्थी का नाम', 'विद्यार्थी का नाम लिखें', 'पूरा नाम लिखें');
  await checkLanguage('English', 'Student name', 'Enter student name', '');
  expect(draft).toEqual(before);
});
