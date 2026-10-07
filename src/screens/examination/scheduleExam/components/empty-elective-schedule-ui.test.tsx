import { useState } from 'react';
import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { _api as iconifyApi } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import globalState from 'src/redux/globalState/globalSlice';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import ExamDetails from './examDetailsStep2';
import ExamScheduleReview from './ExamScheduleReview';
import { validationSchema } from '../validationSchema';
import { serializeSchedulePayload } from './initialValues';
import { makeEmptyElectiveForm } from './empty-elective-schedule.fixture';

function Harness({
  onSave,
}: {
  onSave: (payload: ReturnType<typeof serializeSchedulePayload>) => void;
}) {
  const [review, setReview] = useState(false);
  const formik = useFormik({
    initialValues: makeEmptyElectiveForm(),
    validationSchema: validationSchema[1],
    onSubmit: (values) => {
      onSave(serializeSchedulePayload(values));
      setReview(true);
    },
  });
  return (
    <>
      {review ? <ExamScheduleReview formik={formik} /> : <ExamDetails {...formik} />}
      <button type="button" onClick={() => formik.submitForm()}>
        Save &amp; Next
      </button>
      <button type="button" onClick={() => formik.setValues(makeEmptyElectiveForm(1))}>
        Assign one test student to Computer Science
      </button>
    </>
  );
}

function renderSchedule() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  const store = configureStore({
    reducer: { globalState, confirmPopup, [api.reducerPath]: api.reducer },
    preloadedState: {
      globalState: {
        currentYear: {},
        currentBoard: {},
        currentMedium: {
          educationMediumStages: [
            {
              standards: [
                {
                  id: 'class-10',
                  divisions: [{ id: 'division-a', name: 'A' }],
                },
              ],
            },
          ],
        },
      },
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  const onSave = vi.fn<(payload: ReturnType<typeof serializeSchedulePayload>) => void>();
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Harness onSave={onSave} />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
  return { onSave };
}

describe('Schedule step empty elective behavior', () => {
  it('explains the division, hides bulk controls and table, and saves only Pt into review', async () => {
    const { onSave } = renderSchedule();
    await waitFor(() =>
      expect(screen.getByText('Elective subjects').closest('[style]')).toHaveStyle({ opacity: '1' })
    );
    const computerCard = screen
      .getByText('Computer Science')
      .closest('.MuiAccordion-root') as HTMLElement;
    expect(
      within(computerCard).getByText('No students are assigned to this elective in Div A.')
    ).toBeInTheDocument();
    expect(within(computerCard).queryByText('Apply to all')).not.toBeInTheDocument();
    expect(within(computerCard).queryByRole('table')).not.toBeInTheDocument();
    const link = within(computerCard).getByRole('link', {
      name: 'Open Elective Assignment (new tab)',
    });
    expect(link).toHaveAttribute('href', '/academic/assign-elective-subject');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('3 students')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      onSave.mock.calls[0][0].subjects.map((subject: { subjectId: string }) => subject.subjectId)
    ).toEqual(['pt']);
    expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
    expect(screen.getByText('PT07')).toBeInTheDocument();
  });

  it('shows a Computer Science schedule row after one test student is assigned', async () => {
    renderSchedule();
    fireEvent.click(
      screen.getByRole('button', { name: 'Assign one test student to Computer Science' })
    );
    await waitFor(() => expect(screen.getByText('COM06')).toBeInTheDocument());
    expect(screen.queryByText(/No students are assigned/)).not.toBeInTheDocument();
    expect(screen.getByText('1 student')).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(2);
    await waitFor(() =>
      expect(screen.getByText('Elective subjects').closest('[style]')).toHaveStyle({ opacity: '1' })
    );
  });
});
