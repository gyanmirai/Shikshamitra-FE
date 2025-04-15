'use client';

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
  Tooltip,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { TType, IAddCategoryProps } from './type';

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
  // State for managing homework type data - stores array of homework types (Practice, Reading Material, etc.)
  const [homeworkTypeData, setHomeworkTypeData] = useState(initialHomeworkType);
  // State for managing assignment type data - stores array of assignment types (Research-Based, Practical, etc.)
  const [assignmentTypeData, setAssignmentTypeData] = useState(initialAssignmentType);

  // State for currently selected homework type - stores single homework type object or null when none selected
  const [selectedHomeworkType, setSelectedHomeworkType] = useState<TType | null>(null);
  // State for currently selected assignment type - stores single assignment type object or null when none selected
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<TType | null>(null);

  // Boolean state to track whether we are in edit mode or create mode
  const [isEdit, setIsEdit] = useState(false);

  // Boolean state to control the visibility of homework type dialog
  const homeworkDialog = useBoolean();
  // Boolean state to control the visibility of assignment type dialog
  const assignmentDialog = useBoolean();
  // Boolean state to control the visibility of delete confirmation dialog
  const deleteConfirmDialog = useBoolean();

  /**
   * Closes all dialogs and resets selected homework/assignment types
   */
  const handleCloseDialog = () => {
    setSelectedHomeworkType(null);
    setSelectedAssignmentType(null);
    homeworkDialog.onFalse();
    assignmentDialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  /**
   * Handles submission of homework type form
   * If in edit mode, updates existing homework type
   * If in create mode, adds new homework type
   * @param values Form values containing homework type name
   */
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

  /**
   * Handles submission of assignment type form
   * If in edit mode, updates existing assignment type
   * If in create mode, adds new assignment type
   * @param values Form values containing assignment type name
   */
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
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Homework And Assignment', href: 'academic/homeworkDashboard' },
          { name: 'Settings' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ typography: 'h6' }}>Homework Types</Box>
                <Tooltip title="Manage Homework Type using Add, Edit or Delete">
                  <IconButton size="small">
                    <Iconify icon="mdi:information" fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {homeworkTypeData.map((category) => (
                    <Box
                      key={category.id}
                      component="li"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                        m: 0.5,
                        borderRadius: '15px',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{category.name}</Typography>
                      </Box>
                      <Box>
                        <Iconify
                          icon="solar:pen-bold"
                          sx={{ height: '18px', width: '18px', mr: 2, cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedHomeworkType(category);
                            setIsEdit(true);
                            homeworkDialog.onTrue();
                          }}
                        />
                        <Iconify
                          icon="mdi:delete"
                          sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedHomeworkType(category);
                            deleteConfirmDialog.onTrue();
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  startIcon={<Add />}
                  size="small"
                  variant="contained"
                  onClick={() => {
                    homeworkDialog.onTrue();
                    setIsEdit(false);
                    setSelectedHomeworkType(null);
                  }}
                >
                  Homework Type
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ typography: 'h6' }}>Assignment Types</Box>
                <Tooltip title="Manage Assignment Type using Add, Edit or Delete">
                  <IconButton size="small">
                    <Iconify icon="mdi:information" fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>{' '}
              <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {assignmentTypeData.map((category) => (
                    <Box
                      key={category.id}
                      component="li"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                        m: 0.5,
                        borderRadius: '15px',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{category.name}</Typography>
                      </Box>
                      <Box>
                        <Iconify
                          icon="solar:pen-bold"
                          sx={{ height: '18px', width: '18px', mr: 2, cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedAssignmentType(category);
                            setIsEdit(true);
                            assignmentDialog.onTrue();
                          }}
                        />
                        <Iconify
                          icon="mdi:delete"
                          sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedAssignmentType(category);
                            deleteConfirmDialog.onTrue();
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={() => {
                    assignmentDialog.onTrue();
                    setIsEdit(false);
                    setSelectedAssignmentType(null);
                  }}
                >
                  Assignment Type
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
        <CustomDialog
          open={homeworkDialog.value}
          handleClose={handleCloseDialog}
          title={isEdit ? 'Update Homework Type' : 'Add Homework Type'}
        >
          <AddCategory
            onSubmit={handleHomeworkSubmit}
            data={selectedHomeworkType}
            isEdit={isEdit}
          />
        </CustomDialog>

        <CustomDialog
          open={assignmentDialog.value}
          handleClose={handleCloseDialog}
          title={isEdit ? 'Update Assignment Type' : 'Add Assignment Type'}
        >
          <AddCategory
            onSubmit={handleAssignmentSubmit}
            data={selectedAssignmentType}
            isEdit={isEdit}
          />
        </CustomDialog>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ typography: 'h6' }}>Assignment Preferences</Box>
                <Tooltip title="Manage Homework Type using Add, Edit or Delete">
                  <IconButton size="small">
                    <Iconify icon="mdi:information" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 5 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Default Deadlines
                  </Typography>
                  <DatePicker
                    label="Select the Default Deadline"
                    format="DD/MM/YYYY"
                    sx={{ maxWidth: '250px' }}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Reminder Schedules
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch />
                      <Typography>24 hours before</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch />
                      <Typography>1 hour before</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button size="small" variant="contained" onClick={() => {}}>
                  Save
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ typography: 'h6' }}>Custom Notification</Box>
                <Tooltip title="Configure notification preferences, frequency, and reminder schedules for your assignments">
                  <IconButton size="small">
                    <Iconify icon="mdi:information" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Choose Notifications
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
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
                </Box>

                <Box sx={{ mb: 3 }}>
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
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button size="small" variant="contained" onClick={() => {}}>
                  Save
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Setting;

export const AddCategory: React.FC<IAddCategoryProps> = ({
  open,
  onClose,
  onSubmit,
  data,
  isEdit,
}) => {
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
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
