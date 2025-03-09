'use client';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useMoveToRegistrationMutation } from 'src/redux/student/registration/registration-api';
import { useGetStudentRegistrationFormQuery } from 'src/redux/student/registration-form/registration-form-api';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CommunicationForm } from '../follow-up';

import type { IInquiryData } from '../Inquiry';

const RegistrationFormScreen = () => {
  const [editData, setEditData] = useState<IInquiryData | null>(null);
  const [dates, setDates] = useState([]);
  const followUpDialog = useBoolean();
  const {
    data: inquiryFormData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationFormQuery,
  });

  const [moveToRegistration] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToRegistrationMutation,
    popupConfig: {
      successMessage: 'Student moved to registration successfully',
      success: true,
    },
  });

  const tableData = useMemo(
    () =>
      inquiryFormData?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
      })),
    [inquiryFormData?.items]
  );

  return (
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
        isLoading={isLoading}
        tableId="student-registration-form-table"
        columns={[
          { id: 'formNumber', label: 'Form No', minWidth: '110px' },
          {
            id: 'inquiryNumber',
            label: 'Inquiry Number',

            minWidth: '162px',
            isFilter: true,
            filterType: 'string',
          },
          { id: 'standard.name', label: 'Class' },
          { id: 'studentName', label: 'Student Name', minWidth: '160px' },
          {
            id: 'dobValue',
            label: 'DOB',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          { id: 'ageValue', label: 'Age' },
          {
            id: 'doiValue',
            label: 'DOI',
            minWidth: '120px',
            align: 'left',
            isDateRangeFilter: true,
          },
          { id: 'genderValue', label: 'Gender' },
          { id: 'address', label: 'Address', minWidth: '120px' },
          { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '160px' },
          { id: 'alternativeContactNumber', label: 'Alternate Contact Details', minWidth: '232px' },
          { id: 'previousSchoolName', label: 'Previous School', minWidth: '170px' },
          {
            id: 'inquiryPreference.preferenceName',
            label: 'Inquiry Preferences',
            minWidth: '200px',
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={async (e) => {
                          // dialog.onTrue();
                          e.stopPropagation();
                          popover.onClose();
                          await moveToRegistration(row.id);
                          refetch();
                        }}
                      >
                        <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                        Move to Registration
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          setEditData(row as IInquiryData);
                          followUpDialog.onTrue();
                          e.stopPropagation();
                          popover.onClose();
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
        data={tableData || []}
      />
      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Follow Up"
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default RegistrationFormScreen;
