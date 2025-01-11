import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInquiryQuery } from 'src/redux/student/inquiry/inquiry-api';

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
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
      })),
    [inquiryData?.items]
  );
  return (
    <CustomizableTable
      isLoading={isLoading}
      columns={[
        { id: 'inquiryNumber', label: 'Inquiry Number', sticky: true, minWidth: '145px' },
        // { id: 'educationBoard.name', label: 'Board', minWidth: '145px' },
        // { id: 'educationMedium.name', label: 'Medium' },
        // { id: 'batchName', label: 'Batch Name', minWidth: '120px' },
        { id: 'standard.name', label: 'Class' },
        { id: 'studentName', label: 'Student Name', minWidth: '135px' },
        { id: 'dobValue', label: 'DOB', minWidth: '120px', align: 'left' },
        { id: 'age', label: 'Age' },
        { id: 'doiValue', label: 'DOI', minWidth: '120px', align: 'left' },
        { id: 'genderValue', label: 'Gender' },
        { id: 'address', label: 'Address', minWidth: '120px' },
        { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '145px' },
        { id: 'alternativeContactNumber', label: 'Alternate Contact Details', minWidth: '212px' },
        { id: 'previousSchoolName', label: 'Previous School', minWidth: '150px' },
        { id: 'inquiryPreference.preferenceName', label: 'Enquiry Preferences', minWidth: '180px' },
        {
          id: 'status',
          label: 'Status',
          minWidth: '180px',
          align: 'left',
          render(value, row) {
            let color: LabelColor = 'info';
            if (row.status === 'Pending') {
              color = 'warning';
            } else if (row.status === 'Interested') {
              color = 'success';
            } else {
              color = 'error';
            }
            return <Label color={color}>{value}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                showEditIcon
                handleEditClick={() => {
                  dialog.onTrue();
                  setEditData(row as IInquiryData);
                }}
                actions={() => (
                  <MenuList>
                    {/* <MenuItem>
                    <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                    Move To Registration
                  </MenuItem> */}
                    <MenuItem
                      onClick={() => {
                        followUpDialog.onTrue();
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
