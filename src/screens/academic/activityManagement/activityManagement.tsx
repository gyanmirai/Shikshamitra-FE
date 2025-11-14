'use client';

import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Grid,
  Chip,
  Button,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

// Enum for Activity Categories
enum ActivityCategory {
  ACADEMIC = 'Academic',
  SPORTS = 'Sports',
  CULTURAL = 'Cultural',
  CLUB = 'Club',
  VOLUNTEER = 'Volunteer',
}
type ActivityStatus = 'Scheduled' | 'Active' | 'Completed';

// Interface for Activity
interface Activity {
  id: number;
  activityName: string;
  category: ActivityCategory;
  status: ActivityStatus;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

// Initial dummy data
const initialActivities: Activity[] = [
  {
    id: 1,
    activityName: 'Math Club',
    category: ActivityCategory.ACADEMIC,
    status: 'Completed',
    startDate: dayjs('2024-10-28'),
    endDate: dayjs('2024-11-04'),
  },
  {
    id: 2,
    activityName: 'Basketball Team',
    category: ActivityCategory.SPORTS,
    status: 'Active',
    startDate: dayjs('2024-12-01'),
    endDate: dayjs('2024-12-03'),
  },
  {
    id: 3,
    activityName: 'Drama Society',
    category: ActivityCategory.CULTURAL,
    status: 'Scheduled',
    startDate: dayjs('2024-12-10'),
    endDate: dayjs('2024-12-11'),
  },
];

const getActivityStatus = (startDate: Dayjs | null, endDate: Dayjs | null) => {
  const now = dayjs();
  if (!startDate) return 'Scheduled';

  // If start date is in the future, status is Scheduled
  if (startDate.isAfter(now)) return 'Scheduled';

  // If end date exists and is in the past, status is Completed
  if (endDate && endDate.isBefore(now)) return 'Completed';

  // If current date is between start and end dates, status is Active
  return 'Active';
};

const ActivityManagement = (props: TabComponentType) => {
  const [activities, setActivities] = useState<Activity[]>(
    initialActivities.map((activity) => ({
      ...activity,
      status: getActivityStatus(activity.startDate, activity.endDate),
    }))
  );

  const [isEdit, setIsEdit] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const assignStudentDialog = useBoolean();
  const uploadPictureDialog = useBoolean();

  const handleCloseDialog = () => {
    setSelectedActivity(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
    assignStudentDialog.onFalse();
    uploadPictureDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedActivity) {
      setActivities(activities.filter((activity) => activity.id !== selectedActivity.id));
      deleteConfirmDialog.onFalse();
      setSelectedActivity(null);
    }
  };

  const handleSubmit = (values: any) => {
    const newStatus = getActivityStatus(values.startDate, values.endDate);

    if (isEdit && selectedActivity) {
      // Update existing activity
      setActivities((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedActivity.id
            ? {
                ...a,
                activityName: values.activityName,
                category: values.category,
                status: newStatus,
                startDate: values.startDate,
                endDate: values.endDate,
              }
            : a
        )
      );
    } else {
      // Create new activity
      const newActivity: Activity = {
        id: Math.max(...activities.map((a) => a.id)) + 1,
        activityName: values.activityName,
        category: values.category,
        status: newStatus,
        startDate: values.startDate,
        endDate: values.endDate,
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
    }

    handleCloseDialog();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Completed' && (
            <MenuItem
              onClick={() => {
                uploadPictureDialog.onTrue();
              }}
            >
              <Iconify icon="mdi:upload" sx={{ height: '16px', width: '16px' }} />
              Upload Pictures
            </MenuItem>
          )}
          {row.status === 'Completed' && (
            <MenuItem
              onClick={() => {
                assignStudentDialog.onTrue();
                setSelectedActivity(row as Activity);
                // pop.onClose();
              }}
            >
              <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
              Assign Students
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [assignStudentDialog, uploadPictureDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Activity Management"
        links={[{ name: 'Academics' }, { name: 'Activity' }, { name: 'Activity Management' }]}
        sx={{ px: 1, mb: 1 }}
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={() => {
              dialog.onTrue();
            }}
          >
            Activity
          </Button>
        }
      />

      <CustomizableTable
        tableId="activity-management-table"
        columns={[
          {
            id: 'activityName',
            label: 'Activity Name',
          },
          {
            id: 'category',
            label: 'Category',
          },
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
            id: 'status',
            label: 'Status',
            render: (value) => (
              <Label
                color={
                  value === 'Completed'
                    ? 'error'
                    : value === 'Active'
                      ? 'primary'
                      : value === 'Scheduled'
                        ? 'warning'
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
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  showViewIcon
                  handleViewClick={() => {
                    assignStudentDialog.onTrue();
                    setSelectedActivity(row as Activity);
                  }}
                  handleEditClick={() => {
                    setSelectedActivity(row as Activity);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedActivity(row as Activity);
                    deleteConfirmDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={activities}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Activity' : 'Add Activity'}
      >
        <ActivityForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedActivity}
          isEdit={isEdit}
        />
      </CustomDialog>

      <CustomDialog
        maxWidth="md"
        open={assignStudentDialog.value}
        handleClose={handleCloseDialog}
        title={`Assign Winners to ${selectedActivity?.activityName}`}
      >
        <AssignStudents />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Activity"
      >
        <Box p={2}>
          <Typography>
            Are you sure you want to delete the activity &quot;{selectedActivity?.activityName}
            &quot;?
          </Typography>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>

      <CustomDialog
        open={uploadPictureDialog.value}
        handleClose={handleCloseDialog}
        title="Upload Pictures"
      >
        <UploadPictures />
      </CustomDialog>
    </Box>
  );
};

interface ActivityFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: Activity | null;
  isEdit: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const validationSchema = Yup.object().shape({
    activityName: Yup.string().required('Activity Name is Required'),
    category: Yup.string().required('Category is Required'),
  });

  const formik = useFormik({
    initialValues: {
      activityName: data?.activityName || '',
      category: data?.category || '',
      startDate: data?.startDate || dayjs(),
      endDate: data?.startDate || null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Activity Name"
                name="activityName"
                value={formik.values.activityName}
                onChange={formik.handleChange}
                error={formik.touched.activityName && Boolean(formik.errors.activityName)}
                helperText={formik.touched.activityName && formik.errors.activityName}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomSelect
                label="Category"
                options={[
                  { value: ActivityCategory.ACADEMIC, label: 'Academic' },
                  { value: ActivityCategory.SPORTS, label: 'Sports' },
                  { value: ActivityCategory.CULTURAL, label: 'Cultural' },
                  { value: ActivityCategory.CLUB, label: 'Club' },
                  { value: ActivityCategory.VOLUNTEER, label: 'Volunteer' },
                ]}
                onChange={(val) => {
                  formik.setFieldValue('category', val);
                }}
                value={formik.values.category}
                formControlProps={{
                  sx: { width: '100%' },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DateTimePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(value) => {
                  formik.setFieldValue('startDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DateTimePicker
                label="End Date"
                value={formik.values.endDate}
                onChange={(value) => {
                  formik.setFieldValue('endDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default ActivityManagement;

const dummyStudentData = [
  {
    studentId: '1',
    name: 'John Doe',
    class: '1',
    division: 'A',
    currentActivities: ['Math Homework', 'Science Project'],
  },
  {
    studentId: '2',
    name: 'Jane Smith',
    class: '1',
    division: 'B',
    currentActivities: ['Reading', 'Art Assignment'],
  },
  {
    studentId: '3',
    name: 'Alice Brown',
    class: '1',
    division: 'A',
    currentActivities: ['Group Study', 'Sports Practice'],
  },
  {
    studentId: '4',
    name: 'Bob White',
    class: '1',
    division: 'B',
    currentActivities: ['Music Class', 'Science Fair'],
  },
];

const AssignStudents = () => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentData, setStudentData] = useState(dummyStudentData);
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        // If already selected, remove from selection
        return prev.filter((id) => id !== studentId);
      }
      // If not selected, add to selection
      return [...prev, studentId];
    });
  };

  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
        <Box display="flex" gap={1} mb={2}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes}
            onChange={(value) => {
              const selectedClass: Standards = classData.items.find(
                (i: Standards) => i.id === value
              );
              setClasses(value as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              const selectedDivision = divisionOptions.find((i: Division) => val === i.id);
              setDivision(val as string);
            }}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />
          <Button
            variant="contained"
            disabled={!classes || !division}
            startIcon={<Iconify icon="mdi:eye" />}
            onClick={() => {
              setShowStudents(true);
            }}
          >
            Show Students
          </Button>
        </Box>
        {showStudents && (
          <CustomizableTable
            tableId="student-table"
            columns={[
              {
                id: 'select',
                label: 'Select',
                render: (value, row: any) => (
                  <Checkbox
                    checked={selectedStudents.includes(row.studentId)}
                    onChange={() => handleSelectStudent(row.studentId)}
                  />
                ),
              },
              {
                id: 'studentId',
                label: 'Student Id',
                align: 'left',
                minWidth: '180px',
              },
              {
                id: 'name',
                label: 'Student Name',
                align: 'left',
                minWidth: '180px',
              },
              {
                id: 'class',
                label: 'Class',
              },
              {
                id: 'division',
                label: 'Division',
              },
              {
                id: 'currentActivities',
                label: 'Current Activities',
                align: 'left',
                minWidth: '200px',
                render: (value: string[]) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((field: string) => (
                      <Chip key={field} label={field} size="small" variant="outlined" />
                    ))}
                  </Box>
                ),
              },
            ]}
            data={studentData}
          />
        )}
      </Scrollbar>
      <DialogActions>
        <Button
          type="submit"
          variant="contained"
          disabled={selectedStudents.length === 0}
          onClick={() => {}}
        >
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};

interface FormValues {
  docs: File[];
}

const UploadPictures = () => {
  const formik = useFormik({
    initialValues: {
      docs: [],
    },
    onSubmit: (values) => {},
  });

  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };

  const handleRemoveFile = useCallback(
    (
      inputFile: File | string,
      values: FormValues,
      setFieldValue: (field: string, value: any) => void
    ) => {
      const filtered = values.docs && values.docs?.filter((file) => file !== inputFile);
      setFieldValue('docs', filtered);
    },
    []
  );

  const handleRemoveAllFiles = useCallback(
    (values: FormValues, setFieldValue: (field: string, value: any) => void) => {
      setFieldValue('docs', []);
    },
    []
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Upload
                {...uploadProps}
                thumbnail
                value={formik.values.docs}
                onDrop={(acceptedFiles) => {
                  const value = [...formik.values.docs, ...acceptedFiles];
                  formik.setFieldValue('docs', value);
                }}
                onRemove={(file) => handleRemoveFile(file, formik.values, formik.setFieldValue)}
                onRemoveAll={() => handleRemoveAllFiles(formik.values, formik.setFieldValue)}
                onUpload={() => console.info('ON UPLOAD')}
                // disabled={editData}
              />
            </Grid>
          </Grid>
        </Scrollbar>
      </form>
    </Box>
  );
};
