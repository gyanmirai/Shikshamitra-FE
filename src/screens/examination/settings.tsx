import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  Checkbox,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { TabComponentType } from '../hr/leave-request';

interface Grade {
  id: number;
  grade: string;
  range: string;
  startRange: number;
  endRange: number;
  descriptiveScale: string;
}

const tableGrades: Grade[] = [
  {
    id: 1,
    grade: 'A+',
    range: '95-100',
    startRange: 95,
    endRange: 100,
    descriptiveScale: 'Outstanding',
  },
  {
    id: 2,
    grade: 'A',
    range: '90-94',
    startRange: 90,
    endRange: 94,
    descriptiveScale: 'Satisfactory',
  },
  {
    id: 3,
    grade: 'B+',
    range: '85-89',
    startRange: 85,
    endRange: 89,
    descriptiveScale: 'Need Improvement',
  },
];

const initialRubricData = [
  {
    id: 1, // Unique identifier for each row
    class: '10',
    subjectName: 'Mathematics',
    pointScale: 5,
    objective: 'Assess problem-solving skills.',
    rubricDescription: 'Evaluate students on accuracy, clarity, and methodology.',
    date: '2024-12-15',
    status: true, // Published
  },
  {
    id: 2,
    class: '9',
    subjectName: 'Science',
    pointScale: 3,
    objective: 'Test understanding of basic scientific concepts.',
    rubricDescription: 'Focus on explanation, logic, and application.',
    date: '2024-12-16',
    status: false, // Unpublished
  },
  {
    id: 3,
    class: '11',
    subjectName: 'History',
    pointScale: 4,
    objective: 'Evaluate analytical and critical thinking skills.',
    rubricDescription: 'Assess argument quality, use of evidence, and historical accuracy.',
    date: '2024-12-18',
    status: true, // Published
  },
  {
    id: 4,
    class: '8',
    subjectName: 'English',
    pointScale: 6,
    objective: 'Assess comprehension and writing skills.',
    rubricDescription: 'Evaluate grammar, coherence, and creativity in essays.',
    date: '2024-12-19',
    status: false, // Unpublished
  },
  {
    id: 5,
    class: '12',
    subjectName: 'Physics',
    pointScale: 10,
    objective: 'Measure understanding of core physics concepts.',
    rubricDescription: 'Evaluate derivations, calculations, and practical examples.',
    date: '2024-12-20',
    status: true, // Published
  },
];

