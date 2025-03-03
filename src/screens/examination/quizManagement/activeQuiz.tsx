import * as yup from 'yup';
import React, { useState, useCallback } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import { Add } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  Stack,
  Switch,
  Button,
  TableRow,
  MenuList,
  MenuItem,
  TextField,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  DialogActions,
  TableContainer,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import QuizPortal from './quizPortal';
import { quizData } from './quizOptions';

const dummyData = [
  {
    class: '10',
    division: ['A', 'B'],
    subject: 'Mathematics',
    quizTitle: 'Algebra Basics',
    createdAt: '2024-12-01',
    quizDate: '2024-12-15',
    quizTime: '10:00 AM',
    marksEntry: 'Completed',
    attemptsAllow: 3,
    totalMarks: 100,
    passingMarks: 40,
    grade: 'A',
    status: true,
    id: '1', // Unique identifier for the row
  },
  {
    class: '9',
    division: ['B', 'C'],
    subject: 'Science',
    quizTitle: 'Physics Quiz',
    createdAt: '2024-12-05',
    quizDate: '2024-12-20',
    quizTime: '11:00 AM',
    marksEntry: 'Pending',
    attemptsAllow: 2,
    totalMarks: 50,
    passingMarks: 20,
    grade: 'B',
    status: false,
    id: '2',
  },
  {
    class: '8',
    division: ['C', 'D', 'E'],
    subject: 'English',
    quizTitle: 'Grammar Test',
    createdAt: '2024-12-08',
    quizDate: '2024-12-25',
    quizTime: '12:00 PM',
    marksEntry: 'Completed',
    attemptsAllow: 1,
    totalMarks: 30,
    passingMarks: 15,
    grade: 'C',
    status: true,
    id: '3',
  },
  {
    class: '7',
    division: ['D', 'E'],
    subject: 'History',
    quizTitle: 'World Wars',
    createdAt: '2024-12-10',
    quizDate: '2024-12-30',
    quizTime: '09:00 AM',
    marksEntry: 'Pending',
    attemptsAllow: 4,
    totalMarks: 70,
    passingMarks: 35,
    grade: 'B',
    status: false,
    id: '4',
  },
];

