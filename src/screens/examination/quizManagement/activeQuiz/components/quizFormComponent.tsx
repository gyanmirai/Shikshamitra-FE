import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { Standards, Organization } from 'src/types/school';

import { isNaN } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';
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

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
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
              label="Start Date/Time *"
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
              label="End Date/Time *"
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
              label="Quiz Taken Type *"
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
              label="Title *"
              // placeholder="Enter Quiz Title"
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
              label="Class *"
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
              label="Divisions *"
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
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject) || false}>
            <CustomSelect
              label="Subject *"
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
            <ResponsiveMultiSelect
              label="Chapter *"
              disabled={!formik.values.subject}
              options={[
                { value: 'numbers', label: 'Numbers and Number Systems' },
                { value: 'algebra', label: 'Algebra' },
                { value: 'geometry', label: 'Geometry' },
                { value: 'mensuration', label: 'Mensuration' },
                { value: 'statistics', label: 'Statistics and Probability' },
                { value: 'trigonometry', label: 'Trigonometry' },
                { value: 'coordinate', label: 'Coordinate Geometry' },
                { value: 'sets', label: 'Sets and Relations' },
              ]}
              value={formik.values.chapter || []}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              onChange={(selectedValues: string[]) => {
                formik.setFieldValue('chapter', selectedValues);
              }}
              error={!!(formik.touched.chapter && formik.errors.chapter)}
              helperText={
                Array.isArray(formik.errors.chapter)
                  ? formik.errors.chapter.join(', ')
                  : (formik.touched.chapter && formik.errors.chapter) || undefined
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.totalMarks && formik.errors.totalMarks) || false}
          >
            <TextField
              fullWidth
              label="Total Marks *"
              // placeholder="Enter Total Marks"
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
              label="Passing Marks *"
              // placeholder="Enter Passing Marks"
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
              label="Duration (In Minutes) *"
              // placeholder="Enter Duration"
              name="quizDuration"
              value={formik.values.quizDuration}
              onChange={formik.handleChange}
              error={formik.touched.quizDuration && Boolean(formik.errors.quizDuration)}
              helperText={formik.touched.quizDuration && formik.errors.quizDuration}
              size="small"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

const QuestionList = ({ questions, onDragEnd, onDeleteQuestion, onEditQuestion }: any) => {
  const deleteQuestionDialog = useBoolean();
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
          No questions added. click on &apos;+ Question&apos; to get started.{' '}
        </Typography>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50px' }} />
              <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Sr No.</TableCell>
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
                  <>
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
                            <Typography variant="body2">{index + 1}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{question.question}</Typography>
                          </TableCell>
                          <TableCell>{question.questionType}</TableCell>
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
                              <Iconify icon={GlobalIcons.edit} />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                deleteQuestionDialog.onTrue();
                              }}
                            >
                              <Iconify icon={GlobalIcons.delete} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                    <ConfirmDialog
                      open={deleteQuestionDialog.value}
                      onClose={() => {
                        deleteQuestionDialog.onFalse();
                      }}
                      title="Delete"
                      content="Are you sure you want to Delete Question ?"
                      action={
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            onDeleteQuestion(index);
                            deleteQuestionDialog.onFalse();
                          }}
                          // startIcon={<Iconify icon={GlobalIcons.delete} />}
                        >
                          Yes
                        </Button>
                      }
                    />
                  </>
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

const defaultValues = {
  question: '',
  questionType: '',
  options: [''],
  isRequired: false,
  correctAnswer: '',
  marks: '1',
  questionTime: '',
};

