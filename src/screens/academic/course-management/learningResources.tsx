'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
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
  CardActions,
  ToggleButton,
  DialogActions,
  ToggleButtonGroup,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DetailRow } from 'src/screens/communication/announcement/schoolWiseAnnounsement';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Interface defining the structure of a learning resource
interface TResourceData {
  id: number; // Unique identifier for the resource
  resourceTitle: string; // Title of the learning resource
  typeOfResource: string; // Type of resource (document, audio, video, etc.)
  className: string; // Class/grade the resource is intended for
  subject: string; // Subject area of the resource
  dateUploaded: string; // Date when the resource was uploaded
  description: string; // Detailed description of the resource
  status: string; // Publication status (Publish/Unpublish)
}

// Initial sample data for learning resources
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
  // Get search parameters from props
  const { searchParams } = props;
  // State for controlling view mode (list/grid)
  const [view, setView] = useState('list');
  // Custom hook for managing URL search parameters
  const [params, setParams] = useSearchParam({ isForm: 'false' });

  // Extract class and subject from URL parameters with default empty string
  const classFromUrl = searchParams?.class || ''; // Use optional chaining
  const subjectFromUrl = searchParams?.subject || ''; // Use optional chaining

  // State for managing selected resource entry and edit mode
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  // State for storing all learning resources data
  const [resourceData, setResourceData] = useState<TResourceData[]>(resourceInitialData);
  // const dialog = useBoolean();
  // State for confirmation dialog
  const confirm_dialog = useBoolean();

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State for selected class and subject filters
  const [classes, setClasses] = useState<string>(classFromUrl);
  const [subject, setSubject] = useState(subjectFromUrl);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newStatus: string;
  } | null>(null);

  // Function to handle saving new or edited learning resources
  const handleSave = (dataFromDialog: TResourceData) => {
    // If editing an existing resource
    if (isEdit && selectedEntry) {
      // Update the existing resource in the array
      setResourceData(
        resourceData.map((resource) =>
          resource.id === selectedEntry.id ? { ...resource, ...dataFromDialog } : resource
        )
      );
    } else {
      // Add new resource to the array
      setResourceData([
        ...resourceData,
        {
          ...dataFromDialog,
          id: Date.now(), // Generate unique ID using timestamp
          className: classes, // Set class from current filter
          dateUploaded: new Date().toLocaleDateString(), // Set current date
        },
      ]);
    }
    // Close the dialog after saving
    closeDialog();
  };
  // Function to close the dialog and reset form state
  const closeDialog = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    setParams({ isForm: 'false' });
  };

  // Handle status change for publishing/unpublishing resources
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newStatus: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirm_dialog.onTrue(); // Open confirmation dialog
  };

  // Filter resources based on selected class and subject
  const filteredData = resourceData.filter(
    (item) => (!classes || item.className === classes) && (!subject || item.subject === subject)
  );

  // Menu actions for resource items (download and share)
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem onClick={() => {}}>
          <Iconify icon="mdi:download" />
          Download
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <Iconify icon="solar:share-bold" />
          Share with classes/teachers
        </MenuItem>
      </MenuList>
    ),
    []
  );

  // Handle view mode change between grid and list views
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setView(newView);
      }
    },
    []
  );

  // Define breadcrumb navigation links based on form state
  const links =
    params.isForm === 'true'
      ? [
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Syllabus', href: '/academic/courseSubjects' },
          { name: 'Learning Resources' },
          { name: 'Add Learning Resource' },
        ]
      : [
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Syllabus', href: '/academic/courseSubjects' },
          { name: 'Learning Resources' },
        ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CustomBreadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        heading="Learning Resources"
        description={
          params.isForm === 'true'
            ? 'Create or update learning resource details, including the title, content, and associated subject. Manage resources efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize learning resources for each subject efficiently. View the list of resources, add new ones, update existing resources, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={params.isForm === 'true' ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              params.isForm === 'true'
                ? closeDialog
                : () => {
                    setParams({ isForm: 'true' });
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'Learning Resources'}
          </Button>
        }
      />

      {/* Conditional rendering of Create/Edit form or Resource list */}
      {params.isForm === 'true' ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <CreateNewResource
            onSave={handleSave}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            currentClass={classes}
            currentSubject={subject}
          />
        </Card>
      ) : (
        <>
          {/* Class and Subject filter controls */}
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

          {/* View toggle buttons (grid/list) */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={handleChangeView}
              sx={{
                '& .Mui-selected': {
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'black',
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <Iconify icon="mdi:view-grid" />
              </ToggleButton>
              <ToggleButton value="list">
                <Iconify icon="lucide:layout-list" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Display resources in either list or grid view */}
          {classes &&
            subject &&
            (view === 'list' ? (
              <CustomizableTable
                tableId="learning-resources"
                columns={[
                  {
                    id: 'resourceTitle',
                    label: 'Resource Title',
                    minWidth: '200px',
                    align: 'left',
                  },
                  {
                    id: 'typeOfResource',
                    label: 'Type of Resource',
                    minWidth: '200px',
                    align: 'left',
                  },
                  { id: 'className', label: 'Class', minWidth: '200px', align: 'left' },
                  { id: 'subject', label: 'Subject', minWidth: '200px', align: 'left' },
                  {
                    id: 'dateUploaded',
                    label: 'Date Uploaded',
                    minWidth: '200px',
                    align: 'left',
                    filterType: 'date',
                    isDateRangeFilter: true,
                  },
                  {
                    id: 'status',
                    label: 'Publish',
                    minWidth: '200px',
                    align: 'left',
                    render: (value, row) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 7 }}>
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
                    label: 'Actions',
                    minWidth: '180px',
                    isSort: false,
                    sticky: true,
                    isFilter: false,
                    render: (value, row) => (
                      <ThreeDotsActions
                        actions={(prop) => actions({ ...prop, row })}
                        showEditIcon
                        showDeleteIcon
                        showViewIcon
                        handleViewClick={() => {}}
                        handleDeleteClick={() => {}}
                        handleEditClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);
                          setParams({ isForm: true });
                        }}
                      />
                    ),
                  },
                ]}
                data={filteredData}
              />
            ) : (
              <LearningResourceCard
                resourceTitle="abc"
                resourceType=".doc"
                className="5"
                subject="Math"
                dateUploaded="01-Jan-2024"
              />
            ))}
        </>
      )}
    </Box>
  );
};

