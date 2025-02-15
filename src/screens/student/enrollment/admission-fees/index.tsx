'use client';

import React from 'react';

import { Box, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import FeeNewCollectionForm from 'src/screens/finance/fee-collection/collectFees/fee-collection-form';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AdmissionFeesScreen = () => {
  const dialogForCollectFees = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Admission Fees"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Admission Fees' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="admission-fees"
        columns={[
          { id: 'inquiryNo', label: 'Inquiry No', minWidth: '104px' },
          { id: 'FirstName', label: 'First Name', minWidth: '110px' },
          { id: 'MiddleName', label: 'Middle Name', minWidth: '125px' },
          { id: 'Name', label: 'Name' },
          { id: 'Code', label: 'Code' },
          { id: 'class', label: 'Class' },
          { id: 'Organization', label: 'Organization' },
          { id: 'parentContactNo', label: 'Parent Contact No', minWidth: '162px' },
          { id: 'EmployeeDesignation', label: 'Role' },
          { id: 'totalAmount', label: 'Total Amount', minWidth: '135px' },
          { id: 'paidAmount', label: 'Paid Amount', minWidth: '125px' },

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
                          dialogForCollectFees.onTrue();
                        }}
                      >
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
      {dialogForCollectFees.value && (
        // <FeeCollectionForm
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        // />
        <FeeNewCollectionForm
          isFromStudentAdmissionFlow
          dialogValue={dialogForCollectFees.value}
          onClose={() => {
            dialogForCollectFees.onFalse();
          }}
          data={[]}
        />
        // <FinanceNewCollectFeeDialog
        //   isFromStudentAdmission={false}
        //   onSave={() => {}}
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        //   data={selectedStudent}
        // />
      )}
    </Box>
  );
};

export default AdmissionFeesScreen;
