'use client';

import * as yup from 'yup';
import React, { useState } from 'react';

import { Box, Avatar } from '@mui/material';

import { convertBase64Format } from 'src/utils/base64Formate';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const VerifyPayrollComponent = ({ onClose }: any) => {
  const [activeStep, setActiveStep] = useState(0);
  const allTimetableSteps = [Attendance, Salary];

  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={['Attendance', 'Salary']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <Box p={2}>
            <StepComponent formik={formik} />
          </Box>
        );
      }}
    />
  );
};

export default VerifyPayrollComponent;

const Attendance = ({ formik }: any) => (
  <CustomizableTable
    tableId="employee-table"
    columns={[
      { id: 'employeeCode', label: 'Employee Code', minWidth: '180px', align: 'left' },
      {
        id: 'employeeName',
        label: 'Full Name',
        minWidth: '150px',
        align: 'left',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                alt={value}
                src={convertBase64Format(row.profilePicture)}
                sx={{ height: 32, width: 32 }}
              />{' '}
              {value}
            </Box>
          );
        },
      },
      { id: 'employeeType', label: 'Employee Type', minWidth: '180px', align: 'left' },
      {
        id: 'department',
        label: 'Department',
        minWidth: '180px',
        align: 'left',
      },
      { id: 'totalWorkingDays', label: 'Total Working Days', minWidth: '250px', align: 'left' },
      { id: 'presentDays', label: 'Present Days', minWidth: '180px', align: 'left' },
      { id: 'mobileNo', label: 'Mobile No', minWidth: 150 },
      {
        id: 'leave',
        label: 'Leave',
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showEditIcon
              handleEditClick={() => {
                // setEditData(row);
                // setOpen(true);
              }}
            />
          );
        },
      },
    ]}
    data={[
      {
        employeeCode: 'EMP001',
        employeeName: 'John Doe',
        profilePicture: '', // Provide a valid base64 string or URL if needed
        employeeType: 'Full-Time',
        department: 'Engineering',
        totalWorkingDays: 22,
        presentDays: 20,
        mobileNo: '9876543210',
        leave: 2,
      },
      {
        employeeCode: 'EMP002',
        employeeName: 'Jane Smith',
        profilePicture: '', // Provide a valid base64 string or URL if needed
        employeeType: 'Part-Time',
        department: 'HR',
        totalWorkingDays: 20,
        presentDays: 18,
        mobileNo: '9876543211',
        leave: 2,
      },
      {
        employeeCode: 'EMP003',
        employeeName: 'Alice Johnson',
        profilePicture: '', // Provide a valid base64 string or URL if needed
        employeeType: 'Contract',
        department: 'Finance',
        totalWorkingDays: 22,
        presentDays: 21,
        mobileNo: '9876543212',
        leave: 1,
      },
      {
        employeeCode: 'EMP004',
        employeeName: 'Robert Brown',
        profilePicture: '', // Provide a valid base64 string or URL if needed
        employeeType: 'Intern',
        department: 'Marketing',
        totalWorkingDays: 15,
        presentDays: 14,
        mobileNo: '9876543213',
        leave: 1,
      },
    ]}
  />
);

const Salary = ({ formik }: any) => (
  <CustomizableTable
    tableId="employee-salary-table"
    columns={[
      {
        id: 'employeeName',
        label: 'Employee Name',
        minWidth: '180px',
        align: 'left',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                alt={value}
                src={convertBase64Format(row.profilePicture)}
                sx={{ height: 32, width: 32 }}
              />{' '}
              {value}
            </Box>
          );
        },
      },
      { id: 'employeeId', label: 'Employee Id', minWidth: '180px', align: 'left' },
      { id: 'employeeType', label: 'Employee Type', minWidth: '180px', align: 'left' },
      {
        id: 'salaryMonth',
        label: 'Salary Month',
        minWidth: '180px',
        align: 'left',
      },
      { id: 'department', label: 'Department', minWidth: '150px', align: 'left' },
      { id: 'basicSalary', label: 'Basic Salary', minWidth: '180px', align: 'left' },
      { id: 'grossSalary', label: 'Gross Salary', minWidth: '150px', align: 'left' },
      { id: 'totalDeduction', label: 'Total Deduction', minWidth: '180px', align: 'left' },
      {
        id: 'netPayble',
        label: 'Net Payble',
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showEditIcon
              handleEditClick={() => {
                // setEditData(row);
                // setOpen(true);
              }}
            />
          );
        },
      },
    ]}
    data={[
      {
        employeeName: 'John Doe',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP001',
        employeeType: 'Full-Time',
        salaryMonth: 'January 2025',
        department: 'Engineering',
        basicSalary: '$3,500',
        grossSalary: '$4,500',
        totalDeduction: '$500',
        netPayble: '$4,000',
      },
      {
        employeeName: 'Jane Smith',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP002',
        employeeType: 'Part-Time',
        salaryMonth: 'January 2025',
        department: 'HR',
        basicSalary: '$2,000',
        grossSalary: '$2,800',
        totalDeduction: '$300',
        netPayble: '$2,500',
      },
      {
        employeeName: 'Alice Johnson',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP003',
        employeeType: 'Contract',
        salaryMonth: 'January 2025',
        department: 'Finance',
        basicSalary: '$3,200',
        grossSalary: '$4,000',
        totalDeduction: '$400',
        netPayble: '$3,600',
      },
      {
        employeeName: 'Robert Brown',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP004',
        employeeType: 'Intern',
        salaryMonth: 'January 2025',
        department: 'Marketing',
        basicSalary: '$1,500',
        grossSalary: '$2,000',
        totalDeduction: '$100',
        netPayble: '$1,900',
      },
    ]}
  />
);
