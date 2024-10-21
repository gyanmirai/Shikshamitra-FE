import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
  Box,
  Grid,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const tableData = [
  {
    resourceTitle: 'resource 1',
    typeOfResource: 'document',
    courseAndSubject: 'Math',
    dateUploaded: '01-12-20',
  },
  {
    resourceTitle: 'Projecter',
    typeOfResource: 'Audio',
    courseAndSubject: 'Science',
    dateUploaded: '01-12-20',
  },
  {
    resourceTitle: 'laptop',
    typeOfResource: 'Video',
    courseAndSubject: 'Math',
    dateUploaded: '01-12-20',
  },
];

const LearningResources = () => {
  const dialog = useBoolean();
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
        {' '}
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Course
        </Button>
      </Box>
      <Box display="flex" flexDirection="row" gap={3}>
        <CustomSelect
          label="Type of Resources"
          options={[
            { value: 'video', label: 'Video' },
            { value: 'document', label: 'Document' },
            { value: 'presentation', label: 'Presentation' },
          ]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 200 } }}
        />
        <CustomSelect
          label="Course and Subject"
          options={[
            {
              value: 'course1ForMath',
              label: 'course 1 and Math',
            },
            {
              value: 'course1ForEnglish',
              label: 'course 1 and English',
            },
            {
              value: 'course1ForMath',
              label: 'course 1 and Math',
            },
          ]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 200 } }}
        />
        <CustomSelect
          label="Date Uploaded"
          options={[
            { value: 'last7Days', label: 'Last 7 Days' },
            { value: 'lastMonth', label: 'Last Month' },
          ]}
          value=""
          onChange={(val) => {}}
          formControlProps={{ sx: { minWidth: 200 } }}
        />
      </Box>

      <CustomizableTable
        columns={[
          { id: 'resourceTitle', label: 'Resource Title' },
          { id: 'typeOfResource', label: 'Type of Resource' },
          { id: 'courseAndSubject', label: 'Cource And Subject' },
          { id: 'dateUploaded', label: 'Date Uploaded' },
          {
            id: 'action',
            label: 'Action',
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="solar:pen-bold" />
                        Edit Resource Information
                      </MenuItem>
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="solar:pen-bold" />
                        Share with classes/teachers
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
      <CustomDialog
        title="New Resource"
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
      >calca
        <CreateNewResource
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={() => {}}
          data={() => {}}
          isEdit={false}
          allData={[]}
        />
      </CustomDialog>
    </Box>
  );
};

export default LearningResources;

interface CreateLearningResourcesProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}
interface FormikValue {
  resourceTitle: string;
  attachedCourse: string;
  accessPermision: string;
  description: string;
}

const CreateNewResource: React.FC<CreateLearningResourcesProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      resourceTitle: isEdit ? data.resourceTitle ?? '' : '',
      attachedCourse: isEdit ? data.attachedCourse ?? '' : '',
      accessPermision: isEdit ? data.accessPermision ?? '' : '',
      description: isEdit ? data.description ?? '' : '',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.resourceTitle) === normalize(values.resourceTitle)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
      console.log('Form Submitted type', values);
    },
  });
  return (
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
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
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={12} md={6}>
              <TextField
                disabled={isEdit}
                label="Resource Title"
                size="small"
                name="resourceTitle"
                value={formik.values.resourceTitle}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Attach to course/subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'english', label: 'English' },
                  { value: 'science', label: 'Science' },
                ]}
                value={formik.values.attachedCourse}
                onChange={(val) => {
                  formik.setFieldValue('attachedCourse', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Access Permission"
                options={[
                  { value: 'allTeachers', label: 'All Teachers' },
                  { value: 'specificClasses', label: 'Specific Classes' },
                ]}
                value={formik.values.accessPermision}
                onChange={(val) => {
                  formik.setFieldValue('accessPermision', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                size="small"
                multiline
                rows={4}
                name="resourceTitle"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
          <DialogActions>
            <Button variant="contained" onClick={() => {}} color="warning">
              Save as Draft
            </Button>
            <Button type="submit" variant="contained" onClick={() => {}}>
              Save ad Publish
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Scrollbar>
  );
};
