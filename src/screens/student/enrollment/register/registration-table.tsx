import type { IColumn } from 'src/components/customizable-table/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { GenderType, GenderOptions } from 'src/enums/gender';
import React, { useMemo, useState, useCallback } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useBoolean, type UseBooleanReturn } from 'src/hooks/useBoolean';
import { Box, MenuItem, MenuList, Typography, CircularProgress } from '@mui/material';
import {
  useMoveToAdmissionMutation,
  useGetStudentRegistrationQuery,
} from 'src/redux/student/registration/registration-api';

import type { IInquiryData } from '../inquiry/type';

const RegistrationTable = ({
  dialog,
  followUpDialog,
  editData,
  setEditData,
  formDialog,
}: {
  editData: IInquiryData | null;
  dialog: UseBooleanReturn;
  formDialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
  setEditData: (data: null | IInquiryData) => void;
}) => {
  const [moveId, setMoveId] = useState<string | null>(null);
  const { currentMedium } = useSelector((state: any) => state.globalState);
  const confirmMovePopup = useBoolean();
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  const [
    moveToAdmission,
    { isLoading: isMoveToAdmissionLoading, isFetching: isMoveToAdmissionFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: {
      successMessage: `${editData?.firstName} ${editData?.lastName} moved to Admission successfully`,
      success: true,
    },
  });
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              if (row.percentage < 50) {
                shikshaMitraToast.error({
                  message: 'Please Complete Required Fields of Registration Form',
                });
                pop.onClose();
                return;
              }
              confirmMovePopup.onTrue();
              setEditData(row);
              // dialog.onTrue();
              setMoveId(row.studentId);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle-outline" />
            Move To Admission
          </MenuItem>
          <MenuItem
            onClick={() => {
              dialog.onTrue();
              setEditData(row);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:calendar-clock" />
            Schedule Exam
          </MenuItem>
          <MenuItem
            onClick={() => {
              followUpDialog.onTrue();
              setEditData(row);
              pop.onClose();
            }}
          >
            <Iconify icon="clarity:note-edit-line" color="default.main" />
            Note
          </MenuItem>
        </MenuList>
      </>
    ),
    [confirmMovePopup, dialog, followUpDialog, setEditData]
  );

  const {
    data: registrationData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationQuery,
    params: {
      academicMediumId: currentMedium.id,
      ...query,
    },
    options: {
      skip: !currentMedium.id,
    },
  });

  const tableData = useMemo(
    () =>
      registrationData?.data?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        doiValue: item.dateOfInquiry ? dayjs(item.dateOfInquiry).format('DD-MM-YYYY') : '-',
        genderValue: GenderType[(item as any)?.gender],
      })) || [],
    [registrationData?.data?.items]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '160px',
        align: 'left',
        sticky: true,
      },
      { id: 'formNo', label: 'Form No.', minWidth: '100px', align: 'left' },
      {
        id: 'inquiryNo',
        label: 'Inquiry No.',
        minWidth: '120px',
        isFilter: true,
        filterType: 'string',
        align: 'left',
      },
      { id: 'standard', label: 'Class', align: 'left', minWidth: '80px' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '130px',
        align: 'left',
        isFilter: true,
        filterType: 'date',
      },
      {
        id: 'age',
        label: 'Age',
        align: 'left',
        render: (value, row) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        id: 'doiValue',
        label: 'Date of Inquiry',
        minWidth: '150px',
        align: 'left',
        filterType: 'date',
        isDateRangeFilter: true,
      },
      {
        id: 'genderValue',
        label: 'Gender',
        align: 'left',
        filterType: 'enum',
        minWidth: '90px',
        enumOptions: GenderOptions,
      },
      {
        id: 'address',
        label: 'Address',
        minWidth: '150px',
        align: 'left',
        render: (value, row) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
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
      { id: 'previousSchool', label: 'Previous School', minWidth: '150px', align: 'left' },
      {
        id: 'inquiryPreference',
        label: 'Inquiry Preference',
        minWidth: '175px',
        align: 'left',
      },
      // {
      //   id: 'status',
      //   label: 'Entrance Exam',
      //   filterType: 'enum',
      //   enumOptions: EntranceExamStatusOptions,
      //   align: 'left',
      //   minWidth: '150px',
      //   sticky: true,
      //   render(value, row) {
      //     const color = EntranceExamStatusTypeColors[
      //       value as EntranceExamStatusType
      //     ] as LabelColor;
      //     return (
      //       <Label color={color}>
      //         {EntranceExamStatusType[value as EntranceExamStatusType]}
      //       </Label>
      //     );
      //   },
      // },
      // { id: 'educationMedium.name', label: 'Organization', align: 'left' },
      {
        id: 'progress',
        label: 'Progress',
        align: 'left',
        sticky: true,
        filterType: 'number',
        render(value, row) {
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={value}
                size={50}
                thickness={3}
                sx={{
                  color: value < 50 ? 'warning.main' : 'success.main',
                }}
              />
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
                <Typography
                  variant="body2"
                  component="small"
                  color="text.secondary"
                  sx={{ fontSize: '12px' }}
                >
                  {value}%
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      // {
      //   id: 'followUpStatusType',
      //   label: 'Follow Up Status',
      //   filterType: 'enum',
      //   enumOptions: FollowUpStatusTypeOptions,
      //   minWidth: '160px',
      //   align: 'left',
      //   sticky: true,
      //   render(value, row) {
      //     const color = FollowUpStatusTypeColors[value as FollowUpStatusType] as LabelColor;

      //     return <Label color={color}>{FollowUpStatusType[value]}</Label>;
      //   },
      // },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        minWidth: 50,
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              showEditIcon
              handleEditClick={() => {
                setEditData(row as IInquiryData);
                formDialog.onTrue();
              }}
              actions={(prop) => actions({ ...prop, row })}
              placement="right-top"
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <CustomizableTable
        tableTitle="Registration"
        tableId="student-registration-table"
        noDataText={
          <>
            No Registration Data Found{' '}
            <Box
              onClick={() => {
                formDialog.onTrue();
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
              Add Registration
            </Box>
          </>
        }
        isLoading={isLoading || isFetching}
        columns={columns}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        data={tableData || []}
      />
      <ConfirmDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Move</Typography>
            <CustomTooltip arrow placement="right" title="Transfer student to Admission.">
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        content={
          <>
            Are you sure want to move student{' '}
            <strong>{`${(editData as IInquiryData)?.lastName || ''} ${(editData as IInquiryData)?.firstName || ''} ${(editData as IInquiryData)?.middleName || ''}`}</strong>{' '}
            in admission ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isMoveToAdmissionLoading || isMoveToAdmissionFetching}
            onClick={async () => {
              await moveToAdmission(moveId);
              confirmMovePopup.onFalse();
            }}
            startIcon={<Iconify icon="mdi:arrow-right-circle" />}
            size="small"
          >
            Move
          </LoadingButton>
        }
        open={confirmMovePopup.value}
        onClose={() => {
          confirmMovePopup.onFalse();
          setMoveId(null);
        }}
      />
    </>
  );
};

export default RegistrationTable;
