import type { TabComponentType } from 'src/screens/hr/leave-request';

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
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TType {
  id: number;
  name: string;
}

const initialHomeworkType: TType[] = [
  {
    id: 1,
    name: 'Practice',
  },
  {
    id: 2,
    name: 'Reading Material',
  },
  {
    id: 3,
    name: 'Revision',
  },
];

const initialAssignmentType: TType[] = [
  {
    id: 1,
    name: 'Research-Based',
  },
  {
    id: 2,
    name: 'Practical',
  },
  {
    id: 3,
    name: 'Group Work',
  },
];

const Setting = (props: TabComponentType) => {
  const [homeworkTypeData, setHomeworkTypeData] = useState(initialHomeworkType);
  const [assignmentTypeData, setAssignmentTypeData] = useState(initialAssignmentType);

  const [selectedHomeworkType, setSelectedHomeworkType] = useState<TType | null>(null);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<TType | null>(null);

  const [isEdit, setIsEdit] = useState(false);

  const homeworkDialog = useBoolean();
  const assignmentDialog = useBoolean();
  const deleteConfirmDialog = useBoolean();

  const handleCloseDialog = () => {
    setSelectedHomeworkType(null);
    setSelectedAssignmentType(null);
    homeworkDialog.onFalse();
    assignmentDialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleHomeworkSubmit = (values: any) => {
    if (isEdit && selectedHomeworkType) {
      setHomeworkTypeData((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedHomeworkType.id
            ? {
                ...a,
                name: values.name,
              }
            : a
        )
      );
    } else {
      // Create new activity
      const newCategory: TType = {
        id: Math.max(...homeworkTypeData.map((a) => a.id)) + 1,
        name: values.name,
      };
      setHomeworkTypeData((prevActivities) => [...prevActivities, newCategory]);
    }
    handleCloseDialog();
  };

  const handleAssignmentSubmit = (values: any) => {
    if (isEdit && selectedAssignmentType) {
      setAssignmentTypeData((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedAssignmentType.id
            ? {
                ...a,
                name: values.name,
              }
            : a
        )
      );
    } else {
      // Create new activity
      const newCategory: TType = {
        id: Math.max(...assignmentTypeData.map((a) => a.id)) + 1,
        name: values.name,
      };
      setAssignmentTypeData((prevActivities) => [...prevActivities, newCategory]);
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Homework And Assignment' },
          { name: 'Settings' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <CustomDialog
            open={homeworkDialog.value}
            handleClose={handleCloseDialog}
            title={isEdit ? 'Update Type' : 'Add Type'}
          >
            <AddCategory
              onSubmit={handleHomeworkSubmit}
              data={selectedHomeworkType}
              isEdit={isEdit}
            />
          </CustomDialog>

          <CustomDialog
            open={homeworkDialog.value}
            handleClose={handleCloseDialog}
            title={isEdit ? 'Update Category' : 'Add Category'}
          >
            <AddCategory
              onSubmit={handleAssignmentSubmit}
              data={selectedAssignmentType}
              isEdit={isEdit}
            />
          </CustomDialog>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Default Deadlines
            </Typography>
            <DatePicker
              label="Select the Default Deadline"
              format="DD/MM/YYYY"
              sx={{}}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Reminder Schedules
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch />
              <Typography>24 hours before</Typography>
              <Switch />
              <Typography>1 hour before</Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Custom Notifications
        </Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Choose Notifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>New Assignments</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Grading Updates</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Upcoming Deadlines</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Frequency
            </Typography>
            <CustomSelect
              label="Frequency Options"
              options={[
                { value: 'Immediately', label: 'Immediately' },
                { value: 'Daily', label: 'Daily' },
                { value: 'Weekly', label: 'Weekly' },
              ]}
              value=""
              onChange={() => {}}
            />
          </Grid>
        </Grid>
        <Button
          color="secondary"
          variant="contained"
          sx={{ maxWidth: '200px', width: '100%', marginLeft: '80%' }}
        >
          Save Changes
        </Button>
      </Card>
    </Box>
  );
};

export default Setting;

interface AddCategoryProps {
  onSubmit: (values: TType) => void;
  data: TType | null;
  isEdit: boolean;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onSubmit, data, isEdit }) => {
  const formik = useFormik({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      name: isEdit && data ? data?.name : '',
    },
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
                label="Type"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>{' '}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" color="primary" variant="contained">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
