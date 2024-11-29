import type { Division, Standards } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
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
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

// Enum for Activity Categories
enum ActivityCategory {
  ACADEMIC = 'Academic',
  SPORTS = 'Sports',
  CULTURAL = 'Cultural',
  CLUB = 'Club',
  VOLUNTEER = 'Volunteer',
}

// Interface for Activity
interface Activity {
  id: number;
  activityName: string;
  category: ActivityCategory;
  status: 'Active' | 'Inactive';
}

// Initial dummy data
const initialActivities: Activity[] = [
  {
    id: 1,
    activityName: 'Math Club',
    category: ActivityCategory.ACADEMIC,
    status: 'Active',
  },
  {
    id: 2,
    activityName: 'Basketball Team',
    category: ActivityCategory.SPORTS,
    status: 'Inactive',
  },
  {
    id: 3,
    activityName: 'Drama Society',
    category: ActivityCategory.CULTURAL,
    status: 'Active',
  },
];

const ActivityManagement = () => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const assignStudentDialog = useBoolean();

  const handleCloseDialog = () => {
    setSelectedActivity(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
    assignStudentDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedActivity) {
      setActivities(activities.filter((activity) => activity.id !== selectedActivity.id));
      deleteConfirmDialog.onFalse();
      setSelectedActivity(null);
    }
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedActivity) {
      // Update existing activity
      setActivities((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedActivity.id
            ? {
                ...a,
                activityName: values.activityName,
                category: values.category,
                status: values.status,
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
        status: values.status,
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
    }

    handleCloseDialog();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" my={1}>
          Activity Management
        </Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Add Activity
        </Button>
      </Box>

      <CustomizableTable
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
            id: 'status',
            label: 'Status',
            render: (value) => (
              <Label color={value === 'Active' ? 'primary' : 'error'}>{value}</Label>
            ),
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
                        setSelectedActivity(row as Activity);
                        setIsEdit(true);
                        dialog.onTrue();
                      }}
                    >
                      <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                      Edit
                    </MenuItem>

                    {row.status === 'Inactive' && (
                      <MenuItem
                        onClick={() => {
                          setSelectedActivity(row as Activity);
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
                    )}

                    {row.status === 'Active' && (
                      <MenuItem
                        onClick={() => {
                          assignStudentDialog.onTrue();
                          setSelectedActivity(row as Activity);
                          pop.onClose();
                        }}
                      >
                        <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
                        Assign Students
                      </MenuItem>
                    )}

                    {row.status === 'Active' && (
                      <MenuItem
                        onClick={() => {
                          assignStudentDialog.onTrue();
                          setSelectedActivity(row as Activity);
                          pop.onClose();
                        }}
                      >
                        <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                        View Details
                      </MenuItem>
                    )}
                  </MenuList>
                )}
              />
            ),
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
        title={`Assign Students to ${selectedActivity?.activityName}`}
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
    status: Yup.string().oneOf(['Active', 'Inactive'], 'Invalid Status'),
  });

  const formik = useFormik({
    initialValues: {
      activityName: data?.activityName || '',
      category: data?.category || '',
      status: data?.status || 'Active',
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.status === 'Active'}
                    onChange={() => {
                      formik.setFieldValue(
                        'status',
                        formik.values.status === 'Active' ? 'Inactive' : 'Active'
                      );
                    }}
                    color="primary"
                  />
                }
                label={`Status: ${formik.values.status}`}
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
        <Box display="flex" gap={1}>
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
              },
              {
                id: 'name',
                label: 'Student Name',
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
          Confirm Assignment
        </Button>
      </DialogActions>
    </Box>
  );
};