const ActiveQuiz = () => {
  const [tableData, setTableData] = useState(dummyData);
  const addQuizDialog = useBoolean();
  const attemptQuizDialog = useBoolean();
  const [open, setOpen] = useState(false);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <Iconify icon="fluent:quiz-new-20-filled" sx={{ height: '16px', width: '16px' }} />
            Attempt Quiz
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {open ? (
          <Button
            startIcon={<Iconify icon="mdi:arrow-back" />}
            variant="contained"
            size="small"
            onClick={() => {
              setOpen(false);
            }}
          >
            Back
          </Button>
        ) : (
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={() => {
              addQuizDialog.onTrue();
            }}
          >
            Quiz
          </Button>
        )}
      </Box>

      {open ? (
        <QuizPortal quizData={quizData} />
      ) : (
        <CustomizableTable
          tableId="quiz-table"
          columns={[
            { id: 'class', label: 'Class' },
            {
              id: 'division',
              label: 'Division',
              render(value, row) {
                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.length
                      ? value.map((audience: string) => (
                          <Chip key={audience} label={audience} size="small" variant="outlined" />
                        ))
                      : '-'}
                  </Box>
                );
              },
            },
            { id: 'subject', label: 'Subject' },
            { id: 'quizTitle', label: 'Quiz Title', minWidth: '130px', align: 'left' },
            { id: 'createdAt', label: 'Created At', minWidth: '150px', align: 'left' },
            { id: 'quizDate', label: 'Quiz Date', minWidth: '130px', align: 'left' },
            { id: 'quizTime', label: 'Quiz Time', minWidth: '130px', align: 'left' },
            { id: 'quizEndDate', label: 'Quiz End Date', minWidth: '200px', align: 'left' },
            { id: 'quizEndTime', label: 'Quiz End Time', minWidth: '200px', align: 'left' },
            { id: 'quizDuration', label: 'Quiz Duration', minWidth: '200px', align: 'left' },
            { id: 'attemptsAllow', label: 'Attempts Allow', minWidth: '200px', align: 'left' },
            { id: 'totalMakrs', label: 'Total Marks', minWidth: '200px', align: 'left' },
            { id: 'passingMarks', label: 'Passing Marks', minWidth: '200px', align: 'left' },
            {
              id: 'status',
              label: 'Publish',
              render: (value: boolean, row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    size="small"
                    checked={value}
                    onChange={() => {
                      // setPendingStatusChange({
                      //   id: row.id, // Use row.id instead of undefined 'id'
                      //   value: !value,
                      // });
                      // confirmPublishDialog.onTrue();
                    }}
                  />
                </Box>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showEditIcon
                    showDeleteIcon
                    handleEditClick={() => {}}
                    handleDeleteClick={() => {}}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      )}

      <CustomDialog
        maxWidth="lg"
        open={addQuizDialog.value}
        handleClose={addQuizDialog.onFalse}
        title="New Quiz"
      >
        <AddNewQuiz />
      </CustomDialog>
    </Box>
  );
};

export default ActiveQuiz;

const QuizInformation = ({ formik }: any) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  const [isAllSelected, setIsAllSelected] = useState(
    formik.initialValues?.division?.length === divisionOption.length
  );

  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllSelected(selectedValues.length === divisionOption.length);
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Quiz Title"
            name="quizTitle"
            value={formik.values.quizTitle}
            onChange={formik.handleChange}
            error={formik.touched.quizTitle && Boolean(formik.errors.quizTitle)}
            helperText={formik.touched.quizTitle && formik.errors.quizTitle}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CustomSelect
            options={classData?.items || []}
            value={formik.values.className}
            onChange={(val) => {
              formik.setFieldValue('className', val);
            }}
            label="Class"
            isLoading={isLoading}
            labelKey="name"
            valueKey="name"
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.className && formik.errors.className && (
            <FormHelperText error>{formik.errors.className}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} md={3}>
          <CustomSelect
            label="Select Divisions"
            options={[
              {
                value: isAllSelected ? 'deselectAll' : 'all',
                label: isAllSelected ? 'Deselect All' : 'All',
              },
              ...divisionOption,
            ]}
            value={formik.values.division || []}
            onChange={(val) => {
              handleDivisionChange(val as string[]);
            }}
            multiple
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.division && formik.errors.division && (
            <FormHelperText error>{String(formik.errors.division)}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} md={3}>
          <CustomSelect
            label="Subject"
            options={[
              { value: 'math', label: 'Math' },
              { value: 'english', label: 'English' },
              { value: 'science', label: 'Science' },
            ]}
            name="subject"
            value={formik.values.subject}
            onChange={(val) => formik.setFieldValue('subject', val as string)}
            formControlProps={{ sx: { minWidth: 275 } }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <CustomSelect
            label="Chapter"
            options={[
              { value: 'chapter1', label: 'chapter1' },
              { value: 'chapter2', label: 'chapter2' },
              { value: 'chapter3', label: 'chapter3' },
            ]}
            name="chapter"
            multiple
            value={formik.values.chapter}
            onChange={(val) => formik.setFieldValue('chapter', val)}
            formControlProps={{ sx: { minWidth: 275 } }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Total Marks"
            name="totalMarks"
            value={formik.values.totalMarks}
            onChange={formik.handleChange}
            error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
            helperText={formik.touched.totalMarks && formik.errors.totalMarks}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Passing Marks"
            name="passingMarks"
            value={formik.values.passingMarks}
            onChange={formik.handleChange}
            error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
            helperText={formik.touched.passingMarks && formik.errors.passingMarks}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Duration (Minute)"
            name="quizDuration"
            value={formik.values.quizDuration}
            onChange={formik.handleChange}
            error={formik.touched.quizDuration && Boolean(formik.errors.quizDuration)}
            helperText={formik.touched.quizDuration && formik.errors.quizDuration}
            size="small"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const QuestionList = ({ questions, onDragEnd, onDeleteQuestion, onEditQuestion }: any) => {
  if (!questions?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 3,
          mt: 2,
        }}
      >
        <Typography color="text.secondary">
          No questions added yet. Click Add Question to begin creating your survey.
        </Typography>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50px' }} />
              <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>Question</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Required</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Options</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Marks</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Time(Min)</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Answer</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Edit</TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <Droppable droppableId="questions">
            {(provided) => (
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {questions.map((question: any, index: any) => (
                  <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                    {(provided2, snapshot) => (
                      <TableRow
                        ref={provided2.innerRef}
                        {...provided2.draggableProps}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
                          ...(snapshot.isDragging && {
                            backgroundColor: 'rgba(63, 81, 181, 0.08) !important',
                            '& td': { borderBottom: 'none' },
                          }),
                        }}
                      >
                        <TableCell {...provided2.dragHandleProps} sx={{ width: '50px' }}>
                          <IconButton size="small" sx={{ cursor: 'grab' }}>
                            <Iconify icon="mdi:drag" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{question.question}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={question.questionType}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{question.isRequired}</Typography>
                          {question.isRequired ? (
                            <Iconify icon="mdi:tick" />
                          ) : (
                            <Iconify icon="mdi:cross-circle-outline" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {question.options.length
                              ? question.options.map((audience: string) => (
                                  <Chip
                                    key={audience}
                                    label={audience}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))
                              : '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{question.marks}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{question.questionTime}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{question.correctAnswer}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => onEditQuestion(index)}>
                            <Iconify icon="mdi:pencil" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => onDeleteQuestion(index)}
                          >
                            <Iconify icon="mdi:delete" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </TableContainer>
    </DragDropContext>
  );
};

const QuestionForm = ({ onSave, initialData = null, onCancel }: any) => {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [questionType, setQuestionType] = useState(initialData?.questionType || '');
  const [options, setOptions] = useState(initialData?.options || ['']);
  const [isRequired, setIsRequired] = useState(initialData?.isRequired || false);
  const [correctAnswer, setCorrectAnswer] = useState<any>(initialData?.correctAnswer || '');
  const [marks, setMarks] = useState(initialData?.marks?.toString() || '1');
  const [questionTime, setQuestionTime] = useState(initialData?.questionTime?.toString() || '');

  const [errors, setErrors] = useState({
    question: '',
    questionType: '',
    options: '',
    correctAnswer: '',
    marks: '',
    questionTime: '',
  });

  console.log('errors---', errors);

  const isEditMode = !!initialData;

  const handleQuestionTypeChange = (value: any) => {
    setQuestionType(value);
    setCorrectAnswer('');
    if (value === 'multiple-choice') {
      setOptions(['']);
    } else {
      setOptions([]);
    }
    setErrors({ ...errors, questionType: '', correctAnswer: '' });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setErrors({ ...errors, options: '' });
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
    setErrors({ ...errors, options: '' });
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions: any) => prevOptions.filter((_: any, i: any) => i !== index));
    if (correctAnswer === options[index]) {
      setCorrectAnswer('');
    }
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      question: '',
      questionType: '',
      options: '',
      correctAnswer: '',
      marks: '',
      questionTime: '',
    };

    if (!question.trim()) {
      newErrors.question = 'Question is required';
      isValid = false;
    }

    if (!questionType) {
      newErrors.questionType = 'Question type is required';
      isValid = false;
    }

    // eslint-disable-next-line no-restricted-globals
    if (!marks || isNaN(Number(marks)) || Number(marks) <= 0) {
      newErrors.marks = 'Valid marks are required';
      isValid = false;
    }

    if (!correctAnswer) {
      newErrors.correctAnswer = 'Correct answer is required';
      isValid = false;
    }

    if (questionType === 'multiple-choice') {
      if (options.length < 2) {
        newErrors.options = 'At least two options are required';
        isValid = false;
      } else if (options.some((opt: any) => !opt.trim())) {
        newErrors.options = 'Options cannot be empty';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveQuestion = () => {
    if (validateFields()) {
      const questionData = {
        question,
        questionType,
        options,
        isRequired,
        correctAnswer,
        marks: Number(marks),
        questionTime,
      };
      onSave(questionData);
    }
  };

  const renderAnswerField = () => {
    switch (questionType) {
      case 'multiple-choice':
        return (
          <Grid item xs={12}>
            <CustomSelect
              label="Correct Answer"
              options={options.map((option: any) => ({
                value: option,
                label: option,
              }))}
              value={correctAnswer}
              onChange={(value) => {
                setCorrectAnswer(value);
                setErrors({ ...errors, correctAnswer: '' });
              }}
              required
              formControlProps={{
                fullWidth: true,
                sx: { minWidth: '200px' },
                error: !!errors.correctAnswer,
              }}
            />
          </Grid>
        );
      case 'trueFalse':
        return (
          <Grid item xs={12}>
            <CustomSelect
              label="Correct Answer"
              options={[
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
              ]}
              value={correctAnswer}
              onChange={(value) => {
                setCorrectAnswer(value);
                setErrors({ ...errors, correctAnswer: '' });
              }}
              required
              formControlProps={{
                fullWidth: true,
                sx: { minWidth: '200px' },
                error: !!errors.correctAnswer,
              }}
            />
          </Grid>
        );
      case 'shortAns':
        return (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Sample Answer"
              value={correctAnswer}
              onChange={(e) => {
                setCorrectAnswer(e.target.value);
                setErrors({ ...errors, correctAnswer: '' });
              }}
              size="small"
              required
              error={!!errors.correctAnswer}
              helperText={errors.correctAnswer}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Scrollbar sx={{ p: 2, height: '300px', bgcolor: 'background.neutral' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CustomSelect
              label="Question Type"
              options={[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'trueFalse', label: 'True / False' },
                { value: 'shortAns', label: 'Short Answer' },
              ]}
              value={questionType}
              onChange={handleQuestionTypeChange}
              required
              formControlProps={{
                fullWidth: true,
                // sx: { minWidth: '200px' },
                error: !!errors.questionType,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              size="small"
              fullWidth
              required
              error={!!errors.marks}
              helperText={errors.marks}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Time (Minutes)"
              type="number"
              value={questionTime}
              onChange={(e) => setQuestionTime(e.target.value)}
              size="small"
              fullWidth
              required
              error={!!errors.questionTime}
              helperText={errors.questionTime}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          {errors.questionType && <FormHelperText error>{errors.questionType}</FormHelperText>}

          <Grid item xs={12}>
            <Editor
              value={question}
              onChange={(value) => {
                setQuestion(value);
                // formik.setFieldValue('question', value);
              }}
              placeholder="Question"
              sx={{ width: '100%', marginTop: '10px' }}
            />
            {/* <TextField
              fullWidth
              label="Question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              size="small"
              required
              error={!!errors.question}
              helperText={errors.question}
            /> */}
          </Grid>

          {questionType === 'multiple-choice' && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {options.map((option: any, index: any) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        size="small"
                        fullWidth
                        required
                        error={!!errors.options}
                      />
                      <IconButton
                        onClick={() => handleRemoveOption(index)}
                        size="small"
                        color="error"
                        disabled={options.length <= 2}
                        sx={{ ml: 1 }}
                      >
                        <Iconify icon="mdi:trash" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {errors.options && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.options}
                </FormHelperText>
              )}
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={handleAddOption}
                size="small"
                sx={{ mt: 2 }}
              >
                Add Option
              </Button>
            </Grid>
          )}

          {questionType && renderAnswerField()}
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isRequired}
                onChange={(e) => {
                  setIsRequired(e.target.checked);
                }}
              />
            }
            label="Required"
          />
          <Stack direction="row" spacing={2}>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button variant="contained" onClick={handleSaveQuestion}>
              {isEditMode ? 'Save Changes' : 'Save Question'}
            </Button>
          </Stack>
        </Box>
      </DialogActions>
    </Box>
  );
};

const QuizBuilder = ({ formik }: any) => {
  const addQuestionDialog = useBoolean();
  const [editingQuestion, setEditingQuestion] = useState<{ index: number; data: any } | null>(null);

  const handleAddQuestion = (newQuestion: any) => {
    formik.setFieldValue('questions', [...formik.values.questions, newQuestion]);
    addQuestionDialog.onFalse();
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestion({ index, data: formik.values.questions[index] });
  };

  const handleSaveEdit = (updatedQuestion: any) => {
    if (editingQuestion === null) return;

    const updatedQuestions = [...formik.values.questions];
    updatedQuestions[editingQuestion.index] = updatedQuestion;
    formik.setFieldValue('questions', updatedQuestions);
    setEditingQuestion(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formik.values.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    formik.setFieldValue('questions', items);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    formik.setFieldValue(
      'questions',
      formik.values.questions.filter((_: any, index: number) => index !== indexToDelete)
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{formik.values.quizTitle}</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => addQuestionDialog.onTrue()}
        >
          Add Question
        </Button>
      </Box>

      <CustomDialog
        maxWidth="sm"
        open={addQuestionDialog.value}
        handleClose={addQuestionDialog.onFalse}
        title="New Question"
      >
        <QuestionForm onSave={handleAddQuestion} onCancel={addQuestionDialog.onFalse} />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={!!editingQuestion}
        handleClose={() => setEditingQuestion(null)}
        title="Edit Question"
      >
        {editingQuestion && (
          <QuestionForm
            initialData={editingQuestion.data}
            onSave={handleSaveEdit}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </CustomDialog>

      <QuestionList
        questions={formik.values.questions}
        onDragEnd={handleDragEnd}
        onDeleteQuestion={handleDeleteQuestion}
        onEditQuestion={handleEditQuestion}
      />
    </Box>
  );
};

const QuizSetting = ({ formik }: any) => {
  const [questionTableData, setQuestionTableData] = useState(formik.values.questions || []);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Typography variant="h6">{formik.values.quizTitle}</Typography>{' '}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <DateTimePicker
            label="Quiz Start Date/Time"
            value={formik.values.quizStartDateTime}
            onChange={(value) => {
              formik.setFieldValue('quizStartDateTime', value);
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
            disablePast
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <DateTimePicker
            label="Quiz End Date/Time"
            value={formik.values.quizEndDateTime}
            onChange={(value) => {
              formik.setFieldValue('quizEndDateTime', value);
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
            disablePast
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Attempts Allowed"
            name="attemptsAllowed"
            value={formik.values.attemptsAllowed}
            onChange={formik.handleChange}
            error={formik.touched.attemptsAllowed && Boolean(formik.errors.attemptsAllowed)}
            helperText={formik.touched.attemptsAllowed && formik.errors.attemptsAllowed}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              checked={formik.values.randomOrder}
              onChange={() => {
                formik.setFieldValue('randomOrder', !formik.values.randomOrder);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography sx={{ mr: 2 }} variant="body2">
              Random Questions
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <CustomizableTable
        isFilter={false}
        isSearch={false}
        isPagination={false}
        isShowedDense={false}
        isScrollbar={false}
        tableId="quiz-questions"
        columns={[
          { id: 'question', label: 'Question' },
          { id: 'questionType', label: 'Question Type' },
          {
            id: 'options',
            label: 'Options',
            render(value, row) {
              return (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {value.length
                    ? value.map((audience: string) => (
                        <Chip key={audience} label={audience} size="small" variant="outlined" />
                      ))
                    : '-'}
                </Box>
              );
            },
          },
          { id: 'correctAnswer', label: 'Correct Answer' },
          { id: 'marks', label: 'Marks' },
        ]}
        data={questionTableData}
      />
    </Box>
  );
};

const allSurveySteps = [QuizInformation, QuizBuilder, QuizSetting];

const stepValidationSchemas = [
  yup.object().shape({
    quizTitle: yup.string().required('Quiz title is required'),
    className: yup.string().required('Class name is required'),
    division: yup.array().of(yup.string()).min(1, 'At least one division is required'),
    subject: yup.string().required('Subject is required'),
    chapter: yup.array().of(yup.string()).min(1, 'At least one chapter is required'),
  }),
  yup.object().shape({
    questions: yup
      .array()
      .of(
        yup.object().shape({
          question: yup.string().required('Question is required'),
          questionType: yup.string().required('Question type is required'),
          options: yup.array().of(yup.string()).min(1, 'At least one option is required'),
        })
      )
      .min(1, 'At least one question is required'),
  }),
  yup.object().shape({
    attemptsAllowed: yup
      .number()
      .min(1, 'At least one attempt is required')
      .required('Attempts allowed is required'),
    passingMarks: yup
      .number()
      .min(0, 'Passing score must be at least 0')
      .max(100, 'Passing score must not exceed 100')
      .required('Passing score is required'),
    quizDateTime: yup.date().required('Quiz date is required'),
  }),
];

const AddNewQuiz = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      initialValues={{
        quizTitle: '',
        className: '',
        division: [],
        subject: '',
        quizDuration: 0,
        chapter: [],
        totalMarks: 0,
        questions: [],
        attemptsAllowed: 1,
        passingMarks: 0,
        quizStartDateTime: null,
        quizEndDateTime: null,
        randomOrder: false,
      }}
      steps={['Quiz Information', 'Quiz Builder', 'Quiz Setting']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      //   validationSchema={
      //     stepValidationSchemas[activeStep as unknown as keyof typeof stepValidationSchemas]
      //   }
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allSurveySteps[step];
        console.log('StepComponent---', StepComponent);
        return (
          <Box p={2}>
            <StepComponent formik={formik} />
          </Box>
        );
      }}
    />
  );
};
