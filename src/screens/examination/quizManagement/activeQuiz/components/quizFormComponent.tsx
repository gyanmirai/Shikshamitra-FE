import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { isNaN } from 'lodash';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useRef, useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { Draggable, Droppable, DragDropContext } from '@hello-pangea/dnd';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetSubjectsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import { useGetChaptersQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  useGetQuizQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizQuestionsQuery,
  useUpdateQuizQuestionsMutation,
} from 'src/redux/academicAPI/ExaminationApi/quizManagementApi/quizManagementApi';
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

import { getInitialValues } from './initialValues';
import { stepValidationSchemas } from './validationSchema';

const QuizInformation = ({ formik }: any) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [, setClasses] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );

  const { data: subjectsData } = useGetSubjectsQuery(
    { academicMediumId: medium?.id },
    { skip: !medium?.id }
  );

  const { data: chaptersData } = useGetChaptersQuery(
    { subjectId: formik.values.subject },
    { skip: !formik.values.subject }
  );

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
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.quizStartDateTime && formik.errors.quizStartDateTime)}
          >
            <DateTimePicker
              label="Start Date/Time *"
              format="DD/MM/YYYY hh:mm"
              value={formik.values.quizStartDateTime}
              onChange={(value) => formik.setFieldValue('quizStartDateTime', value)}
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

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.quizEndDateTime && formik.errors.quizEndDateTime)}
          >
            <DateTimePicker
              label="End Date/Time *"
              format="DD/MM/YYYY hh:mm"
              value={formik.values.quizEndDateTime}
              onChange={(value) => formik.setFieldValue('quizEndDateTime', value)}
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.quizTitle && formik.errors.quizTitle)}>
            <TextField
              fullWidth
              label="Title *"
              name="quizTitle"
              value={formik.values.quizTitle}
              onChange={formik.handleChange}
              error={formik.touched.quizTitle && Boolean(formik.errors.quizTitle)}
              helperText={formik.touched.quizTitle && formik.errors.quizTitle}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.quizTakenType && formik.errors.quizTakenType)}>
            <CustomSelect
              label="Quiz Taken Type *"
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
              ]}
              name="quizTakenType"
              value={formik.values.quizTakenType}
              onChange={(val) => formik.setFieldValue('quizTakenType', val as string)}
              error={!!(formik.touched.quizTakenType && formik.errors.quizTakenType)}
              helperText={formik.touched.quizTakenType && formik.errors.quizTakenType}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
            <CustomSelect
              options={allClass || []}
              value={formik.values.className}
              onChange={(val) => formik.setFieldValue('className', val)}
              label="Class *"
              labelKey="name"
              valueKey="id"
              error={!!(formik.touched.className && formik.errors.className)}
              helperText={formik.touched.className && formik.errors.className}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
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
              value={formik.values.division || []}
              onChange={(val) => {
                const value = val as string[];
                const divisionOptions =
                  allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  [];
                const allDivisionIds = divisionOptions.map((d) => d.id);
                const isAllClicked = value.includes('all');
                const wasAllPreviouslySelected = (formik.values.division || []).includes('all');

                if (isAllClicked && !wasAllPreviouslySelected) {
                  formik.setFieldValue('division', ['all', ...allDivisionIds]);
                } else if (!isAllClicked && wasAllPreviouslySelected) {
                  formik.setFieldValue('division', []);
                } else if (isAllClicked && wasAllPreviouslySelected) {
                  const selectedWithoutAll = value.filter((id) => id !== 'all');
                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    formik.setFieldValue('division', ['all', ...allDivisionIds]);
                  } else {
                    formik.setFieldValue('division', selectedWithoutAll);
                  }
                } else {
                  const selectedWithoutAll = value.filter((id) => id !== 'all');
                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    formik.setFieldValue('division', ['all', ...allDivisionIds]);
                  } else {
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

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
            <CustomSelect
              label="Subject *"
              options={subjectsData || []}
              labelKey="name"
              valueKey="id"
              disabled={!(formik.values.division && formik.values.division.length > 0)}
              name="subject"
              value={formik.values.subject}
              onChange={(val) => {
                formik.setFieldValue('subject', val as string);
                formik.setFieldValue('chapter', []);
              }}
              error={!!(formik.touched.subject && formik.errors.subject)}
              helperText={formik.touched.subject && formik.errors.subject}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.chapter && formik.errors.chapter)}>
            <ResponsiveMultiSelect
              label="Chapter *"
              disabled={!formik.values.subject}
              options={chaptersData || []}
              value={formik.values.chapter || []}
              getOptionLabel={(opt: any) => opt.name}
              getOptionValue={(opt: any) => opt.id}
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

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}>
            <TextField
              fullWidth
              label="Total Marks *"
              type="number"
              name="totalMarks"
              value={formik.values.totalMarks}
              onChange={formik.handleChange}
              error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
              helperText={formik.touched.totalMarks && formik.errors.totalMarks}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.passingMarks && formik.errors.passingMarks)}>
            <TextField
              fullWidth
              type="number"
              label="Passing Marks *"
              name="passingMarks"
              value={formik.values.passingMarks}
              onChange={formik.handleChange}
              error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
              helperText={formik.touched.passingMarks && formik.errors.passingMarks}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.quizDuration && formik.errors.quizDuration)}>
            <TextField
              fullWidth
              type="number"
              label="Duration (In Minutes) *"
              name="quizDuration"
              value={formik.values.quizDuration}
              onChange={formik.handleChange}
              error={formik.touched.quizDuration && Boolean(formik.errors.quizDuration)}
              helperText={formik.touched.quizDuration && formik.errors.quizDuration}
              size="small"
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
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
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!errors.questionType}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
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
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Editor
                value={formState.question}
                onChange={(val) => handleChange('question', val)}
                placeholder="Question *"
                error={!!errors.question}
                helperText={errors.question}
              />
            </Grid>

            {formState.questionType === 'Multiple Choice' && (
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  {formState.options.map((opt: any, i: any) => (
                    <Grid size={{ xs: 12 }} key={i}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <ShakingTextField error={!!errors.options?.[i]}>
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
                            setOptionToDeleteIndex(i);
                            deleteOptionDialog.onTrue();
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
                        if (optionToDeleteIndex !== null) handleRemoveOption(optionToDeleteIndex);
                        setOptionToDeleteIndex(null);
                        deleteOptionDialog.onFalse();
                      }}
                    >
                      Yes
                    </Button>
                  }
                />
              </Grid>
            )}

            {formState.questionType && <Grid size={{ xs: 12 }}>{renderAnswerField()}</Grid>}
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

