'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Button,
  Switch,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectForm from './component/subjectFormComponent';
import { ViewSubject } from './component/viewSubjectComponent';

export interface Document {
  id: string;
  name: string;
  url: string;
  file?: File;
}

export interface TSubjectTable {
  id: number;
  subjectName: string;
  subjectCode: string;
  scheduleDate: Dayjs | null;
  className: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  documents?: Document[];
  prerequisites: string;
  learningGoal: string;
  subjectColor: string;
  description: string;
  status: string;
}

export const subjectData: TSubjectTable[] = [
  {
    id: 1,
    subjectCode: 'MTH101',
    subjectName: 'Mathematics',
    subjectColor: 'blue',
    primaryTeacher: 'Mr. Rajesh Sharma',
    secondaryTeacher: ['Ms. Neha Verma', 'Mr. Suresh Kumar'],
    scheduleDate: dayjs('2025-03-10', 'YYYY-MM-DD'),
    prerequisites: 'Basic Arithmetic',
    learningGoal: 'Understand algebra and geometry concepts',
    status: 'Publish',
    className: '1',
    description: '',
  },
  {
    id: 2,
    subjectCode: 'SCI202',
    subjectName: 'Science',
    subjectColor: 'green',
    primaryTeacher: 'Ms. Priya Mehta',
    secondaryTeacher: ['Mr. Rohan Patel'],
    scheduleDate: dayjs('2025-04-15', 'YYYY-MM-DD'),
    prerequisites: 'Introduction to Biology',
    learningGoal: 'Develop understanding of ecosystems and physics fundamentals',
    status: 'Unpublish',
    className: '1',
    description: '',
  },
  {
    id: 3,
    subjectCode: 'ENG301',
    subjectName: 'English Literature',
    subjectColor: 'purple',
    primaryTeacher: 'Mrs. Kavita Shah',
    secondaryTeacher: ['Ms. Pooja Iyer', 'Mr. Ankit Tiwari'],
    scheduleDate: dayjs('2025-02-28', 'YYYY-MM-DD'),
    prerequisites: 'Basic Grammar',
    learningGoal: 'Improve writing and reading skills',
    status: 'Publish',
    className: '1',
    description: '',
  },
];

