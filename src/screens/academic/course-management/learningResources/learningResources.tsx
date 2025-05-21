'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Switch,
  Button,
  MenuItem,
  MenuList,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import learningResourceTableData from 'src/json/academic/syllabus/learningResourceTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CreateNewResource from './components/addResourceForm';
import LearningResourceCard from './components/learningResourceCard';

import type { IResourceData } from './type';

// Initial sample data for learning resources

const LearningResources = (props: TabComponentType) => {
  // Get search parameters from props
  const { searchParams } = props;
  // State for controlling view mode (list/grid)
  const [view, setView] = useState('list');
  const addLearningResourceDialog = useBoolean();
  // Extract class and subject from URL parameters with default empty string
  const classFromUrl = searchParams?.class || ''; // Use optional chaining
  const subjectFromUrl = searchParams?.subject || ''; // Use optional chaining

  // State for managing selected resource entry and edit mode
  const [selectedEntry, setSelectedEntry] = useState<IResourceData | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // State for storing all learning resources data
  const [resourceData, setResourceData] = useState<IResourceData[]>(learningResourceTableData);
  // const dialog = useBoolean();
  // State for confirmation dialog
  const confirm_dialog = useBoolean();
  const deleteDialog = useBoolean();

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
  const handleSave = (dataFromDialog: IResourceData) => {
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
          id: Date.now().toString(), // Generate unique ID using timestamp
          className: classes, // Set class from current filter
          dateUploaded: new Date().toLocaleDateString(), // Set current date
        },
      ]);
      shikshaMitraToast.success({ message: 'Learning Resource added successfully' });
    }
  };
  // Function to close the dialog and reset form state
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      console.log('isSubmit---', isSubmit);
      console.log('isChanges---', isChanges);
      dispatch(setIsChanges(false));

      setIsEdit(false);
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    } else if (!isChanges) {
      setIsEdit(false);
      setSelectedEntry(null);
      addLearningResourceDialog.onFalse();
    }
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

  // Delete selected subject from table
  const handleDelete = (id: string | undefined) => {
    if (selectedEntry) {
      setResourceData(resourceData.filter((resource) => resource.id !== id));
      deleteDialog.onFalse();
      setSelectedEntry(null);
    }
  };

  // Define breadcrumb navigation links based on form state
  const links = addLearningResourceDialog.value
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
          addLearningResourceDialog.value
            ? 'Create or update learning resource details, including the title, content, and associated subject. Manage resources efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize learning resources for each subject efficiently. View the list of resources, add new ones, update existing resources, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={
              addLearningResourceDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />
            }
            variant="contained"
            onClick={
              addLearningResourceDialog.value
                ? () => handleClose(null, false)
                : () => {
                    addLearningResourceDialog.onTrue();
                  }
            }
          >
            {addLearningResourceDialog.value ? 'Back' : 'Learning Resource'}
          </Button>
        }
      />

      {/* Conditional rendering of Create/Edit form or Resource list */}
      {addLearningResourceDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <CreateNewResource
            onSave={handleSave}
            onClose={handleClose}
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
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
            <CustomSelect
              label="Subject"
              disabled={!classes}
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'English', label: 'English' },
              ]}
              value={subject}
              onChange={(val) => setSubject(val as string)}
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
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
                searchFieldProps={{
                  placeholder: 'Search by Resource Title, Type, Class, Subject...',
                  label: 'Search by Resource Title, Type, Class, Subject...',
                  sx: {
                    maxWidth: '500px',
                    width: '100%',
                  },
                }}
                noDataText={
                  <>
                    No Learning Resource Found{' '}
                    <Box
                      onClick={() => {
                        addLearningResourceDialog.onTrue();
                        setSelectedEntry(null);
                      }}
                      color="primary.main"
                      fontWeight={600}
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Add Learning Resource
                    </Box>
                  </>
                }
                columns={[
                  {
                    id: 'resourceTitle',
                    label: 'Resource Title',
                    align: 'left',
                  },
                  {
                    id: 'typeOfResource',
                    label: 'Type of Resource',
                    align: 'left',
                  },
                  { id: 'className', label: 'Class', align: 'left' },
                  { id: 'subject', label: 'Subject', align: 'left' },
                  {
                    id: 'dateUploaded',
                    label: 'Date Uploaded',
                    align: 'left',
                    filterType: 'date',
                    isDateRangeFilter: true,
                  },
                  {
                    id: 'status',
                    label: 'Publish',
                    align: 'left',
                    isFilter: false,
                    isSort: false,
                    render: (value: PublishUnpublishStatusType, row: any) => (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          size="small"
                          checked={value === PublishUnpublishStatusType.Publish}
                          onChange={() => {
                            confirm_dialog.onTrue();
                          }}
                        />
                      </Box>
                    ),
                  },
                  {
                    id: 'action',
                    label: 'Action',
                    minWidth: 120,
                    isSort: false,
                    sticky: true,
                    isFilter: false,
                    render: (value, row) => (
                      <ThreeDotsActions
                        placement="right-top"
                        actions={(prop) => actions({ ...prop, row })}
                        showEditIcon
                        showDeleteIcon
                        showViewIcon
                        handleViewClick={() => {}}
                        handleDeleteClick={() => {
                          deleteDialog.onTrue();
                          setSelectedEntry(row as IResourceData);
                        }}
                        handleEditClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row as IResourceData);
                          addLearningResourceDialog.onTrue();
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content="Are you sure want to Delete Resource ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {
              handleDelete(selectedEntry?.id as string);
            }}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          confirm_dialog.onFalse();
        }}
        title="Confirm Publication"
        content="Are you sure want to Publish Resource ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              confirm_dialog.onFalse();
            }}
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default LearningResources;