interface AddNewQuizProps {
  dialog: ReturnType<typeof useBoolean>;
  onClose: (_e?: any, isSubmit?: boolean) => void;
  editData?: any;
}

const AddNewQuiz: React.FC<AddNewQuizProps> = ({ dialog, onClose, editData }) => {
  // State to track the current active step in the quiz creation stepper
  const [activeStep, setActiveStep] = useState(0);
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);

  // Mutations
  const [createQuiz] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateQuizMutation,
  });

  const [updateQuiz] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateQuizMutation,
  });

  const [updateQuizQuestions] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateQuizQuestionsMutation,
  });

  const handleQuizInformation = useCallback(
    async (values: any, formik: any) => {
      const payload = {
        title: values.quizTitle,
        standardId: values.className,
        divisionIds: values.division.includes('all')
          ? values.division.filter((id: string) => id !== 'all')
          : values.division,
        subjectId: values.subject,
        chapterIds: values.chapter,
        totalMarks: Number(values.totalMarks),
        passingMarks: Number(values.passingMarks),
        duration: Number(values.quizDuration),
        startDateTime: values.quizStartDateTime.toISOString(),
        endDateTime: values.quizEndDateTime.toISOString(),
        quizTakenType: values.quizTakenType,
        randomOrder: values.randomOrder,
      };

      if (editData || values.quizId) {
        const res = await updateQuiz({
          quizId: editData?.id || values.quizId,
          academicMediumId: currentMedium?.id,
          body: payload,
        }).unwrap();
        return res;
      }
      const res = await createQuiz({
        academicMediumId: currentMedium?.id,
        body: payload,
      }).unwrap();

      formik.setFieldValue('quizId', res.id);
      return res;
    },
    [createQuiz, currentMedium?.id, editData, updateQuiz]
  );

  const handleQuizQuestions = useCallback(
    async (values: any) => {
      const payload = {
        questions: values.questions.map((q: any) => ({
          question: q.question,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: Number(q.marks),
          questionTime: Number(q.questionTime),
          isRequired: q.isRequired,
        })),
        isQuestionUpload: values.isQuestionUpload,
      };

      const res = await updateQuizQuestions({
        quizId: values.quizId || editData?.id,
        body: payload,
      }).unwrap();
      return res;
    },
    [editData?.id, updateQuizQuestions]
  );

  const handleSave = useCallback(
    async (isLastStep: boolean, values: any, formik: any, setIsLoading: (val: boolean) => void) => {
      try {
        setIsLoading(true);

        if (activeStep === 0) {
          await handleQuizInformation(values, formik);
          shikshaMitraToast.success({ message: 'Quiz information saved successfully' });
        } else if (activeStep === 1) {
          await handleQuizQuestions(values);
          shikshaMitraToast.success({ message: 'Quiz questions saved successfully' });
        }

        if (!isLastStep) {
          setActiveStep(activeStep + 1);
        } else {
          onClose(null, true);
        }
      } catch (error) {
        console.error('Error saving quiz details:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, handleQuizInformation, handleQuizQuestions, onClose]
  );

  return (
    <CustomStepperWithFormik
      initialValues={{
        ...getInitialValues(),
        quizId: editData?.id || '',
      }}
      steps={['Quiz', 'Quiz Builder']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange
      validationSchema={stepValidationSchemas(currentYear)[activeStep]}
      handleNext={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading);
      }}
      renderItem={({ formik, activeStep: step }: any) => (
        <NewQuizStepForm
          activeStep={step}
          formik={formik}
          editData={editData}
          allSteps={allSurveySteps}
        />
      )}
    />
  );
};

export default AddNewQuiz;

const NewQuizStepForm = ({ activeStep: step, formik, editData, allSteps }: any) => {
  const initializedStepsRef = useRef<Record<number, boolean>>({});
  const quizId = editData?.id || formik.values.quizId;
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: quizData, isLoading: quizLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuizQuery,
    params: { quizId, academicMediumId: currentMedium?.id },
    options: { skip: !quizId || step !== 0 },
  });

  const { data: questionsData, isLoading: questionsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuizQuestionsQuery,
    params: quizId,
    options: { skip: !quizId || step !== 1 },
  });

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;

    if (quizData && step === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        quizTitle: quizData.title,
        className: quizData.standardId,
        division: quizData.divisionIds,
        subject: quizData.subjectId,
        quizDuration: quizData.duration.toString(),
        chapter: quizData.chapterIds,
        totalMarks: quizData.totalMarks.toString(),
        passingMarks: quizData.passingMarks.toString(),
        quizStartDateTime: dayjs(quizData.startDateTime),
        quizEndDateTime: dayjs(quizData.endDateTime),
        quizTakenType: quizData.quizTakenType,
        randomOrder: quizData.randomOrder,
      }));
      initializedStepsRef.current[step] = true;
    } else if (questionsData && step === 1) {
      formik.setFieldValue('questions', questionsData.questions);
      formik.setFieldValue('isQuestionUpload', questionsData.isQuestionUpload);
      initializedStepsRef.current[step] = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData, questionsData, step]);

  if (quizLoading || questionsLoading) {
    return <LoadingScreen />;
  }

  const StepComponent = allSteps[step];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box p={2}>
        <StepComponent formik={formik} />
      </Box>
    </BackPopUpChecked>
  );
};
