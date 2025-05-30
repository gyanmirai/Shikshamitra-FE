import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
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

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialValues } from './initialValues';
import { stepValidationSchemas } from './validationSchema';

const QuizInformation = ({ formik }: any) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Define available division options for the quiz
  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  // Track if all divisions are selected by comparing initial values length with total options
  const [isAllSelected, setIsAllSelected] = useState(
    formik.initialValues?.division?.length === divisionOption.length
  );
  // Handle changes in division selection
  const handleDivisionChange = (selectedValues: string[]) => {
    // Check if "All" or "Deselect All" option is selected
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      // Get array of all division values
      const allDivision = divisionOption.map((org) => org.value);

      // If all divisions are currently selected, clear selection
      if (isAllSelected) {
        formik.setFieldValue('division', []);
      } else {
        // Otherwise select all divisions
        formik.setFieldValue('division', allDivision);
      }
      // Toggle the isAllSelected state
      setIsAllSelected(!isAllSelected);
    } else {
      // Update division values with selected options
      formik.setFieldValue('division', selectedValues);
      // Set isAllSelected true if all divisions are selected
      setIsAllSelected(selectedValues.length === divisionOption.length);
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizStartDateTime && formik.errors.quizStartDateTime) || false}
          >
            <DateTimePicker
              label="Quiz Start Date/Time"
              format="DD/MM/YYYY HH:mm"
              value={formik.values.quizStartDateTime}
              onChange={(value) => {
                formik.setFieldValue('quizStartDateTime', value);
              }}
              disablePast
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!(formik.touched.quizStartDateTime && formik.errors.quizStartDateTime),
                  helperText: formik.touched.quizStartDateTime && formik.errors.quizStartDateTime,
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizEndDateTime && formik.errors.quizEndDateTime) || false}
          >
            <DateTimePicker
              label="Quiz End Date/Time"
              value={formik.values.quizEndDateTime}
              onChange={(value) => {
                formik.setFieldValue('quizEndDateTime', value);
              }}
              disablePast
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!(formik.touched.quizEndDateTime && formik.errors.quizEndDateTime),
                  helperText: formik.touched.quizEndDateTime && formik.errors.quizEndDateTime,
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizTakenType && formik.errors.quizTakenType) || false}
          >
            <CustomSelect
              label="Quiz Taken Type"
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
              ]}
              name="quizTakenType"
              value={formik.values.quizTakenType}
              onChange={(val) => formik.setFieldValue('quizTakenType', val as string)}
              error={!!(formik.touched.quizTakenType && formik.errors.quizTakenType) || false}
              helperText={formik.touched.quizTakenType && formik.errors.quizTakenType}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizTitle && formik.errors.quizTitle) || false}
          >
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
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.className && formik.errors.className) || false}
          >
            <CustomSelect
              options={allClass || []}
              value={formik.values.className}
              onChange={(val) => {
                formik.setFieldValue('className', val);
              }}
              label="Class"
              labelKey="name"
              valueKey="name"
              error={!!(formik.touched.className && formik.errors.className) || false}
              helperText={formik.touched.className && formik.errors.className}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField error={!!(formik.touched.division && formik.errors.division) || false}>
            <CustomSelect
              label="Select Divisions"
              disabled={!formik.values.className}
              options={[
                {
                  value: isAllSelected ? 'deselectAll' : 'all',
                  label: isAllSelected ? 'Deselect All' : 'All',
                },
                ...divisionOption,
              ]}
              value={formik.values.division}
              onChange={(val) => {
                handleDivisionChange(val as string[]);
              }}
              multiple
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.division && formik.errors.division) || false}
              helperText={
                Array.isArray(formik.errors.division)
                  ? formik.errors.division.join(', ')
                  : (formik.touched.division && formik.errors.division) || undefined
              }

              // helperText={formik.touched.division && formik.errors.division}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject) || false}>
            <CustomSelect
              label="Subject"
              options={[
                { value: 'math', label: 'Math' },
                { value: 'english', label: 'English' },
                { value: 'science', label: 'Science' },
              ]}
              disabled={!(formik.values.division && formik.values.division.length > 0)}
              name="subject"
              value={formik.values.subject}
              onChange={(val) => formik.setFieldValue('subject', val as string)}
              error={!!(formik.touched.subject && formik.errors.subject) || false}
              helperText={formik.touched.subject && formik.errors.subject}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField error={!!(formik.touched.chapter && formik.errors.chapter) || false}>
            <CustomSelect
              label="Chapter"
              options={[
                { value: 'chapter1', label: 'chapter1' },
                { value: 'chapter2', label: 'chapter2' },
                { value: 'chapter3', label: 'chapter3' },
              ]}
              name="chapter"
              multiple
              disabled={!formik.values.subject}
              value={formik.values.chapter}
              onChange={(val) => formik.setFieldValue('chapter', val)}
              error={!!(formik.touched.chapter && formik.errors.chapter) || false}
              helperText={
                Array.isArray(formik.errors.chapter)
                  ? formik.errors.chapter.join(', ')
                  : (formik.touched.chapter && formik.errors.chapter) || undefined
              }
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.totalMarks && formik.errors.totalMarks) || false}
          >
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
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.passingMarks && formik.errors.passingMarks) || false}
          >
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
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizDuration && formik.errors.quizDuration) || false}
          >
            <TextField
              fullWidth
              label="Duration (In Minutes)"
              name="quizDuration"
              value={formik.values.quizDuration}
              onChange={formik.handleChange}
              error={formik.touched.quizDuration && Boolean(formik.errors.quizDuration)}
              helperText={formik.touched.quizDuration && formik.errors.quizDuration}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
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
          No questions added. Click &apos;Add Question&apos; to get started.{' '}
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
  // Question text input state
  const [question, setQuestion] = useState(initialData?.question || '');

  // Type of question (multiple choice, true/false etc.)
  const [questionType, setQuestionType] = useState(initialData?.questionType || '');

  // Array of answer options for multiple choice questions
  const [options, setOptions] = useState(initialData?.options || ['']);

  // Whether the question is mandatory
  const [isRequired, setIsRequired] = useState(initialData?.isRequired || false);

  // Correct answer for the question
  const [correctAnswer, setCorrectAnswer] = useState<any>(initialData?.correctAnswer || '');

  // Points awarded for correct answer
  const [marks, setMarks] = useState(initialData?.marks?.toString() || '1');

  // Time allowed to answer the question (in seconds)
  const [questionTime, setQuestionTime] = useState(initialData?.questionTime?.toString() || '');

  // Form validation error messages
  const [errors, setErrors] = useState({
    question: '',
    questionType: '',
    options: '',
    correctAnswer: '',
    marks: '',
    questionTime: '',
  });
  const isEditMode = !!initialData;

  /**
   * Handles changes to the question type, resets related fields and errors
   * @param value - The new question type value
   */
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

  /**
   * Updates the value of an option at the specified index
   * @param index - The index of the option to update
   * @param value - The new value for the option
   */
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setErrors({ ...errors, options: '' });
  };

  /**
   * Adds a new empty option to the options array
   */
  const handleAddOption = () => {
    setOptions([...options, '']);
    setErrors({ ...errors, options: '' });
  };

  /**
   * Removes an option at the specified index and resets correct answer if needed
   * @param index - The index of the option to remove
   */
  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions: any) => prevOptions.filter((_: any, i: any) => i !== index));
    if (correctAnswer === options[index]) {
      setCorrectAnswer('');
    }
  };

  /**
   * Validates all form fields and returns whether the form is valid
   * @returns boolean indicating if all fields are valid
   */
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

    if (!questionTime) {
      newErrors.questionTime = 'Question Time is required';
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

  /**
   * Saves the question if all fields are valid
   */
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

  /**
   * Renders the appropriate answer input field based on question type
   * @returns JSX element for the answer field
   */
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
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(errors.questionType && errors.questionType) || false}>
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
                }}
                error={!!errors.questionType}
                helperText={errors.questionType}
              />
              {/* {errors.questionType && <FormHelperText error>{errors.questionType}</FormHelperText>} */}
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(errors.marks && errors.marks) || false}>
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
              {/* {errors.marks && <FormHelperText error>{errors.marks}</FormHelperText>} */}
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(errors.questionTime && errors.questionTime) || false}>
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
            </ShakingTextField>
          </Grid>
          {/* {errors.question && <FormHelperText error>{errors.questionType}</FormHelperText>} */}

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
            {errors.question && <FormHelperText error>{errors.question}</FormHelperText>}
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
                disabled={options.length >= 5}
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
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSaveQuestion}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </DialogActions>
    </Box>
  );
};

