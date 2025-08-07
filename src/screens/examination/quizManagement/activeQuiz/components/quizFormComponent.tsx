import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
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
  Radio,
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
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import CustomTooltip from 'src/components/custom-tooltip';
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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

  // Handle changes in division selection

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizStartDateTime && formik.errors.quizStartDateTime) || false}
          >
            <DateTimePicker
              label="Start Date/Time *"
              format="DD/MM/YYYY hh:mm"
              value={formik.values.quizStartDateTime}
              onChange={(value) => {
                formik.setFieldValue('quizStartDateTime', value);
              }}
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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
              format="DD/MM/YYYY hh:mm"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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
              valueKey="id"
              error={!!(formik.touched.className && formik.errors.className) || false}
              helperText={formik.touched.className && formik.errors.className}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField error={!!(formik.touched.division && formik.errors.division) || false}>
            <CustomSelect
              label="Division *"
              labelKey="name"
              valueKey="id"
              multiple
              disabled={!formik.values.className}
              options={[
                { id: 'all', name: 'All' },
                ...(allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  []),
              ]}
              value={formik.values.division || []} // Added fallback empty array
              onChange={(val) => {
                const value = val as string[];

                const divisionOptions =
                  allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  [];

                const allDivisionIds = divisionOptions.map((d) => d.id);
                const isAllClicked = value.includes('all');
                const wasAllPreviouslySelected = (formik.values.division || []).includes('all'); // Fixed field name and added fallback

                if (isAllClicked && !wasAllPreviouslySelected) {
                  // "All" was just clicked - select all divisions
                  formik.setFieldValue('division', ['all', ...allDivisionIds]);
                } else if (!isAllClicked && wasAllPreviouslySelected) {
                  // "All" was just unchecked - deselect all divisions
                  formik.setFieldValue('division', []);
                } else if (isAllClicked && wasAllPreviouslySelected) {
                  // Individual item was selected/deselected while "All" was already selected
                  const selectedWithoutAll = value.filter((id) => id !== 'all');

                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    // All individual items are selected, keep "All" selected
                    formik.setFieldValue('division', ['all', ...allDivisionIds]);
                  } else {
                    // Not all individual items are selected, remove "All"
                    formik.setFieldValue('division', selectedWithoutAll);
                  }
                } else {
                  // "All" is not selected, handle individual selections
                  const selectedWithoutAll = value.filter((id) => id !== 'all');

                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    // All individual items are selected, add "All"
                    formik.setFieldValue('division', ['all', ...allDivisionIds]);
                  } else {
                    // Not all items selected, just keep individual selections
                    formik.setFieldValue('division', selectedWithoutAll);
                  }
                }
              }}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.division && formik.errors.division)}
              helperText={
                formik.touched.division
                  ? Array.isArray(formik.errors.division)
                    ? formik.errors.division.join(', ')
                    : formik.errors.division
                  : undefined
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
              type="number"
              // placeholder="Enter Total Marks"
              name="totalMarks"
              value={formik.values.totalMarks}
              onChange={formik.handleChange}
              error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
              helperText={formik.touched.totalMarks && formik.errors.totalMarks}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.passingMarks && formik.errors.passingMarks) || false}
          >
            <TextField
              fullWidth
              type="number"
              label="Passing Marks *"
              // placeholder="Enter Passing Marks"
              name="passingMarks"
              value={formik.values.passingMarks}
              onChange={formik.handleChange}
              error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
              helperText={formik.touched.passingMarks && formik.errors.passingMarks}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={!!(formik.touched.quizDuration && formik.errors.quizDuration) || false}
          >
            <TextField
              fullWidth
              type="number"
              label="Duration (In Minutes) *"
              // placeholder="Enter Duration"
              name="quizDuration"
              value={formik.values.quizDuration}
              onChange={formik.handleChange}
              error={formik.touched.quizDuration && Boolean(formik.errors.quizDuration)}
              helperText={formik.touched.quizDuration && formik.errors.quizDuration}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

