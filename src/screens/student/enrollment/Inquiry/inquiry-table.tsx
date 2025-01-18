'use client';

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
          isFilter: true,
          filterType: 'string',
        },
        { id: 'standard.name', label: 'Class' },
        { id: 'studentName', label: 'Student Name', minWidth: '150px' },
        {
          id: 'dobValue',
          label: 'DOB',
          minWidth: '120px',
          align: 'left',
          isFilter: true,
          filterType: 'date',
        },
        { id: 'age', label: 'Age' },
        { id: 'doiValue', label: 'DOI', minWidth: '120px', align: 'left', isDateRangeFilter: true },
        { id: 'genderValue', label: 'Gender' },
        { id: 'address', label: 'Address', minWidth: '120px' },
        { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '145px' },
        { id: 'alternativeContactNumber', label: 'Alternate Contact Details', minWidth: '222px' },
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
      data={[
        {
          inquiryNumber: 'INQ001',
          standard: { name: '10th' },
          studentName: 'John Smith',
          dobValue: '15-05-2008',
          age: 15,
          doiValue: '01-06-2023',
          genderValue: 'Male',
          address: '123 Main St, City',
          parentContactNumber: '9876543210',
          alternativeContactNumber: '8765432109',
          previousSchoolName: 'ABC School',
          inquiryPreference: { preferenceName: 'Science' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ002',
          standard: { name: '9th' },
          studentName: 'Emma Wilson',
          dobValue: '22-07-2009',
          age: 14,
          doiValue: '02-06-2023',
          genderValue: 'Female',
          address: '456 Oak Ave, Town',
          parentContactNumber: '9876543211',
          alternativeContactNumber: '8765432108',
          previousSchoolName: 'XYZ School',
          inquiryPreference: { preferenceName: 'Commerce' },
          status: 'Interested',
        },
        {
          inquiryNumber: 'INQ003',
          standard: { name: '11th' },
          studentName: 'Michael Brown',
          dobValue: '10-03-2007',
          age: 16,
          doiValue: '03-06-2023',
          genderValue: 'Male',
          address: '789 Pine Rd, Village',
          parentContactNumber: '9876543212',
          alternativeContactNumber: '8765432107',
          previousSchoolName: 'PQR School',
          inquiryPreference: { preferenceName: 'Arts' },
          status: 'Rejected',
        },
        {
          inquiryNumber: 'INQ004',
          standard: { name: '8th' },
          studentName: 'Sarah Davis',
          dobValue: '05-12-2010',
          age: 13,
          doiValue: '04-06-2023',
          genderValue: 'Female',
          address: '321 Elm St, County',
          parentContactNumber: '9876543213',
          alternativeContactNumber: '8765432106',
          previousSchoolName: 'LMN School',
          inquiryPreference: { preferenceName: 'Science' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ005',
          standard: { name: '12th' },
          studentName: 'David Miller',
          dobValue: '18-09-2006',
          age: 17,
          doiValue: '05-06-2023',
          genderValue: 'Male',
          address: '654 Maple Dr, State',
          parentContactNumber: '9876543214',
          alternativeContactNumber: '8765432105',
          previousSchoolName: 'DEF School',
          inquiryPreference: { preferenceName: 'Commerce' },
          status: 'Interested',
        },
        {
          inquiryNumber: 'INQ006',
          standard: { name: '10th' },
          studentName: 'Lisa Anderson',
          dobValue: '30-11-2008',
          age: 15,
          doiValue: '06-06-2023',
          genderValue: 'Female',
          address: '987 Cedar Ln, District',
          parentContactNumber: '9876543215',
          alternativeContactNumber: '8765432104',
          previousSchoolName: 'GHI School',
          inquiryPreference: { preferenceName: 'Arts' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ007',
          standard: { name: '9th' },
          studentName: 'James Wilson',
          dobValue: '25-04-2009',
          age: 14,
          doiValue: '07-06-2023',
          genderValue: 'Male',
          address: '753 Birch St, Region',
          parentContactNumber: '9876543216',
          alternativeContactNumber: '8765432103',
          previousSchoolName: 'JKL School',
          inquiryPreference: { preferenceName: 'Science' },
          status: 'Rejected',
        },
        {
          inquiryNumber: 'INQ008',
          standard: { name: '11th' },
          studentName: 'Emily Taylor',
          dobValue: '12-08-2007',
          age: 16,
          doiValue: '08-06-2023',
          genderValue: 'Female',
          address: '159 Pine Ave, Zone',
          parentContactNumber: '9876543217',
          alternativeContactNumber: '8765432102',
          previousSchoolName: 'MNO School',
          inquiryPreference: { preferenceName: 'Commerce' },
          status: 'Interested',
        },
        {
          inquiryNumber: 'INQ009',
          standard: { name: '8th' },
          studentName: 'Daniel Lee',
          dobValue: '20-02-2010',
          age: 13,
          doiValue: '09-06-2023',
          genderValue: 'Male',
          address: '357 Oak Rd, Area',
          parentContactNumber: '9876543218',
          alternativeContactNumber: '8765432101',
          previousSchoolName: 'RST School',
          inquiryPreference: { preferenceName: 'Arts' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ010',
          standard: { name: '12th' },
          studentName: 'Olivia Martin',
          dobValue: '08-06-2006',
          age: 17,
          doiValue: '10-06-2023',
          genderValue: 'Female',
          address: '852 Maple St, Sector',
          parentContactNumber: '9876543219',
          alternativeContactNumber: '8765432100',
          previousSchoolName: 'UVW School',
          inquiryPreference: { preferenceName: 'Science' },
          status: 'Interested',
        },
        {
          inquiryNumber: 'INQ011',
          standard: { name: '10th' },
          studentName: 'William Clark',
          dobValue: '14-10-2008',
          age: 15,
          doiValue: '11-06-2023',
          genderValue: 'Male',
          address: '753 Elm Ave, Block',
          parentContactNumber: '9876543220',
          alternativeContactNumber: '8765432099',
          previousSchoolName: 'XYZ School',
          inquiryPreference: { preferenceName: 'Commerce' },
          status: 'Rejected',
        },
        {
          inquiryNumber: 'INQ012',
          standard: { name: '9th' },
          studentName: 'Sophie White',
          dobValue: '28-03-2009',
          age: 14,
          doiValue: '12-06-2023',
          genderValue: 'Female',
          address: '951 Cedar Dr, Colony',
          parentContactNumber: '9876543221',
          alternativeContactNumber: '8765432098',
          previousSchoolName: 'ABC School',
          inquiryPreference: { preferenceName: 'Arts' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ013',
          standard: { name: '11th' },
          studentName: 'Ryan Johnson',
          dobValue: '17-01-2007',
          age: 16,
          doiValue: '13-06-2023',
          genderValue: 'Male',
          address: '357 Birch Ave, Society',
          parentContactNumber: '9876543222',
          alternativeContactNumber: '8765432097',
          previousSchoolName: 'DEF School',
          inquiryPreference: { preferenceName: 'Science' },
          status: 'Interested',
        },
        {
          inquiryNumber: 'INQ014',
          standard: { name: '8th' },
          studentName: 'Grace Thompson',
          dobValue: '03-07-2010',
          age: 13,
          doiValue: '14-06-2023',
          genderValue: 'Female',
          address: '159 Pine Ln, Complex',
          parentContactNumber: '9876543223',
          alternativeContactNumber: '8765432096',
          previousSchoolName: 'GHI School',
          inquiryPreference: { preferenceName: 'Commerce' },
          status: 'Pending',
        },
        {
          inquiryNumber: 'INQ015',
          standard: { name: '12th' },
          studentName: 'Lucas Baker',
          dobValue: '22-12-2006',
          age: 17,
          doiValue: '15-06-2023',
          genderValue: 'Male',
          address: '852 Oak St, Township',
          parentContactNumber: '9876543224',
          alternativeContactNumber: '8765432095',
          previousSchoolName: 'JKL School',
          inquiryPreference: { preferenceName: 'Arts' },
          status: 'Interested',
        },
      ]}
    />
  );
};
export default InquiryTable;
