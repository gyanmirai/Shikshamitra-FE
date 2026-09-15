import type { ReactNode } from 'react';

import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { _api as iconifyApi } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import globalStateReducer from 'src/redux/globalState/globalSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { AcademicLanguageTypingProvider } from 'src/screens/academic/components/language-typing';

import SelectExam from './selectExamStep1';
import { validationSchema } from '../validationSchema';
import { defaultExamFormValues } from './initialValues';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}));

const createStore = () =>
  configureStore({
    reducer: {
      globalState: globalStateReducer,
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    preloadedState: {
      globalState: {
        currentYear: {},
        currentBoard: {},
        currentMedium: {
          id: 'medium-1',
          name: 'English Medium',
          educationMediumStages: [
            {
              standards: [
                {
                  id: 'class-12',
                  name: 'Class 12',
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

const BasicDetailsHarness = () => {
  const formik = useFormik({
    initialValues: {
      ...defaultExamFormValues,
      examType: 'final-exam',
    },
    validationSchema: validationSchema[0],
    validateOnMount: true,
    validateOnChange: false,
    onSubmit: () => undefined,
  });

  return <SelectExam {...formik} />;
};

describe('Schedule Exam basic-details subject validation', () => {
  describe('when a valid subject is selected and the field loses focus', () => {
    it('clears the subject-required error without waiting for unrelated fields', async () => {
      iconifyApi.setFetch((...args) => fetch(...args));
      mswServer.use(
        http.get('https://api.iconify.design/:collection', ({ request, params }) =>
          HttpResponse.json({
            prefix: String(params.collection).replace('.json', ''),
            icons: {},
            not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
          })
        ),
        http.get('*/api/auth/session', () => HttpResponse.json(null)),
        http.get('*/api/academics/examination/settings/exam-type', () =>
          HttpResponse.json({
            items: [{ id: 'final-exam', examType: 'Final Exam', defaultTotalMarks: 100 }],
          })
        ),
        http.get('*/api/academics/examination/settings/grading-scales', () =>
          HttpResponse.json({ data: [] })
        ),
        http.get('*/api/academics/exams/subjects-lookup', () =>
          HttpResponse.json([
            {
              id: 'english',
              subjectId: 'english',
              subjectName: 'English',
              subjectColor: '#1976D2',
            },
          ])
        )
      );

      const store = createStore();
      const user = userEvent.setup();
      render(
        <Provider store={store}>
          <ThemeProvider theme={createTheme(defaultSettings)}>
            <AcademicLanguageTypingProvider>
              <BasicDetailsHarness />
            </AcademicLanguageTypingProvider>
          </ThemeProvider>
        </Provider>
      );

      await user.click(screen.getByRole('combobox', { name: 'Class *' }));
      await user.click(await screen.findByRole('option', { name: 'Class 12' }));
      await user.click(screen.getByRole('combobox', { name: 'Division *' }));
      await user.click(await screen.findByRole('option', { name: 'A' }));

      const subjectsInput = await screen.findByRole('combobox', { name: 'Subjects *' });
      await user.click(subjectsInput);
      await user.click(await screen.findByRole('option', { name: /English/ }));
      await user.click(screen.getByText('Exam Setup'));

      await waitFor(() => {
        expect(screen.queryByText('At least one subject is required')).not.toBeInTheDocument();
      });
      expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    });
  });
});