const Settings = (props: TabComponentType) => {
  const rubricDialog = useBoolean();
  const dialog = useBoolean();
  const [rubricData, setRubricData] = useState(initialRubricData);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const deleteConfirmDialog = useBoolean();
  const [grades, setGrades] = useState<Grade[]>(tableGrades);

  const handleCloseDialog = () => {
    setSelectedGrade(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedGrade) {
      setGrades(grades.filter((grade) => grade.id !== selectedGrade.id));
      deleteConfirmDialog.onFalse();
      setSelectedGrade(null);
    }
  };

  const handleSubmit = (values: any) => {
    console.log('values----', values);

    const startRange = Number(values.startRange);
    const endRange = Number(values.endRange);
    const { descriptiveScale } = values;

    if (startRange >= endRange) {
      alert('Start range must be less than end range');
      return;
    }

    const hasOverlap = grades.some((g) => {
      if (isEdit && selectedGrade?.id === g.id) return false;
      return (
        (startRange >= g.startRange && startRange <= g.endRange) ||
        (endRange >= g.startRange && endRange <= g.endRange) ||
        (startRange <= g.startRange && endRange >= g.endRange)
      );
    });

    if (hasOverlap) {
      alert('Grade ranges cannot overlap');
      return;
    }

    if (isEdit && selectedGrade) {
      // Update existing grade
      setGrades((prevGrades) =>
        prevGrades.map((g) =>
          g.id === selectedGrade.id
            ? {
                ...g,
                grade: values.grade,
                range: `${startRange}-${endRange}`,
                startRange,
                endRange,
                descriptiveScale,
              }
            : g
        )
      );
    } else {
      // Create new grade
      const newGrade: Grade = {
        id: Math.max(...grades.map((g) => g.id)) + 1,
        grade: values.grade,
        range: `${startRange}-${endRange}`,
        startRange,
        endRange,
        descriptiveScale,
      };
      setGrades((prevGrades) => [...prevGrades, newGrade]);
    }
    handleCloseDialog();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card sx={{ p: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" my={1}>
              Rubric Management
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={rubricDialog.onTrue}>
              Create Rubric
            </Button>
          </Box>
          <CustomizableTable
            tableId="rubric-table"
            columns={[
              { id: 'class', label: 'Class' },
              { id: 'subjectName', label: 'Subject Name' },
              { id: 'pointScale', label: 'Point Scale' },
              { id: 'objective', label: 'Objective' },
              { id: 'rubricDescription', label: 'Rubric Description' },
              { id: 'date', label: 'Date' },
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
                id: 'action',
                label: 'Action',
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={({ popover }: any) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              //   modal.onTrue();
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                            View Details
                          </MenuItem>
                          {!row.status && (
                            <>
                              <MenuItem
                                onClick={() => {
                                  //   confirm.onTrue();
                                  popover.onClose();
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Iconify
                                  icon="solar:trash-bin-trash-bold"
                                  sx={{ height: '16px', width: '16px' }}
                                />
                                Delete
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  //   modal.onTrue();
                                  popover.onClose();
                                }}
                              >
                                <Iconify
                                  icon="solar:pen-bold"
                                  sx={{ height: '16px', width: '16px' }}
                                />
                                Edit
                              </MenuItem>
                            </>
                          )}
                        </MenuList>
                      )}
                    />
                  );
                },
              },
            ]}
            data={rubricData}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button variant="contained">Save</Button>
          </Box>

          <CustomDialog
            maxWidth="sm"
            open={rubricDialog.value}
            handleClose={rubricDialog.onFalse}
            title="Create Rubric"
          >
            <RubricCreationForm />
          </CustomDialog>
        </Box>
      </Card>
      <Card sx={{ p: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" my={1}>
              Grading Scales
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                dialog.onTrue();
                // setIsEdit(false);
                // setSelectedSubject(null);
              }}
            >
              Add Grade Scale
            </Button>
          </Box>
          <CustomizableTable
            tableId="grade-table"
            columns={[
              { id: 'grade', label: 'Grade' },
              {
                id: 'range',
                label: 'Range',
              },
              {
                id: 'descriptiveScale',
                label: 'Descriptive Scale',
              },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={({ popover: pop }) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            setSelectedGrade(row as any);
                            setIsEdit(true);
                            dialog.onTrue();
                          }}
                        >
                          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                          Edit
                        </MenuItem>

                        <MenuItem
                          onClick={() => {
                            setSelectedGrade(row as any);
                            deleteConfirmDialog.onTrue();
                            pop.onClose();
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            sx={{ height: '16px', width: '16px' }}
                          />
                          Delete
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                ),
              },
            ]}
            data={grades}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button variant="contained">Save</Button>
          </Box>

          <CustomDialog
            open={dialog.value}
            handleClose={handleCloseDialog}
            title={isEdit ? 'Update Grade' : 'Add Grade'}
          >
            <GradeForm
              onSubmit={handleSubmit}
              onClose={dialog.onFalse}
              data={selectedGrade}
              isEdit={isEdit}
            />{' '}
          </CustomDialog>

          <CustomDialog
            maxWidth="sm"
            open={deleteConfirmDialog.value}
            handleClose={handleCloseDialog}
            title="Delete Grade"
          >
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete Grade {selectedGrade?.grade} ?
              </DialogContentText>
            </DialogContent>{' '}
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleDelete} variant="contained" color="error">
                Delete
              </Button>
            </DialogActions>
          </CustomDialog>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={1}>
          <Grid container item spacing={3}>
            <Grid item xs={4}>
              <Typography variant="h5" gutterBottom>
                Assignment Preferences
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" gutterBottom>
                Rubric
              </Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={4}>
              <CustomSelect
                label="Templates"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 340 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="rubricTitle"
                label="Rubric Title"
                onChange={() => {}}
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="defaultDurationForExam"
                label="Default Duration For Exam"
                onChange={() => {}}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="rubricDescription"
                placeholder="Rubric Description"
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="criteriaName"
                label="Criteria Name"
                onChange={() => {}}
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={4}>
              <CustomSelect
                label="Late Submission Rule"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 340 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomSelect
                label="Performance Level"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 340 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="weightage"
                label="Weightage"
                onChange={() => {}}
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={4}>
              <CustomSelect
                label="Grading Scale"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 340 } }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch />
          <Typography>Re-evaluation Policy</Typography>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Setting Section
        </Typography>
        <Typography variant="h5" gutterBottom marginLeft="2px">
          Examination Section
        </Typography>
        <Grid container spacing={1}>
          <Grid container item spacing={3}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Examination Setting
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Assessment Setting
              </Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="defaultDurationForExam"
                label="Default Duration For Exam"
                onChange={() => {}}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="gradingRules"
                label="Grading Rules"
                onChange={() => {}}
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="gradingScale"
                label="Grading Scale"
                onChange={() => {}}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="submissionDeadlines"
                label="Submission Deadlines"
                onChange={() => {}}
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={3}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch />
                <Typography>Re-evaluation Policy</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <CustomSelect
                label="Rubric Templates"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 340 } }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
          <Typography>Overdue assessments</Typography>
        </Box>
        <Grid container direction="column" spacing={1}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Assessment Section
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Grading Rules"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 520 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="rubrics"
              style={{ width: '520px' }}
              label="Rubrics"
              onChange={() => {}}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="assesmentDeadline"
              label="Assesment Deadline"
              style={{ width: '520px' }}
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};
export default Settings;

