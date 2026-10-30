import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { getChapterInitialValues } from '../initialValues';
import { ChapterDetailsSection } from './ChapterDetailsSection';
import { getChapterValidationSchema } from '../validationSchema';

import type { IChapterFormValues } from '../type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/academic/components/language-typing', () => ({
  LanguageInputField: () => null,
}));

const academicYear = { startDate: '2026-06-01', endDate: '2027-06-01' };

function ChapterForm({ submit }: { submit: (values: IChapterFormValues) => void }) {
  const formik = useFormik<IChapterFormValues>({
    initialValues: { ...getChapterInitialValues(), chapterNo: 1, chapterName: 'Gujarati chapter' },
    validationSchema: getChapterValidationSchema(academicYear),
    onSubmit: submit,
  });

  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form onSubmit={formik.handleSubmit}>
          <ChapterDetailsSection
            formik={formik}
            isEditing={false}
            academicYearStart={academicYear.startDate}
            academicYearEnd={academicYear.endDate}
            additionalFieldsCount={0}
            onOpenAdditionalFields={() => {}}
          />
          <output data-testid="date-errors">
            {JSON.stringify({ startDate: formik.errors.startDate, endDate: formik.errors.endDate })}
          </output>
          <button type="submit">Submit</button>
        </form>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

async function applyRange() {
  fireEvent.click(screen.getByRole('textbox', { name: /Expected teaching dates/ }));
  ['2026-10-29', '2026-11-17'].forEach((date) => {
    const cell = screen
      .getAllByRole('gridcell', { name: dayjs(date).format('D') })
      .find((element) => element.getAttribute('data-timestamp') === String(dayjs(date).valueOf()));
    expect(cell).toBeDefined();
    fireEvent.click(cell!);
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  });
}

describe('Chapter teaching dates', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-29T12:00:00'));
  });

  afterEach(() => vi.useRealTimers());

  it('validates both selected endpoints together when Apply commits a new range', async () => {
    const submit = vi.fn();
    render(<ChapterForm submit={submit} />);

    await applyRange();

    expect(screen.getByRole('textbox', { name: /Expected teaching dates/ })).toHaveValue(
      '29/10/2026 - 17/11/2026'
    );
    await waitFor(() => expect(screen.getByTestId('date-errors')).toHaveTextContent('{}'));
    expect(screen.queryByText('Start Date is required')).not.toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    expect(submit.mock.calls[0][0]).toMatchObject({
      startDate: dayjs('2026-10-29'),
      endDate: dayjs('2026-11-17'),
    });
  });

  it('clears required-date errors after submitting an empty range and then applying valid dates', async () => {
    const submit = vi.fn();
    render(<ChapterForm submit={submit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Start Date is required')).toBeVisible();
    expect(submit).not.toHaveBeenCalled();

    await applyRange();

    await waitFor(() => expect(screen.getByTestId('date-errors')).toHaveTextContent('{}'));
    expect(screen.queryByText('Start Date is required')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });
});
