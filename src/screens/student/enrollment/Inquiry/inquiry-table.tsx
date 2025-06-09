'use client';

import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInquiryQuery } from 'src/redux/student/inquiry/inquiry-api';
import {
  FollowUpStatusType,
  FollowUpStatusTypeColors,
  FollowUpStatusTypeOptions,
} from 'src/enums/inquiry-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IInquiryData } from '.';

const InquiryTable = ({
  followUpDialog,
  issueRegistrationFormDialog,
  editData,
  setEditData,
  inquiryDialog,
}: {
  inquiryDialog: UseBooleanReturn;
  issueRegistrationFormDialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
  editData: null | IInquiryData;
  setEditData: React.Dispatch<React.SetStateAction<null | IInquiryData>>;
}) => {
  const { data: inquiryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInquiryQuery,
  });

  const tableData = useMemo(
    () =>
      inquiryData?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
        address: [item.addressLine1, item.addressLine2, item.addressLine3]
          .filter(Boolean)
          .join(', '),
      })),
    [inquiryData?.items]
  );
  return (
    <CustomizableTable
      showCheckbox
      isLoading={isLoading}
      tableId="inquiry-table"
      noDataText={
        <>
          No Inquiry Found{' '}
          <Box
            onClick={() => {
              inquiryDialog.onTrue();
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            Add Inquiry
          </Box>
        </>
      }
      searchFieldProps={{
        placeholder: 'Search by Inquiry number, Class, Student Name...',
        label: 'Search by Inquiry number, Class, Student Name...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      columns={[
        {
          id: 'inquiryNumber',
          label: 'Inquiry No.',
          sticky: true,
          minWidth: '110px',
          filterType: 'string',
          align: 'left',
        },
        {
          id: 'studentName',
          label: 'Student Name',
          minWidth: '150px',
          align: 'left',
          sticky: true,
        },
        { id: 'standard.name', label: 'Class', align: 'left' },
        {
          id: 'dobValue',
          label: 'DOB',
          minWidth: '120px',
          align: 'left',
          filterType: 'date',
        },
        { id: 'ageValue', label: 'Age', align: 'left' },
        {
          id: 'doiValue',
          label: 'Inquiry Date',
          filterType: 'date',
          minWidth: '120px',
          align: 'left',
          isDateRangeFilter: true,
        },
        { id: 'genderValue', label: 'Gender', align: 'left' },
        {
          id: 'address',
          label: 'Address',
          minWidth: '200px',
          align: 'left',
          render(value, row) {
            return value || '-';
          },
        },
        {
          id: 'primaryContactNumber',
          label: 'Primary Contact No.',
          minWidth: '180px',
          align: 'left',
        },
        {
          id: 'secondaryContactNumber',
          label: 'Secondary Contact No.',
          minWidth: '200px',
          align: 'left',
        },
        { id: 'previousSchoolName', label: 'Previous School', minWidth: '150px', align: 'left' },
        {
          id: 'inquiryPreference.preferenceName',
          label: 'Inquiry Prefrance',
          minWidth: '130px',
          align: 'left',
        },
        {
          id: 'lastFollowUpDate',
          label: 'Last Follow Up Date',
          minWidth: '180px',
          align: 'left',
          filterType: 'date',
        },
        {
          id: 'followUpStatusType',
          label: 'Follow Up Status',
          filterType: 'enum',
          enumOptions: FollowUpStatusTypeOptions,
          minWidth: '160px',
          align: 'left',
          sticky: true,
          render(value, row) {
            const color = FollowUpStatusTypeColors[value as FollowUpStatusType] as LabelColor;
            return <Label color={color}>{FollowUpStatusType[value]}</Label>;
          },
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
                placement="right-top"
                showEditIcon
                handleEditClick={() => {
                  inquiryDialog.onTrue();
                  setEditData(row as IInquiryData);
                }}
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        followUpDialog.onTrue();
                        setEditData(row as IInquiryData);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="clarity:note-edit-line" />
                      Note
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        issueRegistrationFormDialog.onTrue();
                        setEditData(row as IInquiryData);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="clarity:form-line" />
                      Issue Registration Form
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={tableData || []}
    />
  );
};
export default InquiryTable;
