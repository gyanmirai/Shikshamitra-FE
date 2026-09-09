import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalState from 'src/redux/globalState/globalSlice';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';

export const subjects: SlotSubject[] = [
  {
    subjectId: 'core-math',
    subjectAssignmentId: 'math-group',
    name: 'Core Mathematics',
    color: '#123456',
    teacherId: 'akshay',
    teacherName: 'Akshay Patel',
    roomId: 'b005',
  },
  {
    subjectId: 'applied-math',
    subjectAssignmentId: 'math-group',
    name: 'Applied Mathematics',
    color: '#123456',
    teacherId: 'jignesh',
    teacherName: 'Jignesh Jinjala',
    roomId: 'b004',
  },
];
export const slots: Record<DayOfWeek, TimeSlot[]> = {
  MONDAY: [
    {
      id: 'period-five',
      day: 'MONDAY',
      sequence: 5,
      startTime: '09:00',
      endTime: '09:30',
      type: 'LECTURE',
      subjects,
    },
  ],
  TUESDAY: [],
  WEDNESDAY: [],
  THURSDAY: [],
  FRIDAY: [],
  SATURDAY: [],
};
export const assignmentResponse = (teacherId: string) => ({
  data: {
    subjects: [
      {
        subjectId: 'core-math',
        primaryTeacher: {
          id: teacherId,
          name: teacherId === 'akshay' ? 'Akshay Patel' : 'Parth Ghusar',
        },
        secondaryTeachers: [],
      },
      {
        subjectId: 'applied-math',
        primaryTeacher: { id: 'jignesh', name: 'Jignesh Jinjala' },
        secondaryTeachers: [],
      },
    ],
  },
});
export const createTeacherTestStore = () =>
  configureStore({
    reducer: { confirmPopup, globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
export function renderTeacherFixture(ui: React.ReactNode, store = createTeacherTestStore()) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>{ui}</ThemeProvider>
      </Provider>
    ),
  };
}
