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
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
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
        placeholder: 'Search by Inquiry number, Student name, Class..',
        label: 'Search by Inquiry number, Student name, Class...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      columns={[
        // {
        //   id: 'checkBox',
        //   align: 'left',
        //   minWidth: '60px',
        //   isSort: false,
        //   isFilter: false,
        //   label: '',
        //   renderColumn() {
        //     return (
        //       <Checkbox
        //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
        //         onChange={(e) => {
        //           if (e.target.checked) {
        //             setSelectedStudents(tableData || []);
        //           } else {
        //             setSelectedStudents([]);
        //           }
        //         }}
        //       />
        //     );
        //   },
        //   render(value, row) {
        //     return (
        //       <Checkbox
        //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
        //         onChange={(e) => {
        //           if (e.target.checked) {
        //             setSelectedStudents([...selectedStudents, row]);
        //           } else {
        //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
        //           }
        //         }}
        //       />
        //     );
        //   },
        // },
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
          id: 'followUpStatusType',
          label: 'Status',
          filterType: 'enum',
          enumOptions: FollowUpStatusTypeOptions,
          minWidth: '180px',
          align: 'left',
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
                      <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                      Follow Up
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        issueRegistrationFormDialog.onTrue();
                        setEditData(row as IInquiryData);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="mdi-light:arrow-right" sx={{ mr: 2 }} />
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
