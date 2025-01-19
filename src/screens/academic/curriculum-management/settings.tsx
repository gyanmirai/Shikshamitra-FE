'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  FormHelperText,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TTemplate {
  id: number;
  templateName: string;
  className: string;
  subjects: string[];
  status: string;
  date: Dayjs | null;
}
const dummyTemplates: TTemplate[] = [
  {
    id: 1,
    templateName: 'Basic Math Curriculum',
    className: '1',
    subjects: ['Mathematics'],
    status: 'Publish',
    date: dayjs('2024-10-28'),
  },
  {
    id: 2,
    templateName: 'Science Foundation',
    className: '1',
    subjects: ['Science'],
    status: 'Unpublish',
    date: dayjs('2024-12-30'),
  },
  {
    id: 3,
    templateName: 'Language Arts',
    className: '2',
    subjects: ['English', 'Literature'],
    status: 'Publish',
    date: dayjs('2024-10-02'),
  },
  {
    id: 4,
    templateName: 'History Basics',
    className: '1',
    subjects: ['History', 'Geography'],
    status: 'Unpublish',
    date: dayjs('2024-10-14'),
  },
  {
    id: 5,
    templateName: 'Physical Education Essentials',
    className: '5',
    subjects: ['Physical Education'],
    status: 'Publish',
    date: dayjs('2024-09-18'),
  },
];

const Settings = (props: TabComponentType) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TTemplate | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();

  const templateDialog = useBoolean();

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const [templateData, setTemplateData] = useState<TTemplate[]>(dummyTemplates);
  const handleSubmit = (values: any) => {
    if (isEdit) {
      setTemplateData((prev) =>
        prev.map((curr) => (curr.id === selectedTemplate!.id ? values : curr))
      );
    } else {
      setTemplateData((prev) => [...prev, values]);
    }
    dialog.onFalse();
    setSelectedTemplate(null);
    setIsEdit(false);
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setSelectedTemplate(null);
  };

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setTemplateData((prevTemplate) =>
        prevTemplate.map((template) =>
          template.id === id ? { ...template, status: newValue } : template
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      setTemplateData(templateData.filter((subject) => subject.id !== selectedTemplate.id));
      deleteConfirmDialog.onFalse();
      setSelectedTemplate(null);
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[{ name: 'Academic and Assignment' }, { name: 'Curriculum' }, { name: 'Settings' }]}
        sx={{ px: 1, mb: 2 }}
      />

      {/* <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px' }}>
        Subject Management
      </Typography>
        <Button size="small" variant="contained" onClick={() => {}}>
          Add New Subject
        </Button>
      </Box> */}

      {/* <CustomizableTable
        columns={[
          { id: 'curriculumname', label: 'Curriculum Name' },
          { id: 'gradelevel', label: 'Grade Level' },
          { id: 'subject', label: 'Subjects' },
          { id: 'lastupdated', label: 'Last Updated' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Archived'
                      ? 'warning'
                      : value === 'Pending'
                        ? 'error'
                        : value === 'Active'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
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
                          modal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
                        Archived
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            curriculumname: 'curriculum1',
            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Archived',
          },
          {
            curriculumname: 'curriculum2',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Draft',
          },
          {
            curriculumname: 'curriculum3',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Pending',
          },
          {
            curriculumname: 'curriculum4',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Active',
          },
        ]}
      /> */}
      {/* <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px', pt: '20px' }}>
        Learning Goals
      </Typography> */}
      {/* <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Subject Name"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box> */}
      {/* <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Learning Goal"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box> */}
      <Typography variant="h6" mt={2}>
        Notification Section
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Set Reminders</Typography>

            <FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
            <Box sx={{ pb: '20px', pt: '20px', width: '400px' }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
                name="description"
                label="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
                // value={formik.values.description}
                // onChange={formik.handleChange}
                size="small"
              />
            </Box>
            <FormControlLabel
              control={<Switch />}
              label="Notify teachers when curriculum is updated"
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 'auto',
                pt: 2,
              }}
            >
              <Button variant="contained">Save</Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Permission Connection</Typography>
            <Box sx={{ pl: '20px', pb: '20px', pt: 2 }}>
              <CustomSelect
                label="Edit Curriculum"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 250 } }}
              />
            </Box>
            <Box sx={{ pl: '20px', pb: '20px' }}>
              <CustomSelect
                label="Approved Curriculum Update"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 250 } }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 'auto',
                pt: 13,
              }}
            >
              <Button variant="contained">Save</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <CustomDialog
        title={isEdit ? `Update ${selectedTemplate?.templateName}` : 'Add New Template'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <AddTemplateForm
          onSubmit={handleSubmit}
          onClose={handleCloseDialog}
          isEdit={isEdit}
          data={selectedTemplate}
        />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Template?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Template"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Template {selectedTemplate?.templateName} ?
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
  );
};

interface AddTemplateFormProps {
  onSubmit: (values: TTemplate) => void;
  onClose: () => void;
  data: TTemplate | null;
  isEdit: boolean;
}

const AddTemplateForm: React.FC<AddTemplateFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: {
      templateName: data?.templateName || '',
      className: data?.className || '',
      subjects: data?.subjects || [],
      date: data?.date || dayjs(),
      status: data?.status || 'Unpublish',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ background: 'background.neutral', p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="templateName"
              label="Template Name"
              value={formik.values.templateName}
              onChange={formik.handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              options={classData?.items || []}
              label="Class"
              isLoading={isLoading}
              value={formik.values.className}
              labelKey="name"
              valueKey="name"
              onChange={(val) => {
                formik.setFieldValue('className', val);
              }}
              formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
              error={formik.touched.className && Boolean(formik.errors.className)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Subject"
              name="subjects"
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'Science', label: 'Science' },
                { value: 'English', label: 'English' },
                { value: 'Gujarati', label: 'Gujarati' },
              ]}
              multiple
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              value={formik.values.subjects}
              onChange={(value) => formik.setFieldValue('subjects', value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Date"
              value={formik.values.date}
              onChange={(value) => {
                formik.setFieldValue('date', value);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.date && Boolean(formik.errors.date),
                },
              }}
              disablePast
            />
            {formik.touched.date && formik.errors.date && (
              <FormHelperText error>{String(formik.errors.date)}</FormHelperText>
            )}
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        {isEdit ? (
          <Button
            variant="contained"
            onClick={() => {
              setIsDraft(true);
              formik.handleSubmit();
            }}
          >
            Update
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={() => {
                setIsDraft(false);
                formik.handleSubmit();
              }}
            >
              Publish
            </Button>
          </>
        )}
      </DialogActions>
    </form>
  );
};
export default Settings;
