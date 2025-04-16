'use client';

import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useState } from 'react';

import { Box, Grid, Tooltip, Checkbox, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import studentFeeStructureData from 'src/json/finance/student-fee-management/studentFeeStructureData.json';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import FeeDetailsComponent from './component/fee-details-component';
import FinanceEditFeeStructureForStudent from './component/finance-edit-fee-structure-for-student';

import type { StudentForFeeStructure } from './data/student-fee-structure-interface';

const FinanceStudentFeeManagement = () => {
  // Dialog state and student selection state management
  const dialog = useBoolean();

  // Dialog state for student details
  const [open, setOpen] = useState(false);

  // State to store currently selected student for viewing details
  const [selectedStudent, setSelectedStudent] = useState<StudentForFeeStructure | null>(null);

  // State to store multiple selected students for bulk actions like notifications
  const [selectedStudents, setSelectedStudents] = useState<StudentForFeeStructure[]>([]);

  // Dialog state for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // Handlers for opening/closing student details dialog
  const handleOpen = (student: StudentForFeeStructure) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  // Handler for sending notifications to selected students
  const handleSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  // Handlers for student selection in the table
  const handleStudentSelection = (student: StudentForFeeStructure, checked: boolean) => {
    setSelectedStudents(
      checked
        ? [...selectedStudents, student]
        : selectedStudents.filter((s) => s.studentId !== student.studentId)
    );
  };

  const handleSelectAllStudents = (checked: boolean) => {
    setSelectedStudents(checked ? studentFeeStructureData : []);
  };

  // Table column configuration with rendering logic for each column
  const tableColumns = [
    {
      id: 'checkBox',
      align: 'left',
      minWidth: '60px',
      isSort: false,
      isFilter: false,
      label: '',
      // Render checkbox for selecting all students
      renderColumn: () => (
        <Checkbox
          checked={
            !!studentFeeStructureData?.length &&
            selectedStudents?.length === studentFeeStructureData?.length
          }
          onChange={(e) => handleSelectAllStudents(e.target.checked)}
        />
      ),
      // Render checkbox for individual student selection
      render: (value: any, row: StudentForFeeStructure) => (
        <Checkbox
          checked={selectedStudents.some((i) => i.studentId === row.studentId)}
          onChange={(e) => handleStudentSelection(row, e.target.checked)}
        />
      ),
    },
    {
      id: 'grNo',
      label: 'Gr No',
      filterType: 'number',
      render: (value: string) => (
        <Typography minWidth="120px" fontSize="12px">
          {value}
        </Typography>
      ),
    },
    {
      id: 'rollNo',
      label: 'Roll No',
      filterType: 'number',
      render: (value: string) => (
        <Typography minWidth="120px" fontSize="12px">
          {value}
        </Typography>
      ),
    },
    {
      id: 'division',
      label: 'Division',
      render: () => (
        <Typography minWidth="120px" fontSize="12px">
          A
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Student Name',
      render: (value: string, row: StudentForFeeStructure) => (
        <Typography minWidth="120px" fontSize="12px">
          {row.name}
        </Typography>
      ),
    },
    {
      id: 'grade',
      label: 'Class',
      filterType: 'number',
    },
    {
      id: 'totalFees',
      label: 'Gross Fees',
      filterType: 'number',
      // Render formatted total fees in INR currency
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography minWidth="100px" fontSize="12px">
          {formatNumber(row.totalFees, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'finalFees',
      label: 'Payable Fees',
      filterType: 'number',
      // Render formatted final fees in INR currency
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography minWidth="120px" fontSize="12px">
          {formatNumber(row.finalFees, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'totalGeneralDiscount',
      label: 'Total General Discount',
      filterType: 'number',
      // Render formatted general discount amount in INR currency
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography sx={{ textAlign: 'center' }} minWidth="200px" fontSize="12px">
          {formatNumber(row.totalGeneralDiscount, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'totalAdditionalDiscount',
      label: 'Total Additional Discount',
      filterType: 'number',
      // Render formatted additional discount amount in INR currency
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography minWidth="180px" fontSize="12px" sx={{ textAlign: 'center' }}>
          {formatNumber(row.totalAdditionalDiscount, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'totalPaid',
      label: 'Total Paid',
      filterType: 'number',
      // Render formatted total paid amount in INR currency with green color
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography minWidth="100px" fontSize="12px" color="#1a8877">
          {formatNumber(row.totalPaid, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'totalPending',
      label: 'Total Pending',
      filterType: 'number',
      // Render formatted pending amount in INR currency with red color
      render: (value: number, row: StudentForFeeStructure) => (
        <Typography minWidth="120px" fontSize="12px" color="red">
          {formatNumber(row.totalPending, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      isSort: false,
      isFilter: false,
      sticky: true,
      align: 'right',

      // Render view action button for each row
      render: (value: any, row: StudentForFeeStructure) => (
        <ThreeDotsActions
          placement="right-top"
          showThreeDots={false}
          showViewIcon
          handleViewClick={() => handleOpen(row)}
        />
      ),
    },
  ];
  return (
    <>
      <CustomBreadcrumbs
        description="This is a general tab where you can view the detailed fee structure of a student. Use the search option to find and explore the fee-related information for any specific student."
        heading="Student Fee Structure"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fee Management' },
          { name: 'Student Fee Structure' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <Grid container sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Grid item lg={2}>
          <CustomSelect
            label="Class"
            name="className"
            options={[]}
            labelKey="name"
            valueKey="name"
            value={[]}
            onChange={(value) => console.log('className', value)}
            fullWidth
          />
        </Grid>
        <Grid item lg={2}>
          <CustomSelect
            fullWidth
            label="Division"
            labelKey="name"
            valueKey="id"
            options={[]}
            value={[]}
            onChange={(val) => console.log(val as string)}
          />
        </Grid>
      </Grid>

      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by GR NO, Roll No, Class..',
          label: 'Search by GR NO, Roll No, Class..',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        onSendNotification={handleSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="student-fee-management"
        columns={tableColumns as IColumn[]}
        data={studentFeeStructureData}
        noDataText={<>No Student found. Please select class and division to view the details.</>}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={studentFeeStructureData}
          userList={selectedStudents}
        />
      )}

      {selectedStudent && (
        <CustomDialog
          title={
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Typography variant="h5">
                {`Fee Details for ${selectedStudent.name} / Standard: ${selectedStudent.grade}th -A `}
              </Typography>
              <Tooltip
                arrow
                placement="right"
                title="This dialog displays the fee details of a student, where you can find a complete overview of their fee information."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </Tooltip>
            </Box>
          }
          open={open}
          handleClose={handleClose}
          maxWidth="xl"
        >
          <Scrollbar sx={{ overflow: 'auto', maxHeight: '550px' }}>
            <FeeDetailsComponent students={selectedStudent} />
          </Scrollbar>
        </CustomDialog>
      )}

      {dialog.value && selectedStudent && (
        <FinanceEditFeeStructureForStudent
          onSave={(data) => {}}
          dialogValue={dialog.value}
          onClose={dialog.onFalse}
          data={selectedStudent}
        />
      )}
    </>
  );
};

export default FinanceStudentFeeManagement;
