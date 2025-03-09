'use client';

import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInquiryQuery } from 'src/redux/student/inquiry/inquiry-api';
import {
  InquiryStatusType,
  InquiryStatusTypeColors,
  InquiryStatusTypeOptions,
} from 'src/enums/inquiry-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IInquiryData } from '.';

const InquiryTable = ({
  dialog,
  followUpDialog,
  editData,
  setEditData,
}: {
  dialog: UseBooleanReturn;
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
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
      })),
    [inquiryData?.items]
  );
  return (
    <CustomizableTable
      isLoading={isLoading}
      tableId="inquiry-table"
      startDateProps={{
        label: 'Start Date Of Inquiry',
      }}
      endDateProps={{
        label: 'End Date Of Inquiry',
      }}
      columns={[
        {
          id: 'inquiryNumber',
          label: 'Inquiry Number',
          sticky: true,
          minWidth: '162px',

          filterType: 'string',
        },
        { id: 'standard.name', label: 'Class' },
        { id: 'studentName', label: 'Student Name', minWidth: '150px' },
        {
          id: 'dobValue',
          label: 'DOB',
          minWidth: '120px',
          align: 'left',
          filterType: 'date',
        },
        { id: 'ageValue', label: 'Age' },
        {
          id: 'doiValue',
          label: 'DOI',
          filterType: 'date',
          minWidth: '120px',
          align: 'left',
          isDateRangeFilter: true,
        },
        { id: 'genderValue', label: 'Gender' },
        { id: 'address', label: 'Address', minWidth: '120px' },
        { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '145px' },
        { id: 'alternativeContactNumber', label: 'Alternate Contact Details', minWidth: '222px' },
        { id: 'previousSchoolName', label: 'Previous School', minWidth: '150px' },
        {
          id: 'inquiryPreference.preferenceName',
          label: 'Inquiry Preferences',
          minWidth: '180px',
        },
        {
          id: 'inquiryStatusType',
          label: 'Status',
          filterType: 'enum',
          enumOptions: InquiryStatusTypeOptions,
          minWidth: '180px',
          align: 'left',
          render(value, row) {
            const color = InquiryStatusTypeColors[value as InquiryStatusType] as LabelColor;

            return <Label color={color}>{InquiryStatusType[value]}</Label>;
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
                  dialog.onTrue();
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
                      <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                      Follow Up
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