const Subject = (props: TabComponentType) => {
  // State to manage subject table data and filtered data
  const [subjectTableData, setSubjectTableData] = useState(subjectData);
  const [filteredData, setFilteredData] = useState<TSubjectTable[]>([]);

  // Query hook to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // URL search parameter state for form visibility
  const [params, setParams] = useSearchParam({ isForm: 'false' });

  // Dialog control states using boolean hooks
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const addBulkDialog = useBoolean();
  const [classes, setClasses] = useState('');

  // State for managing selected subject and edit mode
  const [selectedSubject, setSelectedSubject] = useState<TSubjectTable | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // State to track pending status changes for subjects
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Filter and update subject data based on selected class
  useEffect(() => {
    if (classData?.items?.length) {
      // Set default class if none selected
      if (!classes) {
        const firstClass = classData.items[0];
        setClasses(firstClass?.id);
      }
      // Find selected class and filter subjects
      const selectedClass = classData.items.find((c: any) => c.id === classes);
      if (selectedClass) {
        const filtered = subjectTableData.filter((item) => item.className === selectedClass?.name);
        setFilteredData(filtered);
      }
    }
  }, [classData, subjectTableData, classes]);

  // Handle subject status toggle between Publish/Unpublish
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  // Handle form submission for creating/updating subjects
  const handleSubmit = (values: TSubjectTable) => {
    if (isEdit) {
      // Update existing subject
      setSubjectTableData(
        subjectTableData.map((subject) => (subject.id === values.id ? values : subject))
      );
    } else {
      // Add new subject
      setSubjectTableData([...subjectTableData, values]);
    }
    setParams({ isForm: 'false' });
    setIsEdit(false);
    setSelectedSubject(null);
  };

  // Open dialog to view subject details
  const handleViewSubject = (subject: TSubjectTable) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };

  // Close all dialogs and reset form state
  const handleCloseDialog = () => {
    setParams({ isForm: 'false' });
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  // Delete selected subject from table
  const handleDelete = () => {
    if (selectedSubject) {
      setSubjectTableData(subjectTableData.filter((subject) => subject.id !== selectedSubject.id));
      deleteConfirmDialog.onFalse();
      setSelectedSubject(null);
    }
  };

  // Confirm and apply status change for subject
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setSubjectTableData((prevSubject) =>
        prevSubject.map((subject) =>
          subject.id === id ? { ...subject, status: newValue } : subject
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  // Define breadcrumb navigation links based on whether form is active
  const links =
    params.isForm === 'true'
      ? [
          // Links when form is open
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculum-management' },
          { name: 'Subject' },
          { name: 'Subject Form' },
        ]
      : [
          // Links when viewing subject list
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculum-management' },
          { name: 'Subject' },
        ];

  return (
    <Box>
      {/* Custom breadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        heading="Subject"
        description={
          params.isForm === 'true'
            ? 'Create or update subject details, including the name, code, and associated curriculum. Manage subjects efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize your academic subjects efficiently. View the list of subjects, add new subjects, update existing ones, or remove them as needed.'
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
                ? handleCloseDialog
                : () => {
                    setParams({ isForm: 'true' });
                    setIsEdit(false);
                    setSelectedSubject(null);
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'Subject'}
          </Button>
        }
      />
      {/* Conditional rendering based on form state */}
      {params.isForm === 'true' ? (
        <>
          {/* Subject form card for creating/editing subjects */}
          <Card>
            <SubjectForm
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
              data={selectedSubject}
              isEdit={isEdit}
            />{' '}
          </Card>
        </>
      ) : (
        <>
          {/* Class selection dropdown */}
          <CustomSelect
            label="Class"
            name="class"
            isLoading={isLoading}
            options={classData?.items || []}
            valueKey="id"
            labelKey="name"
            formControlProps={{ sx: { width: '150px', mb: 2 } }}
            value={classes}
            onChange={(value) => {
              setClasses(value as string);
            }}
          />
          {/* Subject table displayed when class is selected */}
          {classes && (
            <CustomizableTable
              tableId="subject-table"
              columns={[
                // Subject code column
                { id: 'subjectCode', label: 'Subject Code', minWidth: '180px', align: 'left' },
                // Subject name column with custom color rendering
                {
                  id: 'subjectName',
                  label: 'Subject Name',
                  minWidth: '200px',
                  align: 'left',
                  render(value, row) {
                    return (
                      <Typography variant="caption" color={row.subjectColor}>
                        {value}
                      </Typography>
                    );
                  },
                },
                // Primary teacher column
                {
                  id: 'primaryTeacher',
                  label: 'Primary Teacher',
                  minWidth: '200px',
                  align: 'left',
                },
                // Secondary teacher column with custom rendering for multiple teachers
                {
                  id: 'secondaryTeacher',
                  label: 'Secondary Teacher',
                  minWidth: '200px',
                  align: 'left',
                  render: (value) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {value.map((audience: string, index: number) => (
                        <Typography variant="caption">
                          {audience}
                          {index < value.length - 1 && ' | '}
                        </Typography>
                      ))}
                    </Box>
                  ),
                },
                // Schedule date column with date formatting
                {
                  id: 'scheduleDate',
                  label: 'Schedule Date',
                  minWidth: '180px',
                  align: 'left',
                  filterType: 'date',
                  isDateRangeFilter: true,
                  render: (value, row) => (
                    <Typography fontSize="12px" gutterBottom>
                      {dayjs(value).format('DD MMM YYYY')}
                    </Typography>
                  ),
                },
                // Prerequisites column
                { id: 'prerequisites', label: 'Prerequisites', minWidth: '200px', align: 'left' },
                // Learning goal column
                { id: 'learningGoal', label: 'Learning Goal', minWidth: '200px', align: 'left' },
                // Publish status column with toggle switch
                {
                  id: 'status',
                  label: 'Publish',
                  minWidth: '200px',
                  align: 'left',
                  render: (value: string, row: any) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        size="small"
                        checked={value === 'Publish'}
                        onChange={() => handleStatusChange(row.id, value as string)}
                      />
                    </Box>
                  ),
                },
                // Actions column with view, edit, and delete options
                {
                  id: 'action',
                  label: 'Actions',
                  align: 'left',
                  sticky: true,
                  isFilter: false,
                  isSort: false,
                  render(value, row) {
                    const subject = subjectTableData.find((s) => s.id === row.id);
                    return (
                      <ThreeDotsActions
                        placement="right-top"
                        showViewIcon
                        showEditIcon
                        showDeleteIcon
                        showThreeDots={false}
                        handleViewClick={() => {
                          if (subject) {
                            handleViewSubject(subject);
                          }
                        }}
                        handleEditClick={() => {
                          setSelectedSubject(row as any);
                          setIsEdit(true);
                          setParams({ isForm: true });
                        }}
                        handleDeleteClick={() => {
                          setSelectedSubject(row as any);
                          deleteConfirmDialog.onTrue();
                        }}
                      />
                    );
                  },
                },
              ]}
              data={filteredData}
            />
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Subject"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete subject {selectedSubject?.subjectName} ?
          </DialogContentText>
        </DialogContent>{' '}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      {/* Publish confirmation dialog */}
      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Subject?
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

      {/* View subject details dialog */}
      <CustomDialog
        title="Subject Details"
        open={showSubjectDialog.value}
        handleClose={() => {
          showSubjectDialog.onFalse();
          setSelectedSubject(null);
        }}
        maxWidth="sm"
      >
        <ViewSubject subject={selectedSubject} />
      </CustomDialog>
    </Box>
  );
};

export default Subject;
