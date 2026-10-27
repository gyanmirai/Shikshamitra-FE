import { useFormik } from 'formik';
import { mswServer } from 'src/test/mswServer';
import { _api as iconifyApi } from '@iconify/react';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { AcademicYearDateFields } from './academic-year-date-fields';
import {
  getAcademicYearInitialValues,
  academicYearValidationSchema,
} from './academic-year-form-model';

function DateFieldsForm() {
  const formik = useFormik({
    initialValues: getAcademicYearInitialValues(null),
    enableReinitialize: true,
    validationSchema: academicYearValidationSchema,
    onSubmit: () => {},
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AcademicYearDateFields formik={formik} />
      <output aria-label="Selected start date">
        {formik.values.startDate.format('YYYY-MM-DD')}
      </output>
      <output aria-label="Selected end date">{formik.values.endDate.format('YYYY-MM-DD')}</output>
    </LocalizationProvider>
  );
}

describe('academic year date selection', () => {
  beforeEach(() => {
    iconifyApi.setFetch((...args) => fetch(...args));
    mswServer.use(...iconApiHandlers);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-14T10:00:00'));
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('selects a start year, month and day and updates the form', async () => {
    render(<DateFieldsForm />);
    fireEvent.click(screen.getAllByRole('button', { name: /Choose date/ })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Choose year' }));
    vi.setSystemTime(new Date('2026-10-14T10:00:01'));
    fireEvent.click(screen.getByRole('radio', { name: '2025' }));
    fireEvent.click(screen.getByRole('radio', { name: 'April' }));
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }));
    expect(await screen.findByLabelText('Selected start date')).toHaveTextContent('2025-04-15');
  });

  it('selects an end month and year while keeping earlier dates disabled', async () => {
    render(<DateFieldsForm />);
    fireEvent.click(screen.getAllByRole('button', { name: /Choose date/ })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Choose year' }));
    expect(screen.queryByRole('radio', { name: '2025' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '2026' }));
    expect(screen.getByRole('radio', { name: 'May' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'June' }));
    expect(screen.getByRole('gridcell', { name: '1' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Choose year' }));
    fireEvent.click(screen.getByRole('radio', { name: '2027' }));
    fireEvent.click(screen.getByRole('radio', { name: 'May' }));
    fireEvent.click(screen.getByRole('gridcell', { name: '31' }));
    expect(await screen.findByLabelText('Selected end date')).toHaveTextContent('2027-05-31');
    fireEvent.click(screen.getAllByRole('button', { name: /Choose date/ })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Choose month' }));
    fireEvent.click(screen.getByRole('radio', { name: 'April' }));
    fireEvent.click(screen.getByRole('gridcell', { name: '30' }));
    expect(await screen.findByLabelText('Selected end date')).toHaveTextContent('2027-04-30');
  });
});
