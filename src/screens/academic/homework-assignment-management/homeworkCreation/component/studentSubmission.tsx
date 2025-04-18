'use client';

import type { TStudentGrade } from 'src/screens/academic/gradebook-performance-tracking/gradebook/gradebook';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import { Box, MenuList, MenuItem, Checkbox, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AssignGrade from './assignGradeForm';

import type { IStudentSubmissionsProps } from '../type';

export const StudentSubmissions: React.FC<IStudentSubmissionsProps> = ({
  selectedStudents,
  handleBulkUpdate,
  tableData,
  setTableData,
}) => {
  // State to track the currently selected student for individual grading
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>();

  // Dialog control for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // Dialog control for single student grade assignment
  const dialog = useBoolean();

  // Dialog control for viewing student submission details
  const viewSubmissionDialog = useBoolean();

  /**
   * Handles assigning grade and feedback to a single selected student
   * @param values Object containing the grade and feedback to assign
   */
  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData?.((prevData: TStudentGrade[]) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    dialog.onFalse();
    setSelectedStudent(null);
  };

  /**
   * Handles closing the view submission dialog and resetting the selected student
   */
  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Submitted' && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow" sx={{ height: '16px', width: '16px' }} />
              Assign Grade
            </MenuItem>
          )}
          {(row.status === 'Pending' || row.status === 'Overdue') && (
            <MenuItem onClick={() => {}}>
              {' '}
              <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
              Send Reminder
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog]
  );

  /**
   * Handler for sending notifications
   * Opens the instant notification dialog if it's not already open
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents?.length !== 0}
        tableId="student-submissions"
        searchFieldProps={{
          placeholder: 'Search by Student Name, Assignments, Subject, Submission Date...',
          label: 'Search by Student Name, Assignments, Subject, Submission Date...',
        }}
        noDataText="No Submission Data Found Select Above Dropdown Data"
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleBulkUpdate?.(tableData || []);
                    } else {
                      handleBulkUpdate?.([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents?.some((i: TStudentGrade) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleBulkUpdate?.([...(selectedStudents || []), row as TStudentGrade]);
                    } else {
                      handleBulkUpdate?.(
                        (selectedStudents || []).filter((i: any) => i.id !== row.id)
                      );
                    }
                  }}
                />
              );
            },
          },
          // {
          //   id: 'select',
          //   label: 'Select',
          //   render: (value, row: any) => (
          //     <Checkbox
          //       checked={selectedStudents.includes(row.id)}
          //       onChange={() => handleSelectStudent(row.id)}
          //     />
          //   ),
          // },
          { id: 'studentName', label: 'Student Name', minWidth: '180px', align: 'left' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'subject', label: 'Subject' },
          {
            id: 'submissionDate',
            label: 'Submission Date',
            minWidth: '180px',
            align: 'left',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'grade',
            label: 'Grade',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          { id: 'weightedAverage', label: 'Weighted Average', minWidth: '180px', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Label
                color={
                  value === 'Submitted'
                    ? 'primary'
                    : value === 'Pending'
                      ? 'warning'
                      : value === 'Overdue'
                        ? 'error'
                        : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    // viewSubmissionDialog.onTrue();
                    // setSelectedStudent(row);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title="Assign Grade"
        maxWidth="md"
      >
        <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};