const QuestionForm = ({ onSave, onCancel, initialData = null }: any) => {
  const initial = initialData || defaultValues;
  const [formState, setFormState] = useState(initial);

  const deleteOptionDialog = useBoolean();
  const [errors, setErrors] = useState({
    question: '',
    questionType: '',
    options: '',
    correctAnswer: '',
    marks: '',
    questionTime: '',
  });

  useEffect(() => {
    setFormState(initial);
  }, [initial, initialData]);

  const handleChange = (field: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formState.options];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const handleAddOption = () => {
    handleChange('options', [...formState.options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const updated = formState.options.filter((_: any, i: any) => i !== index);
    handleChange('options', updated);
    if (formState.correctAnswer === formState.options[index]) {
      handleChange('correctAnswer', '');
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formState.question.trim()) newErrors.question = 'Question is required';
    if (!formState.questionType) newErrors.questionType = 'Type is required';
    if (!formState.marks || isNaN(Number(formState.marks)) || Number(formState.marks) <= 0)
      newErrors.marks = 'Valid marks required';
    if (!formState.questionTime) newErrors.questionTime = 'Time is required';
    if (!formState.correctAnswer) newErrors.correctAnswer = 'Answer required';

    if (formState.questionType === 'multiple-choice') {
      if (formState.options.length < 2) newErrors.options = 'At least two options needed';
      else if (formState.options.some((opt: any) => !opt.trim()))
        newErrors.options = 'Options cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({ ...formState, marks: Number(formState.marks) });
    }
  };

  const renderAnswerField = () => {
    const { questionType, correctAnswer, options } = formState;
    switch (questionType) {
      case 'multiple-choice':
        return (
          <CustomSelect
            label="Correct Answer *"
            options={options.map((o: any) => ({ label: o, value: o }))}
            value={correctAnswer}
            onChange={(val) => handleChange('correctAnswer', val)}
            error={!!errors.correctAnswer}
            formControlProps={{ fullWidth: true }}
          />
        );
      case 'trueFalse':
        return (
          <CustomSelect
            label="Correct Answer *"
            options={[
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ]}
            value={correctAnswer}
            onChange={(val) => handleChange('correctAnswer', val)}
            error={!!errors.correctAnswer}
            formControlProps={{ fullWidth: true }}
          />
        );
      case 'shortAns':
        return (
          <TextField
            fullWidth
            label="Sample Answer"
            value={correctAnswer}
            onChange={(e) => handleChange('correctAnswer', e.target.value)}
            size="small"
            error={!!errors.correctAnswer}
            helperText={errors.correctAnswer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BackPopUpChecked initialValues={initial} currentValues={formState}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Scrollbar sx={{ p: 2, height: '300px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Question Type *"
                options={[
                  { label: 'Multiple Choice', value: 'multiple-choice' },
                  { label: 'True / False', value: 'trueFalse' },
                  { label: 'Short Answer', value: 'shortAns' },
                ]}
                value={formState.questionType}
                onChange={(val) => {
                  handleChange('questionType', val);
                  handleChange('correctAnswer', '');
                  handleChange('options', val === 'multiple-choice' ? [''] : []);
                }}
                error={!!errors.questionType}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Marks *"
                type="number"
                value={formState.marks}
                onChange={(e) => handleChange('marks', e.target.value)}
                fullWidth
                size="small"
                error={!!errors.marks}
                helperText={errors.marks}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Time (Minutes) *"
                type="number"
                value={formState.questionTime}
                onChange={(e) => handleChange('questionTime', e.target.value)}
                fullWidth
                size="small"
                error={!!errors.questionTime}
                helperText={errors.questionTime}
              />
            </Grid>

            <Grid item xs={12}>
              <Editor
                value={formState.question}
                onChange={(val) => handleChange('question', val)}
                placeholder="Question *"
                error={!!errors.question}
                helperText={errors.question}
              />
            </Grid>

            {formState.questionType === 'multiple-choice' && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {formState.options.map((opt: any, i: any) => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <IconButton
                          onClick={deleteOptionDialog.onTrue}
                          size="small"
                          color="error"
                          disabled={formState.options.length <= 2}
                        >
                          <Iconify icon={GlobalIcons.delete} />
                        </IconButton>
                        <ConfirmDialog
                          open={deleteOptionDialog.value}
                          onClose={deleteOptionDialog.onFalse}
                          title="Delete"
                          content="Are you sure you want to delete this option?"
                          action={
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => {
                                handleRemoveOption(i);
                                deleteOptionDialog.onFalse();
                              }}
                            >
                              Yes
                            </Button>
                          }
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {errors.options && <FormHelperText error>{errors.options}</FormHelperText>}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddOption}
                  startIcon={<Iconify icon="mdi:plus" />}
                  disabled={formState.options.length >= 5}
                  sx={{ mt: 3 }}
                >
                  Add Option
                </Button>
              </Grid>
            )}

            {formState.questionType && (
              <Grid item xs={12}>
                {renderAnswerField()}
              </Grid>
            )}
          </Grid>
        </Scrollbar>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <FormControlLabel
            control={
              <Switch
                checked={formState.isRequired}
                onChange={(e) => handleChange('isRequired', e.target.checked)}
              />
            }
            label="Required"
          />

          <Stack direction="row" spacing={2}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={() => {
                  onCancel(null, false);
                }}
                size="small"
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

const QuizBuilder = ({ formik }: any) => {
  // Dialog state for adding new questions
  const addQuestionDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

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

  // Handler to remove a single file attachment
  const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('rubric', '');
  }, []);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addQuestionDialog.onFalse();
      setEditingQuestion(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addQuestionDialog.onFalse();
      setEditingQuestion(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      {formik.errors.questions && (
        <Typography variant="body2" color="error">
          {' '}
          {formik.errors.questions}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box display="flex" gap={1}>
          <Typography variant="body2">Generate Question</Typography>
          <Switch
            size="small"
            checked={formik.values.isQuestionUpload}
            onChange={() =>
              formik.setFieldValue('isQuestionUpload', !formik.values.isQuestionUpload)
            }
          />
          <Typography variant="body2">Upload Question</Typography>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Switch
            checked={formik.values.randomOrder}
            size="small"
            onChange={() => {
              formik.setFieldValue('randomOrder', !formik.values.randomOrder);
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Typography sx={{ mr: 2 }} variant="body2">
            Random Questions
          </Typography>
        </Box>
      </Box>

      {!formik.values.isQuestionUpload && (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">
            <strong>Title : </strong>
            {formik.values.quizTitle}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => addQuestionDialog.onTrue()}
          >
            Question
          </Button>
        </Box>
      )}

      <CustomDialog
        maxWidth="sm"
        open={addQuestionDialog.value}
        handleClose={addQuestionDialog.onFalse}
        title="Add Question"
      >
        <QuestionForm onSave={handleAddQuestion} onCancel={handleClose} />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={!!editingQuestion}
        handleClose={() => setEditingQuestion(null)}
        title="Update Question"
      >
        {editingQuestion && (
          <QuestionForm
            initialData={editingQuestion.data}
            onSave={handleSaveEdit}
            onCancel={handleClose}
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
          onDelete={() => {
            handleRemoveFile(formik.setFieldValue);
          }}
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
