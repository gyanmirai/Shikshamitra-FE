'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Grid,
  Card,
  Switch,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TResourceData {
  id: number;
  resourceTitle: string;
  typeOfResource: string;
  className: string;
  subject: string;
  dateUploaded: string;
  description: string;
  status: string;
}

const resourceInitialData: TResourceData[] = [
  {
    id: 1,
    resourceTitle: 'Math Resource 1',
    typeOfResource: 'document',
    className: '1',
    subject: 'Math',
    dateUploaded: '01-12-20',
    description: 'Math resource description',
    status: 'Publish',
  },
  {
    id: 2,
    resourceTitle: 'Science Presentation',
    typeOfResource: 'Audio',
    className: '1',
    subject: 'Science',
    dateUploaded: '01-12-20',
    description: 'Science resource description',
    status: 'Unpublish',
  },
  {
    id: 3,
    resourceTitle: 'Physics Video',
    typeOfResource: 'Video',
    className: '1',
    subject: 'Physics',
    dateUploaded: '01-12-20',
    description: 'Physics video description',
    status: 'Publish',
  },
];

const LearningResources = (props: TabComponentType) => {
  const { searchParams } = props;

  const classFromUrl = searchParams?.class || ''; // Use optional chaining
  const subjectFromUrl = searchParams?.subject || ''; // Use optional chaining

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [resourceData, setResourceData] = useState<TResourceData[]>(resourceInitialData);
  // const dialog = useBoolean();
  const [open, setOpen] = useState(false);
  const confirm_dialog = useBoolean();

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes, setClasses] = useState<string>(classFromUrl);
  const [subject, setSubject] = useState(subjectFromUrl);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newStatus: string;
  } | null>(null);

  const handleSave = (dataFromDialog: TResourceData) => {
    if (isEdit && selectedEntry) {
      setResourceData(
        resourceData.map((resource) =>
          resource.id === selectedEntry.id ? { ...resource, ...dataFromDialog } : resource
        )
      );
    } else {
      setResourceData([
        ...resourceData,
        {
          ...dataFromDialog,
          id: Date.now(),
          className: classes,
          dateUploaded: new Date().toLocaleDateString(),
        },
      ]);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    setOpen(false);
  };

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newStatus: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirm_dialog.onTrue(); // Open confirmation dialog
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newStatus } = pendingStatusChange;
      setResourceData((prevCourse) =>
        prevCourse.map((resource) =>
          resource.id === id ? { ...resource, status: newStatus } : resource
        )
      );
    }
    confirm_dialog.onFalse();
    setPendingStatusChange(null);
  };

  const filteredData = resourceData.filter(
    (item) => (!classes || item.className === classes) && (!subject || item.subject === subject)
  );

  const cancelStatusChange = () => {
    confirm_dialog.onFalse();
    setPendingStatusChange(null);
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem onClick={() => {}}>
            <Iconify icon="solar:share-bold" />
            Share with classes/teachers
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  return (
    <>
      {/* Breadcrumbs Section */}
      {open ? (
        <CustomBreadcrumbs
          heading="Learning Resources"
          links={[
            { name: 'Academic and Assignment' },
            { name: 'Course' },
            { name: 'Learning Resources' },
            { name: 'Add Learning Resource' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={closeDialog}
            >
              Back
            </Button>
          }
        />
      ) : (
        <CustomBreadcrumbs
          heading="Learning Resources"
          links={[
            { name: 'Academic and Assignment' },
            { name: 'Course' },
            { name: 'Learning Resources' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => {
                setOpen(true);
              }}
              disabled={!classes || !subject}
            >
              Resource
            </Button>
          }
        />
      )}

      {/* Dialog for Creating/Editing Resource */}
      {open && (
        <Card>
          <CreateNewResource
            onSave={handleSave}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            currentClass={classes}
            currentSubject={subject}
          />
        </Card>
      )}

      {!open && (
        <>
          {/* Filters Section */}
          <Typography variant="h6" marginBottom={3} mt={3}>
            Learning Resources For Subject
          </Typography>
          <Box display="flex" flexDirection="row" gap={2} mb={2}>
            <CustomSelect
              options={classData?.items || []}
              value={classes}
              onChange={(val) => setClasses(val as string)}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="name"
              formControlProps={{ sx: { minWidth: 150 } }}
            />
            <CustomSelect
              label="Course/Subject"
              disabled={!classes}
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'English', label: 'English' },
              ]}
              value={subject}
              onChange={(val) => setSubject(val as string)}
              formControlProps={{ sx: { minWidth: 150 } }}
            />
          </Box>

          {/* Table Section */}
          {classes && subject && (
            <CustomizableTable
              tableId="learning-resources"
              columns={[
                { id: 'resourceTitle', label: 'Resource Title' },
                { id: 'typeOfResource', label: 'Type of Resource' },
                { id: 'className', label: 'Class' },
                { id: 'subject', label: 'Subject' },
                { id: 'dateUploaded', label: 'Date Uploaded' },
                {
                  id: 'status',
                  label: 'Publish',
                  render: (value, row) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        size="small"
                        checked={value === 'Publish'}
                        onChange={() => handleStatusChange(row.id, value)}
                      />
                    </Box>
                  ),
                },
                {
                  id: 'action',
                  label: 'Action',
                  isSort: false,
                  render: (value, row) => (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                      showEditIcon
                      showDeleteIcon
                      showViewIcon
                      handleViewClick={() => {}}
                      handleDeleteClick={() => {}}
                      handleEditClick={() => {
                        setIsEdit(true);
                        setSelectedEntry(row);
                        setOpen(true);
                      }}
                    />
                  ),
                },
              ]}
              data={filteredData}
            />
          )}
        </>
      )}
    </>
  );
};

export default LearningResources;

interface CreateLearningResourcesProps {
  onSave: (values: TResourceData) => void;
  onClose: () => void;
  data: TResourceData | null;
  isEdit: boolean;
  currentClass: string;
  currentSubject: string;
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
  currentClass,
  currentSubject,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'draft'));
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik<TResourceData>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      resourceTitle: isEdit && data ? data.resourceTitle : '',
      typeOfResource: isEdit && data ? data.typeOfResource : '',
      className: currentClass,
      subject: isEdit && data ? data.subject : currentSubject,
      description: isEdit && data ? data.description : '',
      dateUploaded: isEdit && data ? data.dateUploaded : new Date().toLocaleDateString(),
      status: isEdit && data ? data.status : 'draft',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        status: isDraft ? 'Unpublish' : 'Publish',
        dateUploaded: isEdit ? values.dateUploaded : new Date().toLocaleDateString(), // Only update if not in edit mode
      };
      onSave(updatedValues);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '350px' }}>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value={formik.values.className}
                onChange={(val) => formik.setFieldValue('className', val as string)}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ sx: { minWidth: 270, width: '100%' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'English', label: 'English' },
                  { value: 'Science', label: 'Science' },
                ]}
                name="subject"
                value={formik.values.subject}
                onChange={(val) => formik.setFieldValue('subject', val as string)}
                formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
              />
            </Grid>
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsDraft(true);
              formik.handleSubmit();
            }}
            color="warning"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              setIsDraft(false);
              formik.handleSubmit();
            }}
          >
            Save and Publish
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
