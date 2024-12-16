import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Button,
  Switch,
  MenuList,
  MenuItem,
  TextField,
  RadioGroup,
  Typography,
  ListItemText,
  DialogActions,
  DialogContent,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Assignment {
  class: string;
  division: string[];
  assignmentType: string;
  assignmentTitle: string;
  subject: string;
  assignmentDesc: string;
  dueDate: Dayjs | null;
  time: Dayjs | null;
  submissionType: string;
  status: string;
}

const assignmentInitialValues: Assignment = {
  class: '',
  division: [],
  assignmentType: '',
  assignmentTitle: '',
  subject: '',
  assignmentDesc: '',
  dueDate: null,
  time: null,
  submissionType: 'online_text',
  status: 'draft',
};

const initialData: Assignment[] = [
  {
    class: '10',
    division: ['A'],
    assignmentType: 'Homework',
    assignmentTitle: 'Math Homework 1',
    subject: 'Mathematics',
    assignmentDesc: 'Solve problems from Chapter 5',
    dueDate: dayjs('2024-12-10'),
    time: dayjs('2024-12-10T23:59:00'),
    submissionType: 'Online',
    status: 'draft',
  },
  {
    class: '9',
    division: ['B'],
    assignmentType: 'Quiz',
    assignmentTitle: 'Science Project',
    subject: 'Science',
    assignmentDesc: 'Prepare a model of the solar system',
    dueDate: dayjs('2024-12-15'),
    time: dayjs('2024-12-15T23:59:00'),
    submissionType: 'In-Person',
    status: 'publish',
  },
  {
    class: '8',
    division: ['C'],
    assignmentType: 'Homework',
    assignmentTitle: 'History Essay',
    subject: 'History',
    assignmentDesc: 'Write an essay on World War II',
    dueDate: dayjs('2024-12-20'),
    time: dayjs('2024-12-20T23:59:00'),
    submissionType: 'Online',
    status: 'draft',
  },
];

const HomeworkCreation = (props: TabComponentType) => {
  // const [publishStatus, setPublishStatus] = useState<{ [key: number]: boolean }>({});
  const dialog = useBoolean();
  const confirmDialog = useBoolean();
  const [assignmentData, setAssignmentData] = useState<Assignment[]>(initialData);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  console.log('assignemnt data---', assignmentData);

  const handleSwitchChange = (assignment: Assignment) => {
    console.log('handle switch change --', assignment);

    if (assignment.status === 'draft') {
      setSelectedAssignment(assignment);
      confirmDialog.onTrue();
    } else {
      const updatedAssignments = assignmentData.map((item) =>
        item.assignmentTitle === assignment.assignmentTitle ? { ...item, status: 'draft' } : item
      );
      setAssignmentData(updatedAssignments);
    }
  };

  const handleConfirmStatusChange = () => {
    console.log('handleConfirmStatusChange---');

    if (selectedAssignment) {
      const updatedAssignments = assignmentData.map((item) =>
        item.assignmentTitle === selectedAssignment.assignmentTitle
          ? { ...item, status: 'publish' }
          : item
      );
      setAssignmentData(updatedAssignments);
    }
    confirmDialog.onFalse();
    setSelectedAssignment(null);
  };
  const handleSubmit = (values: Assignment, status: 'draft' | 'publish') => {
    console.log('handle submit calls===', values, status);
    const updatedValues = { ...values, status };
    setAssignmentData([...assignmentData, updatedValues]);
    dialog.onFalse();
  };
  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
          Create Assignment
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          {
            id: 'division',
            label: 'Division',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip key={audience} label={audience} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          { id: 'assignmentTitle', label: 'Assignment Title' },
          { id: 'subject', label: 'Subject' },
          { id: 'assignmentDesc', label: 'Assignment Description' },
          {
            id: 'dueDate',
            label: 'Due Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'time',
            label: 'Time',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          { id: 'submissionType', label: 'Submission Type' },
          {
            id: 'status',
            label: 'Publish',
            render(value, row) {
              console.log('row ---', row);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    size="small"
                    checked={row.status === 'publish'}
                    onChange={(e) => {
                      handleSwitchChange(row as Assignment);
                    }}
                    inputProps={{ 'aria-label': 'Toggle view' }}
                  />
                </Box>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="solar:pen-bold" />
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={assignmentData}
      />
      <CustomDialog
        title="New Assignment"
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
      >
        <HomeWorkCreationForm onsubmit={handleSubmit} />
      </CustomDialog>
      <CustomDialog
        title="Confirm Publication"
        open={confirmDialog.value}
        handleClose={confirmDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to publish Assignment ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default HomeworkCreation;

interface HomeWorkCreationFormProps {
  onsubmit: (values: Assignment, status: 'draft' | 'publish') => void;
}

const HomeWorkCreationForm: React.FC<HomeWorkCreationFormProps> = ({ onsubmit }) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
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
                  const selectedDivision = divisionOptions.find((i: Division) =>
                    (val as string[]).includes(i.id)
                  );
                  formik.setFieldValue('division', selectedDivision?.name || '');
                  setDivision(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                ]}
                value={formik.values.subject}
                onChange={(val) => {
                  formik.setFieldValue('subject', val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Assignment Type"
                options={[
                  { value: 'homework', label: 'Homework' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'exam', label: 'Exam' },
                ]}
                value={formik.values.assignmentType}
                onChange={(val) => {
                  formik.setFieldValue('assignmentType', val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Assignment Title"
                size="small"
                name="assignmentTitle"
                value={formik.values.assignmentTitle}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Assignment Description"
            fullWidth
            multiline
            rows={3}
            name="assignmentDesc"
            value={formik.values.assignmentDesc}
            onChange={formik.handleChange}
          />
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DatePicker
                name="dueDate"
                label="Due Date"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                format="DD/MM/YYYY"
                value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null}
                onChange={(date) => {
                  const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                  formik.setFieldValue('dueDate', formattedDate);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                name="time"
                label="Time Picker"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                value={formik.values.time ? dayjs(formik.values.time) : null}
                onChange={(time) => {
                  const formattedTime = time ? time.format('HH:mm') : null;
                  formik.setFieldValue('time', formattedTime);
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1">Submission Type</Typography>
          <RadioGroup
            row
            value={formik.values.submissionType}
            onChange={(e) => formik.setFieldValue('submissionType', e.target.value)}
          >
            <FormControlLabel value="online_text" control={<Radio />} label="Online text" />
            <FormControlLabel value="file_upload" control={<Radio />} label="File upload" />
            <FormControlLabel value="in_person" control={<Radio />} label="In-person submission" />
          </RadioGroup>
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            onsubmit(formik.values, 'draft');
          }}
          color="warning"
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onsubmit(formik.values, 'publish');
          }}
        >
          Publish
        </Button>
      </DialogActions>
    </Box>
  );
};
