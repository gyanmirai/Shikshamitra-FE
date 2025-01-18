'use client';

import React from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const RegistrationFormScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Registration Form Details"
      links={[
        { name: 'Student' },
        { name: 'Student Enroll' },
        { name: 'Registration Form Details' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <CustomizableTable
      tableId="student-registration-form-table"
      columns={[
        { id: 'inquiryNo', label: 'Inquiry No', minWidth: '104px' },
        { id: 'formNo', label: 'Form No', minWidth: '90px' },
        // { id: 'FirstName', label: 'First Name' },
        // { id: 'MiddleName', label: 'Middle Name' },
        { id: 'Name', label: 'Name' },
        { id: 'Code', label: 'Code' },
        { id: 'class', label: 'Class' },
        { id: 'Organization', label: 'Organization' },
        { id: 'parentContactNo', label: 'Parent Contact No', minWidth: '162px' },
        // { id: 'EmployeeDesignation', label: 'Role' },

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
                    <MenuItem
                      onClick={() => {
                        // dialog.onTrue();
                      }}
                    >
                      <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                      Move To Registration
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        // followUpDialog.onTrue();
                      }}
                    >
                      <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                      Follow Up
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
          StatusName: 'Pending',
          parentContactNo: '+91-555-0101',
          class: '5',
          inquiryNo: 'INQ001',
          progress: '100',
          formNo: 'F001',
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
          progress: '75',
          formNo: 'F002',
        },
        {
          Organization: 'primary',
          Code: 'REG003',
          Name: 'Emily Rodriguez',
          FirstName: 'Emily',
          MiddleName: 'Sofia',
          EmployeeDesignation: 'Student',
          StatusName: 'Pending',
          parentContactNo: '+91-555-0103',
          class: '3',
          inquiryNo: 'INQ003',
          progress: '50',
          formNo: 'F003',
        },
        {
          Organization: 'secondary',
          Code: 'REG004',
          Name: 'David Thompson',
          FirstName: 'David',
          MiddleName: 'Alexander',
          EmployeeDesignation: 'Student',
          StatusName: 'Pending',
          parentContactNo: '+91-555-0104',
          class: '9',
          inquiryNo: 'INQ004',
          progress: '25',
          formNo: 'F004',
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
          progress: '0',
          formNo: 'F005',
        },
      ]}
    />
  </Box>
);

export default RegistrationFormScreen;