const QuizBuilder = ({ formik }: any) => {
  // Dialog state for adding new questions
  const addQuestionDialog = useBoolean();

  // State to track which question is being edited, storing its index and data
  const [editingQuestion, setEditingQuestion] = useState<{ index: number; data: any } | null>(null);

  // Adds a new question to the quiz and closes the add question dialog
  const handleAddQuestion = (newQuestion: any) => {
    formik.setFieldValue('questions', [...formik.values.questions, newQuestion]);
    addQuestionDialog.onFalse();
  };

  // Opens the edit dialog for a specific question by its index
  const handleEditQuestion = (index: number) => {
    setEditingQuestion({ index, data: formik.values.questions[index] });
  };

  // Saves the edited question and updates the questions array in formik
  const handleSaveEdit = (updatedQuestion: any) => {
    if (editingQuestion === null) return;

    const updatedQuestions = [...formik.values.questions];
    updatedQuestions[editingQuestion.index] = updatedQuestion;
    formik.setFieldValue('questions', updatedQuestions);
    setEditingQuestion(null);
  };

  // Handles the drag and drop reordering of questions
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formik.values.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    formik.setFieldValue('questions', items);
  };

  // Removes a question from the quiz by its index
  const handleDeleteQuestion = (indexToDelete: number) => {
    formik.setFieldValue(
      'questions',
      formik.values.questions.filter((_: any, index: number) => index !== indexToDelete)
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      {formik.errors.questions && (
        <Typography variant="body2" color="error">
          {' '}
          {formik.errors.questions}
        </Typography>
      )}
      <Box display="flex" gap={2}>
        <Typography variant="body2">Generate Question</Typography>
        <Switch
          size="small"
          checked={formik.values.isQuestionUpload}
          onChange={() => formik.setFieldValue('isQuestionUpload', !formik.values.isQuestionUpload)}
        />
        <Typography variant="body2">Upload Question</Typography>
      </Box>
      {!formik.values.isQuestionUpload && (
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
      )}

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

      {!formik.values.isQuestionUpload ? (
        <QuestionList
          questions={formik.values.questions}
          onDragEnd={handleDragEnd}
          onDeleteQuestion={handleDeleteQuestion}
          onEditQuestion={handleEditQuestion}
        />
      ) : (
        <Upload
          // {...uploadProps}
          thumbnail
          value={formik.values.rubric}
          onDrop={(acceptedFiles) => {
            const file = acceptedFiles[0];
            console.log('file', file);

            if (!file) return;

            formik.setFieldValue('rubric', file);
          }}
          multiple={false}
          onDelete={() => {}}
          onRemoveAll={() => {}}
          sx={{
            p: 2,
          }}
        />
      )}
    </Box>
  );
};

const allSurveySteps = [QuizInformation, QuizBuilder];

const AddNewQuiz = ({
  onClose,
  dialog,
}: {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
}) => {
  // State to track the current active step in the quiz creation stepper
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      initialValues={getInitialValues()}
      steps={['Quiz', 'Quiz Builder']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={stepValidationSchemas[activeStep as keyof typeof stepValidationSchemas]}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allSurveySteps[step];
        return (
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <Box p={2}>
              <StepComponent formik={formik} />
            </Box>
          </BackPopUpChecked>
        );
      }}
    />
  );
};

export default AddNewQuiz;
