import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';

import { useState } from 'react';
import { useFormik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  Switch,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
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
import { Upload, UploadBox } from 'src/components/upload';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';

const Assignment = () => {
  const isCalendarView = useBoolean(true);
  const dialog = useBoolean();
  const handleSubmit = () => {
    console.log('handle Submit calls');
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Upcoming Assignments & Deadlines</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 2 }}>List View</Typography>
          <Switch
            inputProps={{ 'aria-label': 'Toggle view' }}
            checked={isCalendarView.value}
            onChange={() => isCalendarView.onToggle()}
          />
          <Typography sx={{ ml: 1 }}>Calendar View</Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
              mb: 1,
            }}
          >
            <Button color="secondary" variant="contained">
              Adjust Deadline
            </Button>
            <Button color="primary" variant="contained">
              Upcoming Assignement
            </Button>

            <Button color="error" variant="contained">
              Export List
            </Button>
          </Box>
        </Box>
      </Box>

      {isCalendarView.value ? (
        <CalendarView />
      ) : (
        <CustomizableTable
          columns={[
            { id: 'assignmentTitle', label: 'Assignment Title' },
            { id: 'course', label: 'Course' },
            { id: 'dueDate', label: 'Due Date' },
            {
              id: 'status',
              label: 'Status',
              render: (value, row: any) => (
                <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              render: (value, row: any) => (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="mdi:eye" sx={{ mr: 2 }} />
                        View Assignment
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:pencil" sx={{ mr: 2 }} />
                        Grade Assignment
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:bell" sx={{ mr: 2 }} />
                        Send Reminder
                      </MenuItem>
                    </MenuList>
                  )}
                />
              ),
            },
          ]}
          data={[
            {
              assignmentTitle: 'Assignment 1',
              course: 'Course 1',
              dueDate: '2021-01-01',
              status: 'Pending',
            },
          ]}
        />
      )}
      <Typography variant="h6" marginBottom={1}>
        Create Assignment
      </Typography>
      <Button variant="contained" onClick={dialog.onTrue}>
        Create Assignment
      </Button>

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create New Assignment"
      >
        <AssignmentForm onsubmit={handleSubmit} />
      </CustomDialog>
    </Box>
  );
};

export default Assignment;

const TitleAndDescription = () => (
  <Box display="flex" gap={2}>
    <TextField label="Assignment Title" />
    <TextField label="Assignment Description" />
  </Box>
);

const AttachMaterials = () => <Upload />;

const SetDueDate = () => <DatePicker label="Due Date" format="DD-MM-YYYY" />;

const AssignToClassSection = () => (
  <Box display="flex" gap={2}>
    <CustomSelect
      options={[]}
      value=""
      label="Assign To Class"
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
    />
    <CustomSelect
      options={[]}
      value=""
      label="Assign To Section"
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
    />
  </Box>
);

const SetEvaluationCriteria = () => (
  <>
    <Box display="flex" gap={2}>
      <CustomSelect
        options={[]}
        value=""
        label="Points"
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        size="small"
      />
      <CustomSelect
        options={[]}
        value=""
        label="Weightage"
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        size="small"
      />
      <TextField label="Feedback" size="small" />
    </Box>
    <Box mt={2}>
      <FormControlLabel control={<Checkbox />} label="Include predefined rubrics" />
    </Box>
  </>
);

const allStep = [
  TitleAndDescription,
  AttachMaterials,
  SetDueDate,
  AssignToClassSection,
  SetEvaluationCriteria,
];

interface TAssignment {
  assignmentTitle: string;
  assignmentDesc: string;
  fieldName: string;
  description: string;
  dueDate: Dayjs | null;
  class: string;
  division: string;
  points: string;
  weightage: string;
  feedback: string;
}
const assignmentInitialValues: TAssignment = {
  assignmentTitle: '',
  assignmentDesc: '',
  fieldName: '',
  description: '',
  dueDate: null,
  class: '',
  division: '',
  points: '',
  weightage: '',
  feedback: '',
};
interface AssessmentFormProps {
  onsubmit: (values: TAssignment) => void;
}

// eslint-disable-next-line react/prop-types
const AssignmentForm: React.FC<AssessmentFormProps> = ({ onsubmit }) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
  const [points, setPoints] = useState<string>('');
  const [weightage, setWeightage] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    onSubmit: (values) => {
      console.log('values-------------', values);
    },
  });

  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Assignment Title"
                size="small"
                name="assignmentTitle"
                value={formik.values.assignmentTitle}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Assignment Description"
                fullWidth
                multiline
                rows={4}
                name="assignmentDesc"
                value={formik.values.assignmentDesc}
                onChange={formik.handleChange}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <UploadBox
              onDrop={() => {}}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">Drag Your Document</Typography>
                </Box>
              }
              sx={{
                py: 2.5,
                width: '100%',
                height: 'auto',
                borderRadius: 1.5,
              }}
            />
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Field Name"
                size="small"
                name="fieldName"
                fullWidth
                onChange={formik.handleChange}
                value={formik.values.fieldName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                name="Desc"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Due Date"
                name="dueDate"
                value={formik.values.dueDate}
                format="DD/MM/YYYY"
                sx={{ width: '100%', minWidth: '270px' }}
                onChange={(newValue) => formik.setFieldValue('dueDate', newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    helperText: formik.touched.dueDate && (formik.errors.dueDate as string),
                    error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Division"
                disabled={!formik.values.class}
                labelKey="name"
                valueKey="id"
                multiple
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  const selectedDivision = divisionOptions.find((i: Division) => i.id === val);
                  formik.setFieldValue('division', selectedDivision?.name || '');
                  setDivision(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Points"
                options={[
                  { value: '10', label: '10' },
                  { value: '9', label: '9' },
                ]}
                name={points}
                value={formik.values.points}
                isLoading={isLoading}
                onChange={(val) => {
                  setPoints(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Weightage"
                options={[
                  { value: '10', label: '10' },
                  { value: '9', label: '9' },
                  { value: '20', label: '20' },
                  { value: '15', label: '15' },
                  { value: '30', label: '30' },
                  { value: '25', label: '25' },
                ]}
                value={weightage}
                isLoading={isLoading}
                onChange={(val) => {
                  setWeightage(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Feedback"
                size="small"
                name="feedback"
                value={formik.values.feedback}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Include Predefined Rubrics</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            onsubmit(formik.values);
          }}
          color="warning"
        >
          Save As Draft
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onsubmit(formik.values);
          }}
        >
          Publish to Students
        </Button>
      </DialogActions>
    </Box>
  );
};
