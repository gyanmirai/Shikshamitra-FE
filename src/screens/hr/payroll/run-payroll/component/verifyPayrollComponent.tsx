'use client';

import type { IColumn } from 'src/components/customizabaleTable/type';

import * as yup from 'yup';
import React, { useState } from 'react';

import { Box, Avatar } from '@mui/material';

import { convertBase64Format } from 'src/utils/base64Formate';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const VerifyPayrollComponent = ({ onClose }: any) => {
  const [activeStep, setActiveStep] = useState(0);
  const allTimetableSteps = [Attendance, Attendance, Salary];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{}}
      steps={['Import Attendance', 'Attendance', 'Salary']}
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
            <StepComponent formik={formik} isFirstStep={step === 0} />
          </Box>
        );
      }}
    />
  );
};

export default VerifyPayrollComponent;

const Attendance = ({ isFirstStep }: any) => {
  const columns: IColumn[] = [
    {
      id: 'employeeName',
      label: 'Full Name',
      minWidth: '12vw',
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
    { id: 'employeeCode', label: 'Employee Code', minWidth: '12vw', align: 'left' },

    {
      id: 'employeeGroup',
      label: 'Employee Group',
      minWidth: '14vw',
      align: 'left',
    },
    {
      id: 'fullWorkingDays',
      label: 'Full Working Days',
      minWidth: '14vw',
      align: 'left',
      filterType: 'number',
    },
    {
      id: 'halfWorkingDays',
      label: 'Half Working Days',
      minWidth: '14vw',
      align: 'left',
      filterType: 'number',
    },
    {
      id: 'presentDays',
      label: 'Present Days',
      minWidth: '12vw',
      align: 'left',
      filterType: 'number',
    },
    { id: 'mobileNo', label: 'Mobile No', minWidth: '10vw', align: 'left' },
    {
      id: 'leave',
      label: 'Leave',
      filterType: 'number',
      minWidth: '8vw',
      align: 'left',
    },
  ];

  if (isFirstStep) {
    columns.push({
      id: 'actions',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      sticky: true,
      minWidth: '4vw',
      render() {
        return (
          <ThreeDotsActions
            placement="right-top"
            showThreeDots={false}
            showEditIcon={isFirstStep}
            handleEditClick={() => {
              // setEditData(row);
              // setOpen(true);
            }}
          />
        );
      },
    });
  }

  return (
    <CustomizableTable
      noDataText={<>No Data Found For Payroll</>}
      tableId="employee-table"
      columns={columns}
      data={[
        {
          employeeCode: 'EMP001',
          employeeName: 'John Doe',
          profilePicture: '', // Provide a valid base64 string or URL if needed
          employeeType: 'Full-Time',
          employeeGroup: 'Teaching',
          fullWorkingDays: 22,
          halfWorkingDays: 2,
          presentDays: 20,
          mobileNo: '9876543210',
          leave: 2,
        },
        {
          employeeCode: 'EMP002',
          employeeName: 'Jane Smith',
          profilePicture: '', // Provide a valid base64 string or URL if needed
          employeeType: 'Part-Time',
          employeeGroup: 'Teaching',
          fullWorkingDays: 20,
          halfWorkingDays: 2,
          presentDays: 18,
          mobileNo: '9876543211',
          leave: 2,
        },
        {
          employeeCode: 'EMP003',
          employeeName: 'Alice Johnson',
          profilePicture: '', // Provide a valid base64 string or URL if needed
          employeeType: 'Contract',
          employeeGroup: 'Teaching',
          fullWorkingDays: 22,
          halfWorkingDays: 2,
          presentDays: 21,
          mobileNo: '9876543212',
          leave: 1,
        },
        {
          employeeCode: 'EMP004',
          employeeName: 'Robert Brown',
          profilePicture: '', // Provide a valid base64 string or URL if needed
          employeeType: 'Intern',
          employeeGroup: 'Teaching',
          fullWorkingDays: 15,
          halfWorkingDays: 2,
          presentDays: 14,
          mobileNo: '9876543213',
          leave: 1,
        },
      ]}
    />
  );
};

const Salary = ({ formik }: any) => (
  <CustomizableTable
    noDataText={<>No Data Found For Payroll</>}
    tableId="employee-salary-table"
    columns={[
      {
        id: 'employeeName',
        label: 'Employee Name',
        minWidth: '160px',
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
      { id: 'employeeId', label: 'Employee Code', minWidth: '150px', align: 'left' },
      { id: 'employeeGroup', label: 'Employee Group', minWidth: '160px', align: 'left' },
      {
        id: 'basicSalary',
        label: 'Basic Salary',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'grossSalary',
        label: 'Gross Salary',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'totalDeduction',
        label: 'Total Deduction',
        minWidth: '150px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'netPayble',
        label: 'Net Payble',
        filterType: 'number',
        minWidth: '130px',
        align: 'left',
      },
    ]}
    data={[
      {
        employeeName: 'John Doe',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP001',
        employeeType: 'Full-Time',
        salaryMonth: 'January 2025',
        employeeGroup: 'Teaching',
        basicSalary: '₹3,500',
        grossSalary: '₹4,500',
        totalDeduction: '₹500',
        netPayble: '₹4,000',
      },
      {
        employeeName: 'Jane Smith',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP002',
        employeeType: 'Part-Time',
        salaryMonth: 'January 2025',
        employeeGroup: 'Teaching',
        basicSalary: '₹2,000',
        grossSalary: '₹2,800',
        totalDeduction: '₹300',
        netPayble: '₹2,500',
      },
      {
        employeeName: 'Alice Johnson',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP003',
        employeeType: 'Contract',
        salaryMonth: 'January 2025',
        employeeGroup: 'Teaching',
        basicSalary: '₹3,200',
        grossSalary: '₹4,000',
        totalDeduction: '₹400',
        netPayble: '₹3,600',
      },
      {
        employeeName: 'Robert Brown',
        profilePicture: '', // Provide a valid base64 string or image URL
        employeeId: 'EMP004',
        employeeType: 'Intern',
        salaryMonth: 'January 2025',
        employeeGroup: 'Teaching',
        basicSalary: '₹1,500',
        grossSalary: '₹2,000',
        totalDeduction: '₹100',
        netPayble: '₹1,900',
      },
    ]}
  />
);
