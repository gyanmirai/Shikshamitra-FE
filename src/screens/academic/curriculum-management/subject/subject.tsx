'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';

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
    subjectName: 'Mathematics',
    subjectCode: 'Math01',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#f04622',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mr. Smith'],
    prerequisites: 'Basic counting skills',
    learningGoal: 'Develop understanding of numbers, addition, and subtraction.',
    status: 'Publish',
  },
  {
    id: 2,
    subjectName: 'Science',
    subjectCode: 'Sci02',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#4e7dbe',
    className: '2',
    primaryTeacher: 'Mr. Smith',
    secondaryTeacher: ['Ms. Johnson'],
    prerequisites: 'Interest in nature and environment',
    learningGoal: 'Understand basic concepts of earth science and the environment.',
    status: 'Unpublish',
  },
  {
    id: 3,
    subjectName: 'English',
    subjectCode: 'Eng03',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#4e7dbe',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Basic reading skills',
    learningGoal: 'Enhance reading comprehension and vocabulary.',
    status: 'Publish',
  },
  {
    id: 4,
    subjectName: 'History',
    subjectCode: 'Hist01',
    scheduleDate: dayjs('2024-10-28'),
    description: '',
    subjectColor: '#7abe4e',
    className: '1',
    primaryTeacher: 'Ms. Johnson',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Interest in past events',
    learningGoal: 'Learn about important historical events and figures.',
    status: 'Unpublish',
  },
  {
    id: 5,
    subjectName: 'Geography',
    scheduleDate: dayjs('2024-10-28'),
    subjectCode: 'Geo01',
    description: '',
    subjectColor: '#4444',
    className: '3',
    primaryTeacher: 'Ms. Davis',
    secondaryTeacher: ['Mrs. Green'],
    prerequisites: 'Basic map reading skills',
    learningGoal: 'Develop an understanding of world geography and countries.',
    status: 'Publish',
  },
];

const Subject = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const [subjectTableData, setSubjectTableData] = useState(subjectData);
  const [filteredData, setFilteredData] = useState<TSubjectTable[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [open, setOpen] = useState(false);
  const deleteConfirmDialog = useBoolean();
  const confirmPublishDialog = useBoolean();
  const showSubjectDialog = useBoolean();
  const addBulkDialog = useBoolean();
  const [classes, setClasses] = useState('');

  const [selectedSubject, setSelectedSubject] = useState<TSubjectTable | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!classes) {
        const firstClass = classData.items[0];
        setClasses(firstClass?.id);
      }
      const selectedClass = classData.items.find((c: any) => c.id === classes);
      if (selectedClass) {
        const filtered = subjectTableData.filter((item) => item.className === selectedClass?.name);
        setFilteredData(filtered);
      }
    }
  }, [classData, subjectTableData, setSearchParams, classes]);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const handleSubmit = (values: TSubjectTable) => {
    if (isEdit) {
      setSubjectTableData(
        subjectTableData.map((subject) => (subject.id === values.id ? values : subject))
      );
    } else {
      setSubjectTableData([...subjectTableData, values]);
    }
    setOpen(false);
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handleViewSubject = (subject: TSubjectTable) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };

  const handleCloseDialog = () => {
    setOpen(false);
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setSelectedSubject(null);
  };

  const handleDelete = () => {
    if (selectedSubject) {
      setSubjectTableData(subjectTableData.filter((subject) => subject.id !== selectedSubject.id));
      deleteConfirmDialog.onFalse();
      setSelectedSubject(null);
    }
  };

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

  const actions = useCallback(({ popover: pop, row }: any) => <> </>, []);

  return (
    <Box>
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Subjects"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum' },
              { name: 'Subject' },
              { name: 'Subject Form' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleCloseDialog}
              >
                Back
              </Button>
            }
          />
          <Card>
            <SubjectForm
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
              data={selectedSubject}
              isEdit={isEdit}
            />{' '}
          </Card>
          {/* </CustomDialog> */}
        </>
      ) : (
        <>
          {' '}
          <CustomBreadcrumbs
            heading="Subjects"
            links={[
              { name: 'Academic and Assignment' },
              { name: 'Curriculum' },
              { name: 'Subject' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Add />}
                size="small"
                variant="contained"
                onClick={() => {
                  setOpen(true);
                  setIsEdit(false);
                  setSelectedSubject(null);
                }}
              >
                Subject
              </Button>
            }
          />
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
              // setClasses(value);
            }}
          />
          {classes && (
            <CustomizableTable
              tableId="subject-table"
              columns={[
                { id: 'subjectCode', label: 'Subject Code', minWidth: '150px', align: 'left' },
                {
                  id: 'subjectName',
                  label: 'Subject Name',
                  minWidth: '180px',
                  align: 'left',
                  render(value, row) {
                    return (
                      <Typography variant="caption" color={row.subjectColor}>
                        {value}
                      </Typography>
                    );
                  },
                },
                {
                  id: 'primaryTeacher',
                  label: 'Primary Teacher',
                  minWidth: '180px',
                  align: 'left',
                },
                {
                  id: 'secondaryTeacher',
                  label: 'Secondary Teacher',
                  minWidth: '200px',
                  align: 'left',
                  render: (value) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {value.map((audience: string, index: number) => (
                        // <Chip key={audience} label={audience} size="small" variant="outlined" />
                        // <Typography
                        //   component="span"
                        //   variant="body2"
                        //   sx={{
                        //     px: 1.0,
                        //     py: 0.5,
                        //     borderRadius: '30px',
                        //     border: `1px solid black`,
                        //     fontSize: '0.75rem',
                        //   }}
                        // >
                        //   {audience}
                        // </Typography>
                        <Typography variant="caption">
                          {audience}
                          {index < value.length - 1 && ' | '}
                        </Typography>
                      ))}
                    </Box>
                  ),
                },
                {
                  id: 'scheduleDate',
                  label: 'Schedule Date',
                  minWidth: '180px',
                  align: 'left',
                  render: (value, row) => (
                    <Typography fontSize="12px" gutterBottom>
                      {dayjs(value).format('DD MMM YYYY')}
                    </Typography>
                  ),
                },
                { id: 'prerequisites', label: 'Prerequisites' },
                { id: 'learningGoal', label: 'Learning Goal', minWidth: '150px', align: 'left' },
                {
                  id: 'status',
                  label: 'Publish',
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
                {
                  id: 'action',
                  label: 'Actions',
                  isSort: false,
                  render(value, row) {
                    const subject = subjectTableData.find((s) => s.id === row.id);
                    return (
                      <ThreeDotsActions
                        // actions={(prop) => actions({ ...props, row })}
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
                          setOpen(true);
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
