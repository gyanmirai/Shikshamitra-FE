import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, MenuItem, MenuList, Checkbox, Typography, CircularProgress } from '@mui/material';

import { useBoolean, type UseBooleanReturn } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useMoveToAdmissionMutation,
  useGetStudentRegistrationQuery,
} from 'src/redux/student/registration/registration-api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { IInquiryData } from '../Inquiry';

const RegistrationTable = ({
  dialog,
  followUpDialog,
  setEditData,
  formDialog,
}: {
  dialog: UseBooleanReturn;
  formDialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
  setEditData: (data: null | IInquiryData) => void;
}) => {
  const [moveId, setMoveId] = useState<string | null>(null);
  const confirmMovePopup = useBoolean();
  const [moveToAdmission, { isLoading: isMoveToAdmissionLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: {
      successMessage: 'Student moved to Admission successfully',
      success: true,
    },
  });
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={async () => {
              if (row.percentage < 50) {
                toast.error('Please Complete Registration Form First');
                pop.onClose();

                return;
              }
              confirmMovePopup.onTrue();
              // dialog.onTrue();
              setMoveId(row.id);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right" sx={{ mr: 2 }} />
            Move To Admission
          </MenuItem>
          <MenuItem
            onClick={() => {
              dialog.onTrue();
              setEditData(row);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:calendar-clock" sx={{ mr: 2 }} />
            Schedule Exam
          </MenuItem>
          <MenuItem
            onClick={() => {
              followUpDialog.onTrue();
              setEditData(row);
              pop.onClose();
            }}
          >
            <Iconify icon="icon-park:follow-up-date-sort" color="default.main" sx={{ mr: 2 }} />
            Follow Up
          </MenuItem>
        </MenuList>
      </>
    ),
    [confirmMovePopup, dialog, followUpDialog, setEditData]
  );

  const { data: registrationData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationQuery,
  });

  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  const tableData = useMemo(
    () =>
      registrationData?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
        percentage: (item.onboardingProgressState / 8) * 100,
      })) || [],
    [registrationData?.items]
  );

  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="student-registration-table"
        noDataText={
          <>
            No Rubric Data Found{' '}
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
        isLoading={isLoading}
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={tableData?.length && selectedStudents?.length === tableData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(tableData || []);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                    }
                  }}
                />
              );
            },
          },
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
            filterType: 'date',
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

          { id: 'educationMedium.name', label: 'Organization' },

          // { id: 'EmployeeDesignation', label: 'Role' },
          {
            id: 'percentage',
            label: 'Progress',
            filterType: 'number',
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
                    <Typography variant="body2" component="small" color="text.secondary">
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
            isFilter: false,
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
        ]}
        data={tableData || []}
      />

      <ConfirmDialog
        title="Move"
        content="Are you sure want to move in admission ?"
        action={
          <LoadingButton
            variant="contained"
            loading={isMoveToAdmissionLoading}
            color="error"
            onClick={async () => {
              await moveToAdmission(moveId);
              confirmMovePopup.onFalse();
            }}
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

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </Box>
  );
};

export default RegistrationTable;
