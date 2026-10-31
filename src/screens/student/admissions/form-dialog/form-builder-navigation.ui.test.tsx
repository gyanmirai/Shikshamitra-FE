import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { FormBuilderSections } from './form-builder-sections';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({
    data: [{ key: 'Applicant.DateOfBirth', displayName: 'Date of birth', fieldType: 5 }],
    isLoading: false,
    isError: false,
  }),
  useGetAdmissionFormDataSourcesQuery: () => ({ data: [] }),
}));
vi.mock('./form-builder-palette', () => ({ FormBuilderPalette: () => null }));
vi.mock('./hooks/use-form-inheritance', () => ({ useFormInheritance: () => null }));
vi.mock('./components/form-builder-live-preview', () => ({
  FormBuilderLivePreview: () => <p>Applicant preview</p>,
}));

function renderRouting(error: 'section' | 'visibility' | 'type' | 'validation') {
  const values = getBlankAdmissionFormInitialValues(1);
  values.layoutType = 1;
  values.sections[0].fields = [newField(values.sections[0].id, 0)];
  const target = {
    ...newField('second-section', 1),
    label: 'Target question',
    visibilityRuleJson: error === 'visibility' ? '{broken' : undefined,
    validationJson: error === 'validation' ? '{broken' : undefined,
    ...(error === 'type' ? { bindingType: 0 as const, bindingKey: 'Applicant.DateOfBirth' } : {}),
  };
  values.sections.push({
    ...values.sections[0],
    id: 'second-section',
    code: 'SECOND',
    name: error === 'section' ? '' : 'Second section',
    stepId: 'second-step',
    stepCode: 'SECOND_STEP',
    stepName: 'Second step',
    stepDisplayOrder: 1,
    fields: [target],
  });
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik<CreateUpdateAdmissionForm>
        initialValues={values}
        initialErrors={{
          sections: [
            {},
            error === 'section'
              ? { name: 'Section heading is required' }
              : {
                  fields: [
                    error === 'type'
                      ? { fieldType: 'Field type is invalid' }
                      : error === 'validation'
                        ? { validationJson: 'Validation settings are invalid' }
                        : { visibilityRuleJson: 'Visibility rule is invalid' },
                  ],
                },
          ],
        }}
        initialTouched={{
          sections: [
            {},
            error === 'section'
              ? { name: true }
              : {
                  fields: [
                    error === 'type'
                      ? { fieldType: true }
                      : error === 'validation'
                        ? { validationJson: true }
                        : { visibilityRuleJson: true },
                  ],
                },
          ],
        }}
        onSubmit={() => undefined}
      >
        {(formik) => (
          <>
            <FormBuilderSections formik={formik} />
            <output data-testid="saved-form">{JSON.stringify(formik.values)}</output>
          </>
        )}
      </Formik>
    </ThemeProvider>
  );
  return target;
}

it('opens the exact inactive section heading when fixing an error from Preview on the mobile field panel', async () => {
  renderRouting('section');
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Student fields' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fix error' }));
  expect(screen.getByRole('tab', { name: 'Your form' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
  const heading = screen.getByRole('textbox', { name: 'Section heading' });
  expect(heading).toBeVisible();
  await waitFor(() => expect(heading).toHaveFocus());
});

it('opens Rules for an inactive field condition issue and focuses its actual repair control', async () => {
  const target = renderRouting('visibility');
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fix error' }));
  expect(screen.getByRole('tab', { name: 'Rules' })).toHaveAttribute('aria-selected', 'true');
  const rule = screen.getByRole('textbox', { name: 'Compatibility rule' });
  expect(rule).toBeVisible();
  await waitFor(() => expect(rule).toHaveFocus());
  expect(JSON.parse(screen.getByTestId('saved-form').textContent!).sections[1].fields[0]).toEqual(
    target
  );
});

it('focuses the existing Restore action for a mismatched linked field type without changing its value', async () => {
  const target = renderRouting('type');
  fireEvent.click(screen.getByRole('button', { name: 'Fix error' }));
  const restore = screen.getByRole('button', { name: 'Restore Date' });
  expect(restore).toBeVisible();
  await waitFor(() => expect(restore).toHaveFocus());
  expect(JSON.parse(screen.getByTestId('saved-form').textContent!).sections[1].fields[0]).toEqual(
    target
  );
});

it('shows unsupported saved-setting recovery inside the open question drawer', () => {
  const target = renderRouting('validation');
  fireEvent.click(screen.getByRole('button', { name: 'Review question' }));
  const drawer = screen.getByRole('button', { name: 'Done' }).closest('.MuiDrawer-paper');
  expect(drawer).not.toBeNull();
  expect(
    within(drawer as HTMLElement).getByText(
      /This question has saved settings that cannot be edited here/
    )
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  expect(JSON.parse(screen.getByTestId('saved-form').textContent!).sections[1].fields[0]).toEqual(
    target
  );
});
