'use client';

import React from 'react';

import { Box, MenuList, MenuItem } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AdmissionFeesScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Admission Fees"
      links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Admission Fees' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <CustomizableTable
      columns={[
        { id: 'inquiryNo', label: 'inquiryNo' },
        { id: 'FirstName', label: 'First Name' },
        { id: 'MiddleName', label: 'Middle Name' },
        { id: 'Name', label: 'Name' },
        { id: 'Code', label: 'Code' },
        { id: 'class', label: 'Class' },
        { id: 'Organization', label: 'Organization' },
        { id: 'parentContactNo', label: 'Parent Contact No' },
        { id: 'EmployeeDesignation', label: 'Role' },
        { id: 'totalAmount', label: 'Total Amount' },
        { id: 'paidAmount', label: 'Paid Amount' },

        {
          id: 'StatusName',
          label: 'Status',
          render(value, row) {
            return (
              <Label variant="soft" color={value === 'Completed' ? 'success' : 'warning'}>
                {value}
              </Label>
            );
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(props) => (
                  <MenuList>
                    <MenuItem>
                      <Iconify icon="tdesign:money" />
                      Pay Fees
                    </MenuItem>
                  </MenuList>
                )}
                placement="right-top"
              />
            );
          },
        },
      ]}
      data={[
        {
          Organization: 'primary',
          Code: 'REG001',
          Name: 'Sarah Anderson',
          FirstName: 'Sarah',
          MiddleName: 'Marie',
          EmployeeDesignation: 'Student',
          StatusName: 'Completed',
          parentContactNo: '+91-555-0101',
          class: '5',
          inquiryNo: 'INQ001',
          totalAmount: 100,
          paidAmount: 100,
        },
        {
          Organization: 'pre-primary',
          Code: 'REG002',
          Name: 'Michael Chen',
          FirstName: 'Michael',
          MiddleName: 'James',
          EmployeeDesignation: 'Student',
          StatusName: 'Pending',
          parentContactNo: '+91-555-0102',
          class: 'KG-2',
          inquiryNo: 'INQ002',
          totalAmount: 100,
          paidAmount: 0,
        },
        {
          Organization: 'primary',
          Code: 'REG003',
          Name: 'Emily Rodriguez',
          FirstName: 'Emily',
          MiddleName: 'Sofia',
          EmployeeDesignation: 'Student',
          StatusName: 'Completed',
          parentContactNo: '+91-555-0103',
          class: '3',
          inquiryNo: 'INQ003',
          totalAmount: 100,
          paidAmount: 100,
        },
        {
          Organization: 'secondary',
          Code: 'REG004',
          Name: 'David Thompson',
          FirstName: 'David',
          MiddleName: 'Alexander',
          EmployeeDesignation: 'Student',
          StatusName: 'Completed',
          parentContactNo: '+91-555-0104',
          class: '9',
          inquiryNo: 'INQ004',
          totalAmount: 100,
          paidAmount: 100,
        },
        {
          Organization: 'higher secondary',
          Code: 'REG005',
          Name: 'Lisa Wong',
          FirstName: 'Lisa',
          MiddleName: 'Grace',
          EmployeeDesignation: 'Student',
          StatusName: 'Pending',
          parentContactNo: '+91-555-0105',
          class: '11',
          inquiryNo: 'INQ005',
          totalAmount: 100,
          paidAmount: 0,
        },
      ]}
    />
  </Box>
);

export default AdmissionFeesScreen;