const QuestionList = ({ questions, onDragEnd, onDeleteQuestion, onEditQuestion }: any) => {
  // Boolean state to control visibility of delete question confirmation dialog
  const deleteQuestionDialog = useBoolean();

  // State to track index of question being deleted, null when no deletion in progress
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
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
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }} />
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Sr No.
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Question
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Type
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Required
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Options
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Marks
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Time(Min)
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Answer
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Edit
              </TableCell>
              <TableCell sx={{ width: '80px', maxWidth: '80px', whiteSpace: 'nowrap' }}>
                Delete
              </TableCell>
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
                              display: 'table', // 👈 Key Fix
                              width: '100%', // ensure full width
                              tableLayout: 'fixed',
                              borderCollapse: 'collapse',
                              boxSizing: 'border-box',
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
                            <Typography
                              variant="body2"
                              dangerouslySetInnerHTML={{ __html: question.question }}
                            />
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
                          <TableCell
                            sx={{
                              width: '150px',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
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
                                setDeleteIndex(index);
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
                      content={
                        deleteIndex !== null
                          ? `Are you sure you want to delete Question ${deleteIndex + 1}?`
                          : ''
                      }
                      action={
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
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

const QuestionForm = ({ onSave, onCancel, initialData = null, formik }: any) => {
  // Initialize form state with provided initial data or default values
  const initial = initialData || defaultValues;
  const [formState, setFormState] = useState(initial);

  // Get current question marks and total quiz marks
  const totalMarks = Number(formik.values.totalMarks);
  // Convert marks from form state to number
  const currentMarks = Number(formState.marks);
  // Get current question time and total quiz duration
  const currentTime = Number(formState.questionTime);
  // Convert quiz duration from formik values to a number
  // This represents the total allowed time for the quiz in minutes
  const totalDuration = Number(formik.values.quizDuration);
  // Calculate total time taken by all questions in minutes
  const totalQuestionTimeInMinutes = formik.values.questions.reduce(
    (acc: number, question: any) => acc + Number(question.questionTime || 0),
    0
  );

  // Get total quiz duration in minutes
  const totalDurationInMinutes = Number(formik.values.quizDuration);

  // State to track index of option being deleted
  const [optionToDeleteIndex, setOptionToDeleteIndex] = useState<number | null>(null);

  // Calculate total marks of all questions
  const totalQuestionMarks = formik.values.questions.reduce(
    (acc: any, question: any) => acc + Number(question.marks || 0),
    0
  );

  // Dialog state for confirming option deletion
  const deleteOptionDialog = useBoolean();

  // State to track form validation errors
  const [errors, setErrors] = useState({
    question: '',
    questionType: '',
    options: '',
    correctAnswer: '',
    marks: '',
    questionTime: '',
  });

  // Reset form state when initial data changes
  useEffect(() => {
    setFormState(initial);
  }, [initial, initialData]);

  // Generic handler for updating form fields and clearing their errors
  const handleChange = (field: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Handler for updating individual multiple choice options
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formState.options];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  // Handler for adding a new blank option to multiple choice questions
  const handleAddOption = () => {
    handleChange('options', [...formState.options, '']);
  };

  // Handler for removing an option from multiple choice questions
  // Also clears the correct answer if the removed option was selected
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
    if (!formState.questionType) newErrors.questionType = 'Question Type is required';
    if (!formState.marks || isNaN(Number(formState.marks)) || Number(formState.marks) <= 0)
      newErrors.marks = 'Valid marks required';
    if (currentMarks > totalMarks) {
      newErrors.marks = 'Cannot exceed total marks.';
    } else if (totalQuestionMarks + currentMarks > totalMarks) {
      newErrors.marks = `Total marks would exceed limit. Available: ${totalMarks - totalQuestionMarks}`;
    }
    if (!formState.questionTime) newErrors.questionTime = 'Time is required';
    if (currentTime > totalDurationInMinutes) {
      newErrors.questionTime = 'Cannot exceed total duration.';
    } else if (totalQuestionTimeInMinutes + currentTime > totalDurationInMinutes) {
      newErrors.questionTime = `Total time would exceed limit. Available: ${totalDurationInMinutes - totalQuestionTimeInMinutes}`;
    }

    if (!formState.correctAnswer) newErrors.correctAnswer = 'Sample Answer required';

    if (formState.questionType === 'Multiple Choice') {
      if (formState.options.length < 2) {
        newErrors.options = ['At least two options needed'];
      } else {
        const optionErrors = formState.options.map((opt: string) =>
          !opt.trim() ? 'Option cannot be empty' : ''
        );
        if (optionErrors.some((e: any) => e)) {
          newErrors.options = optionErrors;
        }
      }
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
      case 'Multiple Choice':
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
      case 'True / False':
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
      case 'Short Answer':
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '200x' }}>
        <Scrollbar sx={{ p: 2, height: '400px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ShakingTextField error={!!errors.question}>
                <CustomSelect
                  label="Question Type *"
                  options={[
                    { label: 'Multiple Choice', value: 'Multiple Choice' },
                    { label: 'True / False', value: 'True / False' },
                    { label: 'Short Answer', value: 'Short Answer' },
                  ]}
                  value={formState.questionType}
                  onChange={(val) => {
                    handleChange('questionType', val);
                    handleChange('correctAnswer', '');
                    handleChange('options', val === 'multiple-choice' ? [''] : []);
                  }}
                  error={!!errors.questionType}
                  helperText={errors.questionType}
                  formControlProps={{ fullWidth: true }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <ShakingTextField error={!!errors.marks}>
                <TextField
                  label="Marks *"
                  type="number"
                  value={formState.marks}
                  onChange={(e) => handleChange('marks', e.target.value)}
                  fullWidth
                  size="small"
                  error={!!errors.marks}
                  helperText={errors.marks}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <ShakingTextField error={!!errors.questionTime}>
                <TextField
                  label="Time (Minutes) *"
                  type="number"
                  value={formState.questionTime}
                  onChange={(e) => handleChange('questionTime', e.target.value)}
                  fullWidth
                  size="small"
                  error={!!errors.questionTime}
                  helperText={errors.questionTime}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </ShakingTextField>
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

            {formState.questionType === 'Multiple Choice' && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {formState.options.map((opt: any, i: any) => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <ShakingTextField error={!!errors.options}>
                            <TextField
                              label={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(i, e.target.value)}
                              fullWidth
                              size="small"
                              error={!!errors.options?.[i]}
                              helperText={errors.options?.[i]}
                            />
                          </ShakingTextField>
                        </Box>

                        <IconButton
                          onClick={() => {
                            setOptionToDeleteIndex(i); // Store current index
                            deleteOptionDialog.onTrue(); // Open confirm dialog
                          }}
                          size="small"
                          color="error"
                          disabled={formState.options.length <= 2}
                        >
                          <Iconify icon={GlobalIcons.delete} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
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
                <ConfirmDialog
                  open={deleteOptionDialog.value}
                  onClose={() => {
                    deleteOptionDialog.onFalse();
                    setOptionToDeleteIndex(null);
                  }}
                  title="Delete"
                  content="Are you sure you want to delete this option?"
                  action={
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => {
                        if (optionToDeleteIndex !== null) {
                          handleRemoveOption(optionToDeleteIndex);
                          setOptionToDeleteIndex(null);
                        }
                        deleteOptionDialog.onFalse();
                      }}
                    >
                      Yes
                    </Button>
                  }
                />
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
        <Box display="flex" gap={2}>
          <FormControlLabel
            value="generate"
            control={
              <Radio
                size="small"
                checked={!formik.values.isQuestionUpload}
                onChange={() => formik.setFieldValue('isQuestionUpload', false)}
              />
            }
            label={<Typography variant="body2">Generate Question</Typography>}
          />
          <FormControlLabel
            value="upload"
            control={
              <Radio
                size="small"
                checked={formik.values.isQuestionUpload}
                onChange={() => formik.setFieldValue('isQuestionUpload', true)}
              />
            }
            label={<Typography variant="body2">Upload Question</Typography>}
          />
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Question</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Create a new question by entering the question text, selecting a question type, adding answer options if required, and specifying the correct answer, marks, and time."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <QuestionForm onSave={handleAddQuestion} onCancel={handleClose} formik={formik} />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={!!editingQuestion}
        handleClose={() => setEditingQuestion(null)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Question</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Modify the existing question by updating its content, question type, answer options, correct answer, marks, or time duration."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {editingQuestion && (
          <QuestionForm
            initialData={editingQuestion.data}
            onSave={handleSaveEdit}
            onCancel={handleClose}
            formik={formik}
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
        <FileUploader
          // @ts-ignore
          value={formik.values.rubric}
          multiple={false}
          showVisibleDocumentCount={1}
          onChange={(value: any) => {
            formik.setFieldValue('rubric', value);
          }}
          primaryText="Please Upload Your Questions"
          secondaryText="Maximum file size is 5MB"
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <CustomStepperWithFormik
      initialValues={getInitialValues()}
      steps={['Quiz', 'Quiz Builder']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange
      // eslint-disable-next-line no-sequences
      validationSchema={stepValidationSchemas(currentYear)[activeStep]}
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
