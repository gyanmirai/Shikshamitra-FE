import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { FormPreviewContent } from './form-preview-content';

describe('embedded admission form preview', () => {
  it('keeps all sections in a step visible and lets applicants return without losing values', async () => {
    const user = userEvent.setup();
    const formik = {
      values: {},
      errors: {},
      touched: {},
      submitForm: vi.fn(),
      handleSubmit: vi.fn(),
    } as unknown as FormikProps<Record<string, string>>;
    const form = {
      id: 'preview',
      name: 'Application',
      version: 1,
      layoutType: 1,
      fieldsPerRow: 2,
      sections: [
        {
          id: 'basic',
          code: 'BASIC',
          name: 'Basic details',
          stepId: 'personal',
          stepName: 'Personal information',
          stepDisplayOrder: 0,
          displayOrder: 0,
          fields: [],
        },
        {
          id: 'contact',
          code: 'CONTACT',
          name: 'Contact details',
          stepId: 'personal',
          stepName: 'Personal information',
          stepDisplayOrder: 0,
          displayOrder: 1,
          fields: [],
        },
        {
          id: 'health',
          code: 'HEALTH',
          name: 'Health details',
          stepId: 'medical',
          stepName: 'Medical information',
          stepDisplayOrder: 1,
          displayOrder: 2,
          fields: [],
        },
      ],
    } as unknown as AdmissionForm;
    render(<FormPreviewContent form={form} formik={formik} resolvedOptions={{}} embedded />);
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Health details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
  });

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
