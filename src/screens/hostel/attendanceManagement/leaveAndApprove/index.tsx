'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import { Add, Cancel, CheckCircleOutline } from '@mui/icons-material';
import { Box, Card, Button, TextField, IconButton, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import hostelLeaveData from 'src/json/hostel/hostelLeaveApprove/hostel-leave-data.json';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HostelLeaveForm from './components/leaveForm';
import HostelLeaveAbsent from './components/leaveAbsent';

import type { IStudentAttendanceLeave } from './type';

const LeaveAndApprove = () => {
  // State to store the starting date of the leave request, initialized with current date
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  // State to store the ending date of the leave request, initialized with current date
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs()); // State for storing the selected hostel
  const [hostel, setHostel] = useState<string>('');
  // Dialog state for confirming rejection of leave requests
  const confirmRejectDialog = useBoolean();

  // State to manage the table data containing student attendance and leave information
  const [hostelTableData, setHostelTableData] =
    useState<IStudentAttendanceLeave[]>(hostelLeaveData);

  // Dialog state for managing leave request form visibility
  const leaveRequestDialog = useBoolean();
  // State for division options based on selected class
  const [student, setStudent] = useState<string>('');
  // State for managing the visibility of the hostel form.
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // Selector for retrieving the 'isChanges' state from the Redux store.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Attendance And Leave Management', href: '' },
        { name: 'Leave And Approve', href: '' },
        { name: 'Leave Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Attendance And Leave Management', href: '' },
        { name: 'Leave And Approve', href: '' },
      ];

  // Handler function for closing the hostel form, optionally handling form submission and changes.
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      leaveRequestDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setOpen(false);
      leaveRequestDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Leave And Approve"
        description={
          open
            ? 'Create or update student leave requests, including leave type, dates, and reason. Submit leave applications and track their approval status.'
            : 'View and manage student leave requests, including pending approvals, approved leaves, and rejected applications. Take action on leave requests as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleClose(null, false)
                : () => {
                    leaveRequestDialog.onTrue();
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Leave Request'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <HostelLeaveForm
            open={leaveRequestDialog}
            onClose={() => {
              handleClose(null, false);
            }}
          />
        </Card>
      ) : (
        <>
          <Box display="flex" gap={2}>
            <Autocomplete
              options={[
                { id: 'H1', name: 'Hostel A' },
                { id: 'H2', name: 'Hostel B' },
                { id: 'H3', name: 'Hostel C' },
              ]}
              getOptionLabel={(option) => option.name || ''}
              onChange={(_, value) => {
                setHostel(value?.id || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Hostel"
                  name="hostel"
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              )}
              sx={{ maxWidth: '200px', width: '100%' }}
            />
            <DatePicker
              label="From Date"
              format="DD/MM/YYYY"
              value={fromDate}
              onChange={(date) => {
                setFromDate(date);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              sx={{ maxWidth: '200px', width: '100%' }}
            />
            <DatePicker
              label="To Date"
              format="DD/MM/YYYY"
              value={toDate}
              onChange={(date) => {
                setToDate(date);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              sx={{ maxWidth: '200px', width: '100%' }}
            />{' '}
            <Autocomplete
              options={[
                { id: '1', name: 'Student 1' },
                { id: '2', name: 'Student 2' },
                { id: '3', name: 'Student 3' },
              ]}
              getOptionLabel={(option) => option.name || ''}
              onChange={(_, value) => {
                setStudent(value?.id || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Student"
                  name="student"
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              )}
              sx={{ maxWidth: '200px', width: '100%' }}
            />
          </Box>
          <CustomizableTable
            tableId="student-attendance-list"
            noDataText="No Students Found"
            searchFieldProps={{
              placeholder: 'Search Room No, Student Name...',
              label: 'Search Room No, Student Name...',
            }}
            isSearch={false}
            columns={[
              {
                id: 'studentName',
                label: 'Student Name',
                align: 'left',
                minWidth: 150,
              },
              {
                id: 'roomNo',
                label: 'Room No',
                align: 'left',
                minWidth: '100px',
              },
              {
                id: 'hostelName',
                label: 'Hostel Name',
                align: 'left',
                minWidth: 150,
              },
              {
                id: 'leaveType',
                label: 'Leave Type',
                align: 'left',
                minWidth: 120,
              },
              {
                id: 'startDate',
                label: 'Start Date',
                align: 'left',
                minWidth: 120,

                filterType: 'date',
              },
              {
                id: 'endDate',
                label: 'End Date',
                align: 'left',
                minWidth: 120,
                filterType: 'date',
              },
              {
                label: 'Half Day',
                id: 'isHalfDay',
                minWidth: '100px',
                render(value, row) {
                  return value ? 'Yes' : 'No';
                },
              },
              {
                label: 'Description',
                id: 'description',
                align: 'left',
              },
              {
                label: 'Rejection Reason',
                id: 'rejectionReason',
                align: 'left',
                minWidth: '200px',
                render(value, row) {
                  return value || '-';
                },
              },
              {
                label: 'Status',
                id: 'statusValue',
                filterType: 'enum',
                enumOptions: EmployeeLeaveStatusOptions,
                render(value, row) {
                  const color = EmployeeLeaveStatusTypeColor[
                    value as EmployeeLeaveStatusType
                  ] as LabelColor;

                  return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
                },
              },
              {
                id: 'actions',
                label: 'Actions',
                sticky: true,
                minWidth: 80,
                isSort: false,
                isFilter: false,
                render(value, row) {
                  return (
                    <Box display="flex" gap={1}>
                      {row.statusValue === 'Pending' ? (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              // setWhichStatus(EmployeeLeaveStatusType.Approved);
                              // setLeaveId(row.id);
                              confirmRejectDialog.onTrue();
                            }}
                          >
                            <CheckCircleOutline />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              // setWhichStatus(EmployeeLeaveStatusType.Rejected);
                              // setLeaveId(row.id);
                              confirmRejectDialog.onTrue();
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        '-'
                      )}
                    </Box>
                  );
                },
              },
            ]}
            data={hostelTableData}
          />
        </>
      )}

      <CustomDialog
        title="Remarks"
        open={confirmRejectDialog.value}
        handleClose={() => {
          // setWhichStatus(null);
          confirmRejectDialog.onFalse();
          // setLeaveId('');
        }}
      >
        <HostelLeaveAbsent
          handleClose={() => {
            // setWhichStatus(null);
            confirmRejectDialog.onFalse();
            // setLeaveId('');
          }}
          // leaveId={leaveId}
          // status={whichStatus}
        />
      </CustomDialog>
    </Box>
  );
};

export default LeaveAndApprove;
