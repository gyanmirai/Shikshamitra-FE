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

interface TResourceData {
  id: number;
  resourceTitle: string;
  typeOfResource: string;
  attachedCourse: string;
  accessPermision: string;
  courseAndSubject: string;
  dateUploaded: string;
  description: string;
}

const resourceInitialData: TResourceData[] = [
  {
    id: 1,
    resourceTitle: 'resource 1',
    typeOfResource: 'document',
    attachedCourse: 'Math',
    accessPermision: 'allTeachers',
    courseAndSubject: 'Math',
    dateUploaded: '01-12-20',
    description: 'Math resource description',
  },
  {
    id: 2,
    resourceTitle: 'Projector',
    typeOfResource: 'Audio',
    attachedCourse: 'Science',
    accessPermision: 'specificClasses',
    courseAndSubject: 'Science',
    dateUploaded: '01-12-20',
    description: 'Science resource description',
  },
  {
    id: 3,
    resourceTitle: 'Laptop',
    typeOfResource: 'Video',
    attachedCourse: 'Math',
    accessPermision: 'allTeachers',
    courseAndSubject: 'Math',
    dateUploaded: '01-12-20',
    description: 'Math video resource description',
  },
];

const LearningResources = () => {
  const [selectedEntry, setSelectedEntry] = useState<TResourceData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [resourceData, setResourceData] = useState<TResourceData[]>(resourceInitialData);
  const dialog = useBoolean();

  const handleSave = (dataFromDialog: TResourceData) => {
    if (isEdit && selectedEntry) {
      setResourceData(
        resourceData.map((resource) =>
          resource.id === selectedEntry.id ? { ...resource, ...dataFromDialog } : resource
        )
      );
    } else {
      setResourceData([...resourceData, { ...dataFromDialog, id: Date.now() }]);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    dialog.onFalse();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
        {' '}
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Resource
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
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);
                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
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
        data={resourceData}
      />
      <CustomDialog
        title={isEdit ? 'Edit Resource' : 'New Resource'}
        open={dialog.value}
        handleClose={closeDialog}
        maxWidth="sm"
      >
        <CreateNewResource
          onSave={handleSave}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default LearningResources;

interface CreateLearningResourcesProps {
  onSave: (values: TResourceData) => void;
  onClose: () => void;
  data: TResourceData | null;
  isEdit: boolean;
}

interface FormikValue {
  resourceTitle: string;
  typeOfResource: string;
  attachedCourse: string;
  accessPermision: string;
  description: string;
  courseAndSubject: string;
  dateUploaded: string;
}

const CreateNewResource: React.FC<CreateLearningResourcesProps> = ({
  data,
  onClose,
  onSave,
  isEdit,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<TResourceData>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      resourceTitle: isEdit && data ? data.resourceTitle : '',
      typeOfResource: isEdit && data ? data.typeOfResource : '',
      attachedCourse: isEdit && data ? data.attachedCourse : '',
      accessPermision: isEdit && data ? data.accessPermision : '',
      description: isEdit && data ? data.description : '',
      courseAndSubject: isEdit && data ? data.courseAndSubject : '',
      dateUploaded: isEdit && data ? data.dateUploaded : '',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        dateUploaded: isEdit ? values.dateUploaded : new Date().toLocaleDateString(), // Only update if it's not edit mode
      };
      onSave(updatedValues);
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
                value={formik.values.courseAndSubject}
                onChange={(val) => {
                  formik.setFieldValue('courseAndSubject', val as string);
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
              <CustomSelect
                label="Select Resource Type"
                options={[
                  { value: 'video', label: 'Video' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'document', label: 'Document' },
                ]}
                value={formik.values.typeOfResource}
                onChange={(val) => {
                  formik.setFieldValue('typeOfResource', val as string);
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
                name="description"
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
