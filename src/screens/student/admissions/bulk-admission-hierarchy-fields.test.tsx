import type { ComponentProps } from 'react';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Formik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';
import { bulkOfferingSchema, bulkOfferingInitialValues } from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

const standards = [
  { id: 'class-1', name: 'Class 1', educationMediumStageId: 'primary' },
  { id: 'class-2', name: 'Class 2', educationMediumStageId: 'primary' },
  { id: 'class-9', name: 'Class 9', educationMediumStageId: 'secondary' },
] as Standards[];

const hierarchy = [
  {
    id: 'primary',
    boardId: 'board-1',
    boardName: 'CBSE',
    mediumId: 'medium-1',
    mediumName: 'English',
    label: 'Primary',
  },
  {
    id: 'secondary',
    boardId: 'board-1',
    boardName: 'CBSE',
    mediumId: 'medium-1',
    mediumName: 'English',
    label: 'Secondary',
  },
] as AcademicOrganizationOption[];

describe('bulk offering class fields', () => {
  const renderAvailability = (
    availability: Partial<ComponentProps<typeof BulkAdmissionHierarchyFields>>
  ) =>
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik
          initialValues={{ ...bulkOfferingInitialValues, boardId: 'board-1', mediumId: 'medium-1' }}
          onSubmit={() => undefined}
        >
          {(formik) => (
            <>
              <BulkAdmissionHierarchyFields
                formik={formik}
                hierarchy={hierarchy}
                standards={standards}
                loading={false}
                change={(updates) => formik.setValues({ ...formik.values, ...updates }, true)}
                {...availability}
              />
              <output data-testid="available-selection">
                {JSON.stringify(formik.values.standardIds)}
              </output>
            </>
          )}
        </Formik>
      </ThemeProvider>
    );

  it('keeps configured classes visible but disabled and selects only remaining classes', async () => {
    const user = userEvent.setup();
    renderAvailability({ configuredClassIds: ['class-1'] });
    await user.click(screen.getByRole('combobox', { name: 'Class *' }));
    const configured = screen.getByRole('option', { name: 'Class 1 Offering already exists' });
    expect(configured).toHaveAttribute('aria-disabled', 'true');
    await expect(user.click(configured)).rejects.toThrow('pointer-events: none');
    expect(screen.getByTestId('available-selection')).toHaveTextContent('[]');
    const remaining = screen.getByRole('option', { name: 'Class 2' });
    expect(remaining).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(remaining);
    await waitFor(() =>
      expect(screen.getByTestId('available-selection')).toHaveTextContent('["class-2"]')
    );
  });

  it('explains when every class is configured without hiding those options', async () => {
    const user = userEvent.setup();
    renderAvailability({ configuredClassIds: standards.map((item) => item.id) });
    expect(
      screen.getByText('All classes already have General offerings for this admission cycle.')
    ).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Class *' }));
    expect(screen.getAllByRole('option')).toHaveLength(3);
    screen
      .getAllByRole('option')
      .forEach((option) => expect(option).toHaveAttribute('aria-disabled', 'true'));
  });

  it('blocks selection while checking offerings and exposes a field-level retry on failure', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    const view = renderAvailability({ classesLoading: true });
    expect(screen.getByRole('combobox', { name: 'Class *' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('Checking existing offerings…')).toBeVisible();
    view.unmount();
    renderAvailability({ classesError: true, retryClasses: retry });
    expect(screen.getByRole('combobox', { name: 'Class *' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(
      screen.getByText('Offering classes could not be checked. Retry to select classes.')
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry class check' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('validates a medium selection and its class reset together without stale required feedback', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik<BulkOfferingValues>
          initialValues={{
            ...bulkOfferingInitialValues,
            admissionCycle: { id: 'cycle-1', status: 1, windowStatus: 1 } as AdmissionCycle,
            boardId: 'board-1',
          }}
          initialTouched={{ mediumId: true }}
          initialErrors={{ mediumId: 'Medium is required' }}
          validationSchema={bulkOfferingSchema}
          onSubmit={() => undefined}
        >
          {(formik) => (
            <>
              <BulkAdmissionHierarchyFields
                formik={formik}
                hierarchy={hierarchy}
                standards={standards}
                loading={false}
                change={(updates) => formik.setValues({ ...formik.values, ...updates }, true)}
              />
              <output data-testid="hierarchy-selection">
                {JSON.stringify({
                  mediumId: formik.values.mediumId,
                  standardIds: formik.values.standardIds,
                })}
              </output>
            </>
          )}
        </Formik>
      </ThemeProvider>
    );
    expect(screen.getByText('Medium is required')).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Medium *' }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    await waitFor(() => expect(screen.queryByText('Medium is required')).not.toBeInTheDocument());
    expect(screen.getByTestId('hierarchy-selection')).toHaveTextContent(
      '"mediumId":"medium-1","standardIds":[]'
    );
  });

  it('shows server duplicate feedback directly under Class while preserving required markers', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik
          initialValues={{
            ...bulkOfferingInitialValues,
            boardId: 'board-1',
            mediumId: 'medium-1',
            standardIds: ['class-1'],
          }}
          onSubmit={() => undefined}
        >
          {(formik) => (
            <BulkAdmissionHierarchyFields
              formik={formik}
              hierarchy={hierarchy}
              standards={standards}
              loading={false}
              change={(updates) => formik.setValues({ ...formik.values, ...updates }, true)}
              fieldIssues={{
                standardIds: { message: 'Class 1: An offering already exists.', blocking: true },
              }}
            />
          )}
        </Formik>
      </ThemeProvider>
    );
    const classes = screen.getByRole('combobox', { name: 'Class *' });
    expect(classes.closest('.MuiFormControl-root')).toHaveTextContent(
      'Class 1: An offering already exists.'
    );
    expect(classes).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('combobox', { name: 'Board *' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Medium *' })).toBeVisible();
  });

  it('keeps every school level available after selecting a class', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik
          initialValues={{ ...bulkOfferingInitialValues, boardId: 'board-1', mediumId: 'medium-1' }}
          onSubmit={() => undefined}
        >
          {(formik) => (
            <>
              <BulkAdmissionHierarchyFields
                formik={formik}
                hierarchy={hierarchy}
                standards={standards}
                loading={false}
                change={(updates) => formik.setValues({ ...formik.values, ...updates }, true)}
              />
              <output data-testid="class-selection">
                {JSON.stringify({
                  standardIds: formik.values.standardIds,
                })}
              </output>
            </>
          )}
        </Formik>
      </ThemeProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Board *' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Medium *' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Class *' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: /School level/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Campus/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Class *' }));
    await user.click(screen.getByRole('option', { name: 'Class 1' }));

    await waitFor(() =>
      expect(screen.getByTestId('class-selection')).toHaveTextContent('{"standardIds":["class-1"]}')
    );
    expect(screen.getByRole('option', { name: 'Class 9' })).toBeVisible();
    await user.click(screen.getByRole('option', { name: 'Class 9' }));
    await waitFor(() =>
      expect(screen.getByTestId('class-selection')).toHaveTextContent(
        '{"standardIds":["class-1","class-9"]}'
      )
    );
  });
});