const RubricCreationForm = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<any[]>([]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                options={classData?.items || []}
                value={classes}
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  //   formik.setFieldValue('className', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'history', label: 'History' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Point Scale"
                options={[
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' },
                  { value: '6', label: '6' },
                  { value: '7', label: '7' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rubric Objective"
                name="objective"
                value=""
                // onChange={formik.handleChange}
                // error={formik.touched.assesmentTitle && Boolean(formik.errors.assesmentTitle)}
                // helperText={formik.touched.assesmentTitle && formik.errors.assesmentTitle}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rubric Description"
                name="description"
                value=""
                // onChange={formik.handleChange}
                // error={formik.touched.assesmentTitle && Boolean(formik.errors.assesmentTitle)}
                // helperText={formik.touched.assesmentTitle && formik.errors.assesmentTitle}
                size="small"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={dayjs()}
                onChange={(val) => {
                  //   formik.setFieldValue('dueDate', val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    // error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                  },
                }}
                disablePast
              />
              {/* {formik.touched.dueDate && formik.errors.dueDate && (
                <FormHelperText error>{String(formik.errors.dueDate)}</FormHelperText>
              )} */}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button variant="contained">Generate Rubric</Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface GradeFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: Grade | null;
  isEdit: boolean;
}

const GradeForm: React.FC<GradeFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const validationSchema = Yup.object().shape({
    grade: Yup.string().required('Grade is Required'),
    startRange: Yup.string().required('Start Range is Required'),
    endRange: Yup.string().required('End Range is Required'),
    descriptiveScale: Yup.string().required('Descriptive Scale is Required'),
  });

  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      startRange: data?.startRange || '',
      endRange: data?.endRange || '',
      descriptiveScale: data?.descriptiveScale || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Grade"
                name="grade"
                size="small"
                value={formik.values.grade}
                onChange={formik.handleChange}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Range"
                name="startRange"
                size="small"
                value={formik.values.startRange}
                onChange={formik.handleChange}
                error={formik.touched.startRange && Boolean(formik.errors.startRange)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Range"
                name="endRange"
                size="small"
                value={formik.values.endRange}
                onChange={formik.handleChange}
                error={formik.touched.endRange && Boolean(formik.errors.endRange)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                fullWidth
                label="Descriptive Scale"
                name="descriptiveScale"
                size="small"
                options={[
                  { value: 'Outstanding', label: 'Outstanding' },
                  { value: 'Excellent', label: 'Excellent' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Satisfactory', label: 'Satisfactory' },
                  { value: 'Needs Improvement', label: 'Needs Improvement' },
                  { value: 'Fail', label: 'Fail' },
                ]}
                value={formik.values.descriptiveScale}
                onChange={(val) => {
                  formik.setFieldValue('descriptiveScale', val);
                }}
                formControlProps={{
                  sx: { width: '100%', mixWidth: '200px' },
                }}
                error={formik.touched.descriptiveScale && Boolean(formik.errors.descriptiveScale)}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Create
            </Button>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