export default LearningResources;

// Interface defining the props for the LearningResourceCard component
interface LearningResourceCardProps {
  resourceTitle: string;
  resourceType: string;
  className: string;
  subject: string;
  dateUploaded: string;
}

// Component to display learning resource information in a card format
const LearningResourceCard: React.FC<LearningResourceCardProps> = ({
  resourceTitle,
  resourceType,
  className,
  subject,
  dateUploaded,
}) => (
  // Main card container with styling
  <Card sx={{ maxWidth: '300px', width: '100%', p: 2, mt: 2 }}>
    {/* Display resource details in rows with icons */}
    <DetailRow icon="mdi:format-title" label="Resource Title" value={resourceTitle} />
    <DetailRow icon="mdi:merge-type" label="Resource Type" value={resourceType} />
    <DetailRow icon="mdi:class" label="Class" value={className} />
    <DetailRow icon="mdi:text-subject" label="Subject" value={subject} />
    <DetailRow icon="mdi:upload" label="Date Uploaded" value={dateUploaded} />

    {/* Action buttons for download and share functionality */}
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <Button variant="contained" size="small" startIcon={<Iconify icon="mdi:download" />}>
        Download
      </Button>
      <Button
        variant="contained"
        size="small"
        color="error"
        startIcon={<Iconify icon="mdi:share" />}
      >
        Share
      </Button>
    </CardActions>
  </Card>
);

// Interface for props used in CreateLearningResources component
interface CreateLearningResourcesProps {
  onSave: (values: TResourceData) => void;
  onClose: () => void;
  data: TResourceData | null;
  isEdit: boolean;
  currentClass: string;
  currentSubject: string;
}

// Interface for form values (currently unused - can be removed if not needed)
interface FormikValue {
  resourceTitle: string;
  typeOfResource: string;
  attachedCourse: string;
  accessPermision: string;
  description: string;
  courseAndSubject: string;
  dateUploaded: string;
}

const validationSchema = Yup.object({
  id: Yup.number().required(),
  resourceTitle: Yup.string()
    .required('Resource Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  typeOfResource: Yup.string().required('Please select a resource type'),
  className: Yup.string().required('Class name is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  dateUploaded: Yup.string().required('Date uploaded is required'),
  status: Yup.string().oneOf(['draft', 'Publish', 'Unpublish'], 'Invalid status'),
});

// Component for creating and editing learning resources
const CreateNewResource: React.FC<CreateLearningResourcesProps> = ({
  data,
  onClose,
  onSave,
  isEdit,
  currentClass,
  currentSubject,
}) => {
  // State for managing messages and draft status
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'draft'));

  // Fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize formik for form handling
  const formik = useFormik<TResourceData>({
    // Set initial form values based on edit mode and existing data
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
    validationSchema,
    // Handle form submission
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
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        {/* Scrollable container for form fields */}
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2} marginTop={1}>
            {/* Class selection dropdown */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.className && formik.errors.className) || false}
              >
                <CustomSelect
                  options={classData?.items || []}
                  value={formik.values.className}
                  onChange={(val) => formik.setFieldValue('className', val as string)}
                  label="Class"
                  isLoading={isLoading}
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ sx: { minWidth: 270, width: '100%' } }}
                  error={!!(formik.touched.className && formik.errors.className) || false}
                  helperText={(formik.touched.className && formik.errors.className) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Subject selection dropdown */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.subject && formik.errors.subject) || false}
              >
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
                  error={!!(formik.touched.subject && formik.errors.subject) || false}
                  helperText={(formik.touched.subject && formik.errors.subject) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Resource title input */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
              >
                <TextField
                  disabled={isEdit}
                  label="Resource Title"
                  size="small"
                  name="resourceTitle"
                  value={formik.values.resourceTitle}
                  onChange={formik.handleChange}
                  fullWidth
                  error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
                  helperText={(formik.touched.resourceTitle && formik.errors.resourceTitle) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Resource type selection */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.typeOfResource && formik.errors.typeOfResource) || false}
              >
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
                  error={!!(formik.touched.typeOfResource && formik.errors.typeOfResource) || false}
                  helperText={(formik.touched.typeOfResource && formik.errors.typeOfResource) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Description text area */}
            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <TextField
                  label="Description"
                  size="small"
                  multiline
                  rows={4}
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  fullWidth
                  error={!!(formik.touched.description && formik.errors.description) || false}
                  helperText={(formik.touched.description && formik.errors.description) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* File upload box */}
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
        {/* Action buttons */}
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
      </Box>
    </form>
  );
};
