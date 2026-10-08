import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Formik } from 'formik';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { bulkOfferingInitialValues } from './bulk-admission-offering-model';
import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';

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
                change={(field, value) => formik.setFieldValue(field, value)}
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
      expect(screen.getByTestId('class-selection')).toHaveTextContent(
        '{"standardIds":["class-1"]}'
      )
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
