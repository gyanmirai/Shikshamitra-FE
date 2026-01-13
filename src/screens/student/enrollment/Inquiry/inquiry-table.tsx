'use client';

import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { IColumn } from 'src/components/customizabaleTable/type';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import calculateAge from 'src/utils/calculate-age';
import { Box, MenuItem, MenuList } from '@mui/material';
import { GenderType, GenderOptions } from 'src/enums/gender';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInquiryQuery } from 'src/redux/student/inquiry/inquiry-api';
import {
  FollowUpStatusType,
  FollowUpStatusTypeColors,
  FollowUpStatusTypeOptions,
} from 'src/enums/inquiry-status-type';

import type { IInquiryResponse } from './type';

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
  editData: null | IInquiryResponse;
  setEditData: React.Dispatch<React.SetStateAction<null | IInquiryResponse>>;
}) => {
  const { currentMedium } = useSelector((state: any) => state.globalState);
  const { data: inquiryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInquiryQuery,
    params: {
      academicMediumId: currentMedium?.id,
    },
    options: {
      skip: currentMedium?.id === undefined,
    },
  });

  const tableData = useMemo(
    () =>
      inquiryData?.data?.items.map((item: IInquiryResponse) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        secondaryContactNumber: item.secondaryContactNo ? item.secondaryContactNo : undefined,
        // studentName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        genderValue: GenderType[item?.gender as any],
        // address: [
        //   item.addressLine1,
        //   item.addressLine2,
        //   item.addressLine3,
        //   item.city,
        //   item.state?.name,
        //   item.country?.name,
        // ]
        //   .filter(Boolean)
        //   .join(', '),
      })),
    [inquiryData?.data?.items]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'inquiryNo',
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
        // render: (value, row) => {
        //   const fullName = `${row.lastName} ${row.firstName} ${row.middleName}`.trim();

        //   return (
        //     <CustomTooltip title={fullName} arrow sx={{ textAlign: 'justify' }}>
        //       <Typography
        //         variant="caption"
        //         sx={{
        //           fontSize: '13px',
        //           display: 'block',
        //           overflow: 'hidden',
        //           textOverflow: 'ellipsis',
        //           whiteSpace: 'nowrap',
        //           maxWidth: '150px',
        //         }}
        //       >
        //         {fullName}
        //       </Typography>
        //     </CustomTooltip>
        //   );
        // },
      },
      { id: 'standard', label: 'Class', align: 'left' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '8vw',
        align: 'left',
        filterType: 'date',
      },
      { id: 'age', label: 'Age', align: 'left', minWidth: '120px' },
      {
        id: 'doiValue',
        label: 'Date of Inquiry',
        filterType: 'date',
        minWidth: '10vw',
        align: 'left',
        isDateRangeFilter: true,
      },
      {
        id: 'genderValue',
        label: 'Gender',
        align: 'left',
        filterType: 'enum',
        enumOptions: GenderOptions,
        // render: (value, row) => (
        //   <Typography variant="caption" fontSize="13px">
        //     {GenderType[value]}
        //   </Typography>
        // ),
      },
      {
        id: 'address',
        label: 'Address',
        minWidth: '200px',
        align: 'left',
        // render: (value, row) => {
        //   // Split address into lines and take first two lines
        //   const addressLines = value.split(', ');
        //   const displayAddress = addressLines.slice(0, 3).join(', ');
        //   const hasMoreLines = addressLines.length > 3;

        //   return (
        //     <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
        //       <Typography
        //         variant="caption"
        //         sx={{
        //           fontSize: '13px',
        //           // width: 200,
        //           display: '-webkit-box',
        //           WebkitLineClamp: 2,
        //           WebkitBoxOrient: 'vertical',
        //           overflow: 'hidden',
        //           lineHeight: '1.2em',
        //           maxHeight: '2.4em',
        //         }}
        //       >
        //         {displayAddress}
        //         {hasMoreLines && '...'}
        //       </Typography>
        //     </CustomTooltip>
        //   );
        // },
      },
      {
        id: 'primaryContactNo',
        label: 'Primary Contact No.',
        minWidth: '180px',
        align: 'left',
      },
      {
        id: 'secondaryContactNo',
        label: 'Secondary Contact No.',
        minWidth: '200px',
        align: 'left',
      },
      {
        id: 'previousSchool',
        label: 'Previous School',
        minWidth: '150px',
        align: 'left',
        render(value, row) {
          return value || '-';
        },
      },
      {
        id: 'inquiryPreference',
        label: 'Inquiry Preference',
        minWidth: '11vw',
        align: 'left',
      },
      {
        id: 'nextReminderDate',
        label: 'Next Reminder Date',
        minWidth: '180px',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'followUpStatusType',
        label: 'Status',
        filterType: 'enum',
        enumOptions: FollowUpStatusTypeOptions,
        minWidth: '100px',
        align: 'left',
        sticky: true,
        render: (value, row) => {
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
              placement="right-center"
              showEditIcon
              handleEditClick={() => {
                inquiryDialog.onTrue();
                setEditData(row as IInquiryResponse);
              }}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      followUpDialog.onTrue();
                      setEditData(row as IInquiryResponse);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="clarity:note-edit-line" />
                    Notes
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      issueRegistrationFormDialog.onTrue();
                      setEditData(row as IInquiryResponse);
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
    ],
    [inquiryDialog, setEditData, followUpDialog, issueRegistrationFormDialog]
  );

  return (
    <Box sx={{ minHeight: 0, flexGrow: 1 }}>
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
        columns={columns}
        data={tableData || []}
      />
    </Box>
  );
};
export default InquiryTable;
