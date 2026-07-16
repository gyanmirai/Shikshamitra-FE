import type { TabComponentType } from 'src/screens/hr/leave-request';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  Divider,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
  LinearProgress,
  DialogContentText,
} from '@mui/material';

interface Grade {
  id: number;
  grade: string;
  range: string;
  startRange: number;
  endRange: number;
}

const tableGrades: Grade[] = [
  { id: 1, grade: 'A+', range: '95-100', startRange: 95, endRange: 100 },
  { id: 2, grade: 'A', range: '90-94', startRange: 90, endRange: 94 },
  { id: 3, grade: 'B+', range: '85-89', startRange: 85, endRange: 89 },
];

const Setting = (props: TabComponentType) => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const dialog = useBoolean();
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
    const startRange = Number(values.startRange);
    const endRange = Number(values.endRange);

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
      };
      setGrades((prevGrades) => [...prevGrades, newGrade]);
    }

    handleCloseDialog();
  };

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" my={1}>
            Grading Scales
          </Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => dialog.onTrue()}>
            Add Grade Scale
          </Button>
        </Box>

        <CustomizableTable
          tableId="grade-table"
          columns={[
            { id: 'grade', label: 'Grade' },
            { id: 'range', label: 'Range' },
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
      </Grid>

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
        />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Grade"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Grade {selectedGrade?.grade}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Weighting Adjustments
          </Typography>
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[
              { value: 'homework', label: 'Homework' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'exam', label: 'Exam' },
              { value: 'project', label: 'Project' },
            ]}
            value="homework"
            onChange={() => {}}
            label="Assignment Types"
          />
          &nbsp;
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[
              { value: 'percentage', label: 'Percentage' },
              { value: 'point', label: 'Point' },
            ]}
            value=""
            onChange={() => {}}
            label="Weighting Inputs"
          />
          <Typography variant="h6" my={1}>
            Progress Visualization
          </Typography>
          <Box sx={{ width: '100%', my: 2 }}>
            <LinearProgress variant="determinate" value={75} /> 75%
          </Box>
          <Button variant="contained">Add new categories</Button>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Grade Submission Settings
          </Typography>
          <DatePicker
            sx={{ maxWidth: '250px', width: '100%', my: 1 }}
            label="Select Date"
            slotProps={{ textField: { size: 'small' } }}
          />
          &nbsp;
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[
              { value: 'homework', label: 'Homework' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'exam', label: 'Exam' },
              { value: 'project', label: 'Project' },
            ]}
            value="homework"
            onChange={() => {}}
            label="Assignment Types"
          />
          &nbsp;
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[]}
            value=""
            onChange={() => {}}
            label="Who is allowed to submit or edit grades"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Switch
              checked={false}
              onChange={() => {}}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography sx={{ mr: 2 }}>
              Reminders about upcoming grade submission deadlines
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" my={1}>
          Notifications & Alerts
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1">Missing Grades Alert</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
            <Typography>Missing grades</Typography>
          </Box>
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[
              { value: 'homework', label: 'Homework' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'exam', label: 'Exam' },
              { value: 'project', label: 'Project' },
            ]}
            value="homework"
            onChange={() => {}}
            label="Frequency"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1">Overdue Assessments Alert</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
            <Typography>Overdue assessments</Typography>
          </Box>
          <CustomSelect
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', my: 1 } }}
            options={[
              { value: 'homework', label: 'Homework' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'exam', label: 'Exam' },
              { value: 'project', label: 'Project' },
            ]}
            value="homework"
            onChange={() => {}}
            label="Time-based alerts"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1">Performance Alerts</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
            <Typography>Low-performance alerts</Typography>
          </Box>
          <TextField
            label="alert if students drop below 60%"
            size="small"
            sx={{ maxWidth: '250px', width: '100%', my: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 4 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle1">Performance Alerts</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
              <Typography>Email notification</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
              <Typography>SMS notification</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
              <Typography>Dashboard notification</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined">Reset</Button>
            <Button variant="contained">Save</Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Setting;

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
  });

  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      startRange: data?.startRange || '',
      endRange: data?.endRange || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
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
