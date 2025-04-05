// eslint-disable-next-line import/no-duplicates
import React from 'react';
// eslint-disable-next-line import/no-duplicates
import { useState } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Paper,
  Button,
  Switch,
  Divider,
  TableRow,
  TableCell,
  TextField,
  TableHead,
  TableBody,
  Typography,
  IconButton,
  FormHelperText,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { validationSchema } from './validationSchema';
import { DetailRow } from '../announcement/schoolWiseAnnounsement';

import type { TResponseData } from './type';

const responseTableData: TResponseData[] = [
  {
    id: '1',
    responsendedName: 'John Doe',
    role: 'Student',
    responsendedEmail: 'john.doe@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Excellent' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'Yes, very satisfied',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '2 hours' },
    ],
  },
  {
    id: '2',
    responsendedName: 'Mary Smith',
    role: 'Parent',
    responsendedEmail: 'mary.smith@parent.edu',
    response: [
      {
        id: 'q1',
        question: 'How do you feel about the school’s communication with parents?',
        answer: 'Good, but can improve',
      },
      {
        id: 'q2',
        question: 'Are you satisfied with the academic progress of your child?',
        answer: 'Yes',
      },
      {
        id: 'q3',
        question: 'How involved are you in your child’s studies?',
        answer: 'I help with homework regularly',
      },
    ],
  },
  {
    id: '3',
    responsendedName: 'Alice Brown',
    role: 'Student',
    responsendedEmail: 'alice.brown@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Good' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'Mostly, but some materials need updating',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '1 hour' },
    ],
  },
  {
    id: '4',
    responsendedName: 'Robert Johnson',
    role: 'Parent',
    responsendedEmail: 'robert.johnson@parent.edu',
    response: [
      {
        id: 'q1',
        question: 'How do you feel about the school’s communication with parents?',
        answer: 'Excellent',
      },
      {
        id: 'q2',
        question: 'Are you satisfied with the academic progress of your child?',
        answer: 'Very satisfied',
      },
      {
        id: 'q3',
        question: 'How involved are you in your child’s studies?',
        answer: 'I monitor assignments and grades',
      },
    ],
  },
  {
    id: '5',
    responsendedName: 'Linda White',
    role: 'Student',
    responsendedEmail: 'linda.white@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Fair' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'No, some materials are outdated',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '3 hours' },
    ],
  },
];

const ResponseComponent = () => {
  // State to store and manage response table data
  const [tableData, setTableData] = useState<any>(responseTableData);
  return (
    <CustomizableTable
      tableId="response-table"
      columns={[
        {
          id: 'responsendedName',
          label: 'Respodent Name',
          children(row) {
            return (
              <>
                {row.response.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Scrollbar sx={{ height: '200px' }}>
                      {row.response.map((val: any, index: any) => (
                        <React.Fragment key={index}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Paper elevation={4} sx={{ p: 2, width: '100%', mt: 1 }}>
                              <Typography variant="body1">Question: {val.question}</Typography>
                              <Typography variant="body2">Answer: {val.answer}</Typography>
                            </Paper>
                          </Box>
                        </React.Fragment>
                      ))}
                    </Scrollbar>
                  </Box>
                )}
              </>
            );
          },
        },
        {
          id: 'role',
          label: 'Role',
        },
        {
          id: 'responsendedEmail',
          label: 'Email',
        },
      ]}
      data={tableData}
    />
  );
};

