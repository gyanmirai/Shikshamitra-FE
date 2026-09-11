import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { chooseDocumentOption } from './document-editor-test-fixture';
import { conditionFormList } from './document-condition-test-fixture';
import { familyConditionForm } from './condition-field-label-test-fixture';
import { getTypedConditionFields } from './components/admission-condition-fields';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { DocumentConditionFormPicker } from './components/document-condition-form-picker';
import { AdmissionConditionFormPicker } from './components/admission-condition-form-picker';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function Picker({ mode, source }: { mode: string; source: 'application' | 'inquiry' }) {
  const [json, setJson] = useState('{"field":"","operator":"Equals","value":"yes"}');
  return (
    <>
      {mode === 'document' ? (
        <DocumentConditionFormPicker forms={conditionFormList} json={json} onChange={setJson} />
      ) : (
        <AdmissionConditionFormPicker
          forms={conditionFormList}
          source={source}
          strictTypes
          json={json}
          onChange={setJson}
        />
      )}
      <output>{json}</output>
    </>
  );
}

describe('contextual applicant answer choices', { timeout: 15000 }, () => {
  it.each([
    ['eligibility', 'application'],
    ['eligibility', 'inquiry'],
    ['document', 'application'],
    ['document', 'inquiry'],
  ] as const)(
    'selects the correct father field in %s / %s without changing the comparison',
    async (mode, source) => {
      mswServer.use(
        http.get('*/api/student/enrollment/admissions/forms/form-a', () =>
          HttpResponse.json(familyConditionForm)
        )
      );
      const user = userEvent.setup();
      renderDocumentUi(<Picker mode={mode} source={source} />);
      if (mode === 'document' && source === 'inquiry')
        await chooseDocumentOption(user, 'Answer source', 'Inquiry answer');
      await chooseDocumentOption(user, 'Published form for answer choices', 'Registration · v2');
      const field = screen.getByRole('combobox', { name: 'Applicant answer or fact' });
      await waitFor(() => expect(field).toBeEnabled());
      await user.click(field);
      const label = mode === 'document' ? 'Full Name (Registration)' : 'Full Name';
      await waitFor(() => {
        ['Student', 'Father', 'Mother'].forEach((person) => {
          expect(
            screen.getByRole('option', { name: `${label} — ${person} / Identity` })
          ).toBeInTheDocument();
        });
      });
      const uniqueLabel =
        mode === 'document' ? 'Previous school (Registration)' : 'Previous school';
      expect(screen.getByRole('option', { name: uniqueLabel })).toBeInTheDocument();
      await user.click(screen.getByRole('option', { name: `${label} — Father / Identity` }));
      expect(JSON.parse(screen.getByRole('status').textContent ?? '')).toEqual({
        field: source === 'application' ? 'application.FATHER_NAME' : 'inquiry.father.fullName',
        operator: 'Equals',
        value: 'yes',
      });
      expect(field).toHaveValue(`${label} — Father / Identity`);
    }
  );

  it('uses stable field codes when repeated fields have no section or step names', () => {
    const form = {
      ...familyConditionForm,
      sections: familyConditionForm.sections.map((section) => ({
        ...section,
        name: '',
        stepName: null,
      })),
    };
    expect(
      getTypedConditionFields(form, 'application').filter((field) =>
        field.label.startsWith('Full Name')
      )
    ).toEqual([
      { value: 'application.STUDENT_NAME', label: 'Full Name — STUDENT_NAME', fieldType: 0 },
      { value: 'application.FATHER_NAME', label: 'Full Name — FATHER_NAME', fieldType: 0 },
      { value: 'application.MOTHER_NAME', label: 'Full Name — MOTHER_NAME', fieldType: 0 },
    ]);
  });

  it('disambiguates repeated section names without modifying condition keys or unique labels', () => {
    const form = {
      ...familyConditionForm,
      sections: familyConditionForm.sections.map((section) => ({ ...section, stepName: null })),
    };
    const options = getTypedConditionFields(form, 'inquiry');
    expect(options.find((field) => field.value === 'inquiry.father.fullName')?.label).toBe(
      'Full Name — Identity [FATHER_NAME]'
    );
    expect(new Set(options.map((field) => field.label)).size).toBe(options.length);
    expect(options.find((field) => field.value === 'inquiry.student.previousSchool')?.label).toBe(
      'Previous school'
    );
  });
});
