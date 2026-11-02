import 'src/global.css';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Button, CssBaseline } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import { defaultSettings } from 'src/components/settings/config-settings';
import AssignGrade from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/assignGradeForm';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    globalState: () => ({ currentMedium: { id: 'medium-1' } }),
    confirmPopup: () => ({ isChanges: false }),
  },
  middleware: (defaults) => defaults().concat(api.middleware),
});

function Fixture() {
  const [student, setStudent] = useState(1);
  const row = {
    id: `submission-${student}`,
    studentId: `student-${student}`,
    homeworkId: 'homework',
    studentName: `Synthetic Student ${student}`,
    rollNumber: `${student}`,
    assignments: '',
    subject: '',
    marks: 0,
    totalMarks: 4,
    feedback: '',
    weightedAverage: '',
    status: '3',
    submissionDate: null,
    submissionAttachments:
      student === 1
        ? [
            {
              id: 'photo',
              name: 'work.png',
              url: '/api/files/photo.png',
              contentType: 'image/png',
              size: 100,
            },
            {
              id: 'pdf',
              name: 'answers.pdf',
              url: '/api/files/answers.pdf',
              contentType: 'application/pdf',
              size: 240,
            },
          ]
        : [],
  };
  return (
    <>
      <Button onClick={() => setStudent(student === 1 ? 2 : 1)}>Switch student</Button>
      <CustomDialog open title="Add Feedback" handleClose={() => {}} maxWidth="md">
        <AssignGrade
        key={row.studentId}
          data={row}
          selectedClass="class-1"
          selectedSubject="subject-1"
          hasRubricAssessment
          selectedHomework={{ id: 'homework', title: 'Synthetic homework', submissionType: 2 }}
          hasNext={student === 1}
          onNext={() => setStudent(2)}
          onClose={() => {}}
        />
      </CustomDialog>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <Fixture />
    </ThemeProvider>
  </Provider>
);
