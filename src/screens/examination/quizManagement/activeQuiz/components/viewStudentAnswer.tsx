import { useState } from 'react';

import {
  Box,
  Chip,
  Stack,
  Paper,
  Radio,
  Button,
  TextField,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export const ViewAnswers = () => {
  // Sample data - replace with your actual data
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Which of the following is not a JavaScript framework?',
      options: ['React', 'Angular', 'Flask', 'Vue'],
      correctAnswer: 'Flask',
      userAnswer: 'Vue',
      marks: 1,
      totalMarks: 1,
    },
    {
      id: 2,
      type: 'true-false',
      question: 'JavaScript is a statically typed language',
      correctAnswer: 'false',
      userAnswer: 'false',
      marks: 1,
      totalMarks: 1,
    },
    {
      id: 3,
      type: 'descriptive',
      question: 'Explain the concept of React hooks and their advantages',
      userAnswer:
        'React hooks are functions that let you use React state and lifecycle features from function components. They were introduced in React 16.8 to eliminate the need for class components in many cases. Advantages include reusability of stateful logic, cleaner code, and avoiding complex patterns like render props and HOCs.',
      marks: null,
      totalMarks: 10,
      remarks: '',
    },
  ]);

  // Function to handle marks for descriptive questions
  const handleMarksChange = (id: any, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, marks: value > q.totalMarks ? q.totalMarks : value } : q
      )
    );
  };

  // Function to handle remarks
  const handleRemarksChange = (id: any, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, remarks: value } : q)));
  };

  // Calculate total score
  const totalScore = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
  const totalPossible = questions.reduce((acc, q) => acc + q.totalMarks, 0);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Chip
          label={`Total Score: ${totalScore}/${totalPossible}`}
          color="primary"
          variant="outlined"
          size="medium"
        />
      </Box>

      <Scrollbar sx={{ mt: 1.5, height: '550px' }}>
        {questions.map((question, index) => (
          <Paper key={question.id} elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Q{index + 1} : {question.question}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Type: {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
            </Typography>

            {question.type === 'multiple-choice' && (
              <Box mt={2}>
                <RadioGroup value={question.userAnswer}>
                  {question?.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {option}
                          {option === question.correctAnswer ? (
                            <Iconify icon="mdi:check-circle-outline" color="#4BB543" />
                          ) : option === question.userAnswer &&
                            option !== question.correctAnswer ? (
                            <Iconify icon="mdi:close-circle-outline" color="#ff3333" />
                          ) : null}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}

            {question.type === 'true-false' && (
              <Box mt={2}>
                <RadioGroup value={question.userAnswer}>
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        True
                        {question.correctAnswer === 'true' ? (
                          <Iconify icon="mdi:check-circle-outline" color="#4BB543" />
                        ) : question.userAnswer === 'true' && question.correctAnswer !== 'true' ? (
                          <Iconify icon="mdi:close-circle-outline" color="#ff3333" />
                        ) : null}
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        False
                        {question.correctAnswer === 'false' ? (
                          <Iconify icon="mdi:check-circle-outline" color="#4BB543" />
                        ) : question.userAnswer === 'false' &&
                          question.correctAnswer !== 'false' ? (
                          <Iconify icon="mdi:close-circle-outline" color="#ff3333" />
                        ) : null}
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
            )}

            {question.type === 'descriptive' && (
              <Box mt={2}>
                <Typography variant="subtitle2">Student&apos;s Answer:</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: '#f9f9f9' }}>
                  <Editor
                    value={question.userAnswer}
                    onChange={(value) => {
                      // formik.setFieldValue('question', value);
                    }}
                    placeholder="Question"
                    sx={{ width: '100%', marginTop: '10px' }}
                  />
                </Paper>

                <Stack direction="row" spacing={2} mt={2}>
                  <TextField
                    label="Marks *"
                    placeholder="Marks"
                    type="number"
                    value={question.marks || ''}
                    onChange={(e) => handleMarksChange(question.id, Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, max: question.totalMarks } }}
                    size="small"
                    sx={{ width: '100px' }}
                    helperText={`Out of ${question.totalMarks}`}
                  />
                  <TextField
                    label="Remarks"
                    fullWidth
                    multiline
                    rows={2}
                    value={question.remarks}
                    onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        ))}
      </Scrollbar>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" startIcon={<Iconify icon={GlobalIcons.cancel} />}>
          Cancel
        </Button>
        <Button variant="contained" startIcon={<Iconify icon={GlobalIcons.submit} />}>
          Save
        </Button>
      </Box>
    </Box>
  );
};
