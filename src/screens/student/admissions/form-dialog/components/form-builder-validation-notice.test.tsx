import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { FormBuilderValidationNotice } from './form-builder-validation-notice';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

it.each([
  { property: 'stepName', kind: 'step', action: 'Fix error' },
  { property: 'code', kind: 'section', action: 'Review section' },
  { property: 'stepVisibilityRuleJson', kind: 'step', action: 'Review step' },
])(
  'opens the actual $kind settings for a touched nested error',
  async ({ property, kind, action }) => {
    const form = getBlankAdmissionFormInitialValues();
    form.sections[0].stepId = 'later-step';
    const onSelectIssue = vi.fn();
    const onSelect = vi.fn();
    render(
      <Formik
        initialValues={form}
        initialErrors={{ sections: [{ [property]: 'Required setting' }] }}
        initialTouched={{ sections: [{ [property]: true }] }}
        onSubmit={() => undefined}
      >
        {(formik) => (
          <FormBuilderValidationNotice
            formik={formik}
            onSelect={onSelect}
            onSelectIssue={onSelectIssue}
          />
        )}
      </Formik>
    );
    await userEvent.setup().click(screen.getByRole('button', { name: action }));
    expect(onSelectIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        kind,
        sectionId: form.sections[0].id,
        stepId: 'later-step',
        settingPath: `sections[0].${property}`,
      })
    );
    expect(onSelect).not.toHaveBeenCalled();
  }
);
