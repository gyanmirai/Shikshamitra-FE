import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { FormPreviewContent } from './form-preview-content';

describe('embedded admission form preview', () => {
  it('validates from its own action without nesting a form inside the builder form', async () => {
    const user = userEvent.setup();
    const submitForm = vi.fn().mockResolvedValue(undefined);
    const formik = {
      values: {},
      errors: {},
      touched: {},
      submitForm,
      handleSubmit: vi.fn(),
    } as unknown as FormikProps<Record<string, string>>;
    const form = {
      id: 'preview',
      name: 'Application',
      code: 'APPLICATION',
      version: 1,
      status: 0,
      sectionCount: 0,
      layoutType: 0,
      fieldsPerRow: 4,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      sections: [],
    } as AdmissionForm;

    render(
      <form data-testid="builder-form">
        <FormPreviewContent form={form} formik={formik} resolvedOptions={{}} embedded />
      </form>
    );

    expect(screen.getByTestId('builder-form').querySelectorAll('form')).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Validate preview' }));
    expect(submitForm).toHaveBeenCalledOnce();
  });
});
