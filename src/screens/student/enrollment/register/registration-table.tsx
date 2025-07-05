import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, MenuItem, MenuList, Typography, CircularProgress } from '@mui/material';

import { useBoolean, type UseBooleanReturn } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useMoveToAdmissionMutation,
  useGetStudentRegistrationQuery,
} from 'src/redux/student/registration/registration-api';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { IInquiryData } from '../Inquiry';

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
                toast.error('Please Complete Required Fields of Registration Form');
                pop.onClose();
                return;
              }
              confirmMovePopup.onTrue();
              setEditData(row);
              // dialog.onTrue();
              setMoveId(row.id);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle" />
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
        studentName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
        percentage: (item.onboardingProgressState / 8) * 100,
        address: [item.addressLine1, item.addressLine2, item.addressLine3]
          .filter(Boolean)
          .join(', '),
        secondaryContactNumber:
          item.secondaryContactNumber && item.secondaryContactNumber !== ''
            ? item.secondaryContactNumber
            : '-',
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
            i No Regstration Data Found{' '}
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
          // {
          //   id: 'checkBox',
          //   align: 'left',
          //   minWidth: '30px',
          //   isSort: false,
          //   sticky: true,
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
            id: 'studentName',
            label: 'Student Name',
            minWidth: '160px',
            align: 'left',
            sticky: true,
          },
          { id: 'formNumber', label: 'Form No.', minWidth: '110px', align: 'left' },
          {
            id: 'inquiryNumber',
            label: 'Inquiry No.',
            minWidth: '120px',
            isFilter: true,
            filterType: 'string',
            align: 'left',
          },
          { id: 'standard.name', label: 'Class', align: 'left' },
          {
            id: 'dobValue',
            label: 'Date of Birth',
            minWidth: '130px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          { id: 'ageValue', label: 'Age', align: 'left' },
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
            enumOptions: [
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ],
          },
          { id: 'address', label: 'Address', minWidth: '120px', align: 'left' },
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
            id: 'percentage',
            label: 'Progress',
            align: 'left',
            sticky: true,
            filterType: 'number',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} size={50} thickness={3} />
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
        ]}
        data={tableData || []}
      />
      <ConfirmDialog
        // title="Move"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Move</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Move the selected student from entrance exam to admission."
            >
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
            loading={isMoveToAdmissionLoading}
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
