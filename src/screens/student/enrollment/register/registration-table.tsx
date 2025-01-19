import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { toast } from 'sonner';
import React, { useCallback } from 'react';

import { Box, MenuItem, MenuList, Typography, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const RegistrationTable = ({
  dialog,
  followUpDialog,
}: {
  dialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
}) => {
  const a = null;
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              if (row.progress < 50) {
                toast.error('Please Complete Registration Form First');
              }
            }}
          >
            <Iconify icon="mdi:arrow-right" sx={{ mr: 2 }} />
            Move To Admission
          </MenuItem>
          <MenuItem
            onClick={() => {
              dialog.onTrue();
            }}
          >
            <Iconify icon="mdi:calendar-clock" sx={{ mr: 2 }} />
            Schedule Exam
          </MenuItem>
          <MenuItem
            onClick={() => {
              followUpDialog.onTrue();
            }}
          >
            <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
            Follow Up
          </MenuItem>
        </MenuList>
      </>
    ),
    [dialog, followUpDialog]
  );
  return (
    <CustomizableTable
      tableId="student-registration-table"
      columns={[
        { id: 'inquiryNo', label: 'Inquiry No', minWidth: '104px' },
        // { id: 'FirstName', label: 'First Name', minWidth: '110px' },
        // { id: 'MiddleName', label: 'Middle Name', minWidth: '125px' },
        { id: 'Name', label: 'Name' },
        { id: 'Code', label: 'Code' },
        { id: 'class', label: 'Class' },
        { id: 'Organization', label: 'Organization' },
        { id: 'parentContactNo', label: 'Parent Contact No', minWidth: '162px' },
        // { id: 'EmployeeDesignation', label: 'Role' },
        {
          id: 'progress',
          label: 'Progress',
          render(value, row) {
            return (
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={value} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                    {value}%
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
        // {
        //   id: 'StatusName',
        //   label: 'Status',
        //   render(value, row) {
        //     return (
        //       <Label variant="soft" color={value === 'Active' ? 'success' : 'error'}>
        //         {value}
        //       </Label>
        //     );
        //   },
        // },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                showEditIcon
                handleEditClick={() => {}}
                actions={(prop) => actions({ ...prop, row })}
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
          StatusName: 'Active',
          parentContactNo: '+91-555-0101',
          class: '5',
          inquiryNo: 'INQ001',
          progress: '100',
        },
        {
          Organization: 'pre-primary',
          Code: 'REG002',
          Name: 'Michael Chen',
          FirstName: 'Michael',
          MiddleName: 'James',
          EmployeeDesignation: 'Student',
          StatusName: 'Inactive',
          parentContactNo: '+91-555-0102',
          class: 'KG-2',
          inquiryNo: 'INQ002',
          progress: '75',
        },
        {
          Organization: 'primary',
          Code: 'REG003',
          Name: 'Emily Rodriguez',
          FirstName: 'Emily',
          MiddleName: 'Sofia',
          EmployeeDesignation: 'Student',
          StatusName: 'Active',
          parentContactNo: '+91-555-0103',
          class: '3',
          inquiryNo: 'INQ003',
          progress: '50',
        },
        {
          Organization: 'secondary',
          Code: 'REG004',
          Name: 'David Thompson',
          FirstName: 'David',
          MiddleName: 'Alexander',
          EmployeeDesignation: 'Student',
          StatusName: 'Active',
          parentContactNo: '+91-555-0104',
          class: '9',
          inquiryNo: 'INQ004',
          progress: '25',
        },
        {
          Organization: 'higher secondary',
          Code: 'REG005',
          Name: 'Lisa Wong',
          FirstName: 'Lisa',
          MiddleName: 'Grace',
          EmployeeDesignation: 'Student',
          StatusName: 'Inactive',
          parentContactNo: '+91-555-0105',
          class: '11',
          inquiryNo: 'INQ005',
          progress: '0',
        },
      ]}
    />
  );
};

export default RegistrationTable;