export const ViewSurveyDetail = ({ survey }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
    <Scrollbar sx={{ height: '500px' }}>
      <Typography variant="h6" mb={1}>
        Audience Details
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Card sx={{ p: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Iconify icon="mdi:bullhorn-outline" className="text-gray-500 w-6 h-6" />
            <Typography variant="h6" className="font-semibold">
              {survey?.surveyTitle}
            </Typography>
          </Box>
          <hr className="my-6 border-gray-200" />
          <DetailRow
            label="Description"
            icon="mdi:text-box-outline"
            value={
              <Typography variant="body2" className="text-gray-700">
                {survey?.description}
              </Typography>
            }
          />
          <DetailRow
            label="Audience"
            icon="mdi:account-group-outline"
            value={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {survey?.audience?.map((aud: any) => (
                  <Chip key={aud} label={aud} size="small" variant="outlined" />
                ))}
              </Box>
            }
          />

          <DetailRow
            label="Response Rate"
            icon="mdi:information-outline"
            value={
              <Label
                variant="soft"
                color={
                  survey?.status === 'Active'
                    ? 'primary'
                    : survey?.status === 'Pending'
                      ? 'warning'
                      : survey?.status === 'Closed'
                        ? 'error'
                        : 'default'
                }
              >
                {survey?.responseRate}
              </Label>
            }
          />
        </Card>
      </Box>
      <Typography variant="h6" mb={1} mt={1}>
        Responses Details
      </Typography>
      <ResponseComponent />
      <AnalyticsCurrentVisits
        title="Analysis Chart"
        chart={{
          series: [
            { label: 'Question 1', value: 35 },
            { label: 'Question 2', value: 25 },
            { label: 'Question 3', value: 15 },
            { label: 'Question 4', value: 50 },
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Scrollbar>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button variant="contained">Close Survey</Button>
      <Button variant="contained">Download Responses</Button>
    </Box>
  </Box>
);

const SurveyDetails = ({ formik }: any) => {
  // Fetch class data using custom hook that combines query and mutation functionality
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Array containing all available organization levels in the education system
  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  // State to track if all organizations are selected by comparing current selection length with total organizations
  const [isAllOrganizationSelected, setIsAllOrganiationSelected] = useState(
    formik.values?.organization?.length === allOrganizations.length
  );

  // State to track if all classes are selected by comparing current selection length with total available classes
  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    formik.values?.className?.length === classData?.items?.length
  );
  /**
   * Handles changes in organization selection
   * If 'all' or 'deselectAll' is selected, toggles between selecting all organizations or none
   * Otherwise updates the selected organizations and checks if all organizations are selected
   * @param selectedValues - Array of selected organization values
   */
  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllOrganizationSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllOrganiationSelected(!isAllOrganizationSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllOrganiationSelected(selectedValues.length === allOrganizations.length);
    }
  };

  /**
   * Handles changes in class selection
   * If 'all' or 'deselectAll' is selected, toggles between selecting all classes or none
   * Otherwise updates the selected classes and checks if all classes are selected
   * @param selectedValues - Array of selected class values
   */
  const handleClass = (selectedValues: string[]) => {
    const allClassesValues = classData?.items?.map((org: any) => org.name);
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      if (isAllClassesSelected) {
        formik.setFieldValue('className', []);
      } else {
        formik.setFieldValue('className', allClassesValues);
      }
      setIsAllClassesSelected(!isAllClassesSelected);
    } else {
      formik.setFieldValue('className', selectedValues);
      setIsAllClassesSelected(selectedValues.length === allClassesValues.length);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Survey Title"
            name="surveyTitle"
            value={formik.values.surveyTitle}
            onChange={formik.handleChange}
            error={formik.touched.surveyTitle && Boolean(formik.errors.surveyTitle)}
            helperText={formik.touched.surveyTitle && formik.errors.surveyTitle}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Select Organizations"
            options={[
              {
                value: isAllOrganizationSelected ? 'deselectAll' : 'all',
                label: isAllOrganizationSelected ? 'Deselect All' : 'All',
              },
              ...allOrganizations,
            ]}
            value={formik.values.organization}
            onChange={(val: any) => {
              handleOrganizationChange(val as string[]);
            }}
            multiple
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.organization && formik.errors.organization && (
            <FormHelperText error>{String(formik.errors.organization)}</FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            options={[
              {
                id: isAllClassesSelected ? 'deselectAll' : 'all',
                name: isAllClassesSelected ? 'Deselect All' : 'All',
              },
              ...(classData?.items || []),
            ]}
            value={formik.values.className}
            onChange={(val) => {
              handleClass(val as string[]);
            }}
            label="Class"
            isLoading={isLoading}
            multiple
            labelKey="name"
            valueKey="name"
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.className && formik.errors.className && (
            <FormHelperText error>{formik.errors.className}</FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Select Audience"
            options={[
              { value: 'Staff', label: 'Staff' },
              { value: 'Students', label: 'Students' },
              { value: 'Parents', label: 'Parents' },
            ]}
            multiple
            value={formik.values.audience}
            onChange={(val) => {
              formik.setFieldValue('audience', val);
            }}
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.audience && formik.errors.audience && (
            <FormHelperText>{formik.errors.audience}</FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Survey Description"
            name="description"
            multiline
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            size="small"
            rows={4}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * QuestionList Component
 *
 * A component that displays a list of survey questions in a draggable table format.
 * Supports drag and drop reordering, question deletion, and displays question details.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.questions - Array of question objects containing question details
 * @param {Function} props.onDragEnd - Callback function called when drag and drop operation ends
 * @param {Function} props.onDeleteQuestion - Callback function to handle question deletion
 *
 * @returns {JSX.Element} Returns either a table with questions or a message if no questions exist
 */
const QuestionList = ({ questions, onDragEnd, onDeleteQuestion }: any) => {
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
              <TableCell sx={{ width: '30%', fontWeight: 'bold' }}>Action</TableCell>
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
                          <Typography variant="body1">{question.question}</Typography>
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
                          <ThreeDotsActions
                            // actions={(prop) => actions({ ...props, row })}
                            placement="right-top"
                            showEditIcon
                            showDeleteIcon
                            showThreeDots={false}
                            handleViewClick={() => {}}
                            handleEditClick={() => {
                              // addAnounsmentDialog.onTrue();
                              // setEditingAnnouncement(row);
                            }}
                            handleDeleteClick={() => {
                              onDeleteQuestion(index);
                            }}
                          />
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

// Component for building and managing survey questions
const QuestionBuilder = ({ formik }: any) => {
  const addQuestionDialog = useBoolean();

  // Adds a new question to the survey
  const handleAddQuestion = (newQuestion: any) => {
    formik.setFieldValue('questions', [...formik.values.questions, newQuestion]);
    addQuestionDialog.onFalse();
  };

  // Handles drag and drop reordering of questions
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formik.values.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    formik.setFieldValue('questions', items);
  };

  // Removes a question from the survey
  const handleDeleteQuestion = (indexToDelete: number) => {
    formik.setFieldValue(
      'questions',
      formik.values.questions.filter((_: any, index: number) => index !== indexToDelete)
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{formik.values.surveyTitle}</Typography>{' '}
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
        <AddNewQuestion onSave={handleAddQuestion} />
      </CustomDialog>

      <QuestionList
        questions={formik.values.questions}
        onDragEnd={handleDragEnd}
        onDeleteQuestion={handleDeleteQuestion}
      />
    </Box>
  );
};

// Component for creating new survey questions with various types and options
const AddNewQuestion = ({ onSave }: any) => {
  // State management for question form
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [options, setOptions] = useState(['']);
  const [isRequired, setIsRequired] = useState(false);
  const [errors, setErrors] = useState({
    question: '',
    questionType: '',
    options: '',
  });

  // Updates question type and resets options based on type
  const handleQuestionTypeChange = (value: any) => {
    setQuestionType(value);
    if (value === 'multiple-choice') {
      setOptions(['']);
    } else {
      setOptions([]);
    }
    setErrors({ ...errors, questionType: '' });
  };

  // Manages multiple choice options
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setErrors({ ...errors, options: '' });
  };

  // Adds a new option for multiple choice questions
  const handleAddOption = () => {
    setOptions([...options, '']);
    setErrors({ ...errors, options: '' });
  };

  // Removes an option from multiple choice questions
  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  };

  // Validates all form fields before saving
  const validateFields = () => {
    let isValid = true;
    const newErrors = { question: '', questionType: '', options: '' };

    if (!question.trim()) {
      newErrors.question = 'Question is required';
      isValid = false;
    }

    if (!questionType) {
      newErrors.questionType = 'Question type is required';
      isValid = false;
    }

    if (questionType === 'multiple-choice') {
      if (options.length < 2) {
        newErrors.options = 'At least two options are required';
        isValid = false;
      } else if (options.some((opt) => !opt.trim())) {
        newErrors.options = 'Options cannot be empty';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Saves the question if validation passes
  const handleSaveQuestion = () => {
    if (validateFields()) {
      const newQuestion = {
        question,
        questionType,
        options,
        isRequired,
      };
      onSave(newQuestion);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Scrollbar sx={{ height: '250px' }}>
        <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column', p: 2 }}>
          <TextField
            fullWidth
            label="Question"
            name="question"
            onChange={(e) => setQuestion(e.target.value)}
            size="small"
            required
            error={!!errors.question}
            helperText={errors.question}
          />
          <CustomSelect
            label="Question Type"
            options={[
              { value: 'multiple-choice', label: 'multiple-choice' },
              { value: 'rating', label: 'rating' },
              { value: 'descriptive', label: 'descriptive' },
            ]}
            value={questionType}
            onChange={handleQuestionTypeChange}
            required
            formControlProps={{
              fullWidth: true,
              sx: { minWidth: '200px' },
              error: !!errors.questionType,
            }}
          />
          {errors.questionType && <FormHelperText error>{errors.questionType}</FormHelperText>}

          {questionType === 'multiple-choice' && (
            <Box>
              {options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex' }}>
                    <TextField
                      label={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      required
                      error={!!errors.options}
                    />
                    <IconButton
                      onClick={() => handleRemoveOption(index)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="mdi:trash" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {errors.options && (
                <FormHelperText
                  error
                  sx={{
                    mb: 5,
                  }}
                >
                  {errors.options}
                </FormHelperText>
              )}
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={handleAddOption}
                size="small"
                sx={{ mt: 3 }}
              >
                Add Option
              </Button>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            <Button variant="contained" onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </Box>
        </Box>
      </Scrollbar>
    </Box>
  );
};

// Component for previewing and publishing the survey
const PreviewAndPublish = ({ formik }: any) => {
  // State for managing question table data
  const [questionTableData, setQuestionTableData] = useState(formik.values.questions);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Typography variant="h6">{formik.values.surveyTitle}</Typography>{' '}
      <CustomizableTable
        tableId="questionTable"
        columns={[
          { id: 'question', label: 'Question' },
          { id: 'questionType', label: 'Question Type' },
        ]}
        data={questionTableData}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="Start Date"
          name="startDate"
          value={formik.values.startDate}
          format="DD/MM/YYYY"
          onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
          slotProps={{
            textField: {
              size: 'small',
              helperText: formik.touched.startDate && (formik.errors.startDate as string),
              error: formik.touched.startDate && Boolean(formik.errors.startDate),
            },
          }}
        />

        <DatePicker
          label="End Date"
          name="endDate"
          value={formik.values.endDate}
          format="DD/MM/YYYY"
          onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
          slotProps={{
            textField: {
              size: 'small',
              helperText: formik.touched.endDate && (formik.errors.endDate as string),
              error: formik.touched.endDate && Boolean(formik.errors.endDate),
            },
          }}
        />
      </Box>
    </Box>
  );
};
const allSurveySteps = [SurveyDetails, QuestionBuilder, PreviewAndPublish];

const AddNewSurvey = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      initialValues={{
        surveyTitle: '',
        description: '',
        surveyType: '',
        audience: [],
        className: [],
        organization: [],
        questions: [],
        startDate: null,
        endDate: null,
      }}
      steps={['Create New Survey', 'Create Question', 'Preview and Submit']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      // validationSchema={yup.object().shape({})}
      validationSchema={validationSchema[activeStep as unknown as keyof typeof validationSchema]}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allSurveySteps[step];
        return (
          <Box p={2}>
            <StepComponent formik={formik} />
          </Box>
        );
      }}
    />
  );
};

export default AddNewSurvey;
