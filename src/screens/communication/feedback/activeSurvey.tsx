import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as yup from 'yup';
import React, { useState } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import {
  Box,
  Chip,
  Grid,
  Table,
  Paper,
  Button,
  Divider,
  MenuItem,
  MenuList,
  TableRow,
  TableCell,
  TextField,
  TableHead,
  TableBody,
  Typography,
  IconButton,
  FormHelperText,
  TableContainer,
  CircularProgress,
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

interface Survey {
  id: number;
  surveyTitle: string;
  organization: string[];
  classes: string[];
  audience: string[];
  startDate: string;
  endDate: string;
  responseRate: number;
  status: 'Pending' | 'Active' | 'Closed';
}

const surveyData: Survey[] = [
  {
    id: 1,
    surveyTitle: 'Student Feedback Survey',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Students', 'Parents'],
    startDate: dayjs().subtract(10, 'days').toISOString(),
    endDate: dayjs().add(20, 'days').toISOString(),
    responseRate: 45,
    status: 'Active',
  },
  {
    id: 2,
    surveyTitle: 'Teacher Evaluation Survey',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Teachers'],
    startDate: dayjs().subtract(30, 'days').toISOString(),
    endDate: dayjs().add(10, 'days').toISOString(),
    responseRate: 78,
    status: 'Pending',
  },
  {
    id: 3,
    surveyTitle: 'Parent Feedback Survey',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Parents'],
    startDate: dayjs().subtract(40, 'days').toISOString(),
    endDate: dayjs().subtract(5, 'days').toISOString(),
    responseRate: 92,
    status: 'Closed',
  },
  {
    id: 4,
    surveyTitle: 'Staff Satisfaction Survey',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Staff', 'Administrators'],
    startDate: dayjs().subtract(20, 'days').toISOString(),
    endDate: dayjs().add(15, 'days').toISOString(),
    responseRate: 50,
    status: 'Active',
  },
];

const ActiveSurvey = (props: TabComponentType) => {
  const [surveyTableData, setSurveyTableData] = useState(surveyData);
  const addNewSurveyDialog = useBoolean();
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Active Survey</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          onClick={() => {
            addNewSurveyDialog.onTrue();
          }}
        >
          Add New Survey
        </Button>
      </Box>

      <CustomizableTable
        columns={[
          { id: 'surveyTitle', label: 'Survey Title' },
          { id: 'audience', label: 'Audience' },
          {
            id: 'startDate',
            label: 'Start Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'endDate',
            label: 'End Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'responseRate',
            label: 'Response Rate',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'status',
            label: 'Status',
            render: (value: string) => (
              <Label
                variant="soft"
                color={
                  value === 'Pending'
                    ? 'warning'
                    : value === 'Active'
                      ? 'success'
                      : value === 'Closed'
                        ? 'error'
                        : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        //   addAnounsmentDialog.onTrue();
                        //   setEditingAnnouncement(row);
                      }}
                    >
                      View Responses
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        //   addAnounsmentDialog.onTrue();
                        //   setEditingAnnouncement(row);
                      }}
                    >
                      <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
                      Close Survey
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={surveyTableData}
      />

      <CustomDialog
        maxWidth="lg"
        open={addNewSurveyDialog.value}
        handleClose={addNewSurveyDialog.onFalse}
        title="New Survey"
      >
        <AddNewSurvey />
      </CustomDialog>
    </Box>
  );
};

export default ActiveSurvey;

const SurveyDetails = ({ formik }: any) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  const [isAllOrganizationSelected, setIsAllOrganiationSelected] = useState(
    formik.values?.organization?.length === allOrganizations.length
  );

  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    formik.values?.className?.length === classData?.items?.length
  );

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
                id: isAllOrganizationSelected ? 'deselectAll' : 'all',
                name: isAllOrganizationSelected ? 'Deselect All' : 'All',
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

const QuestionList = ({ questions, onDragEnd }: any) => {
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

const QuestionBuilder = ({ formik }: any) => {
  const addQuestionDialog = useBoolean();

  console.log('formik values-----', formik.values);

  const handleAddQuestion = (newQuestion: any) => {
    formik.setFieldValue('questions', [...formik.values.questions, newQuestion]);
    addQuestionDialog.onFalse();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formik.values.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    formik.setFieldValue('questions', items);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{formik.values.surveyTitle}</Typography>{' '}
        <Button variant="contained" onClick={() => addQuestionDialog.onTrue()}>
          Add Question
        </Button>
      </Box>

      <CustomDialog
        maxWidth="sm"
        open={addQuestionDialog.value}
        handleClose={addQuestionDialog.onFalse}
        title="New Survey"
      >
        <AddNewQuestion onSave={handleAddQuestion} />
      </CustomDialog>

      <QuestionList questions={formik.values.questions} onDragEnd={handleDragEnd} />
    </Box>
  );
};

const AddNewQuestion = ({ onSave }: any) => {
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [options, setOptions] = useState(['']);

  const handleQuestionTypeChange = (event: any) => {
    setQuestionType(event.target.value);
    if (event.target.value === 'multiple-choice') {
      setOptions(['']);
    } else {
      setOptions([]);
    }
  };

  const handleOptionChange = (index: any, value: any) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: any) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSaveQuestion = () => {
    const newQuestion = {
      question,
      questionType,
      options,
    };
    onSave(newQuestion);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Scrollbar sx={{ height: '150px' }}>
        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <TextField
            fullWidth
            label="Question"
            name="question"
            onChange={(e) => setQuestion(e.target.value)}
            size="small"
          />
          <CustomSelect
            label="Question Type"
            options={[
              { value: 'multiple-choice', label: 'multiple-choice' },
              { value: 'rating', label: 'rating' },
              { value: 'descriptive', label: 'descriptive' },
            ]}
            value={questionType}
            onChange={(val) => {
              setQuestionType(val as string);
            }}
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />

          {questionType === 'multiple-choice' && (
            <Box>
              {options.map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: 2 }}
                >
                  <TextField
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <IconButton onClick={() => handleRemoveOption(index)} size="small" color="error">
                    <Iconify icon="mdi:close" />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={handleAddOption}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </Box>
        </Box>
      </Scrollbar>
    </Box>
  );
};

const PreviewAndPublish = ({ formik }: any) => {
  const [questionTableData, setQuestionTableData] = useState(formik.values.questions);
  console.log('question table data---', questionTableData);

  return (
    <CustomizableTable
      columns={[
        { id: 'question', label: 'Question' },
        { id: 'questionType', label: 'Question Type' },
      ]}
      data={questionTableData}
    />
  );
};

const allSurveySteps = [SurveyDetails, QuestionBuilder, PreviewAndPublish];

const AddNewSurvey = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      initialValues={{
        surveyTitle: [],
        description: '',
        surveyType: '',
        audience: [],
        className: [],
        organization: [],
        questions: [],
        startDate: null,
        endDate: '',
      }}
      steps={['Create New Survey', 'Create Question', 'Preview and Submit']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
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
