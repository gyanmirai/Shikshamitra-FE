'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Card, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType, GenderOptions } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useMoveToRegistrationMutation } from 'src/redux/student/registration/registration-api';
import {
  StudentRegistrationFormApi,
  useGetStudentRegistrationFormQuery,
} from 'src/redux/student/registration-form/registration-form-api';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';

import type { IInquiryData } from '../Inquiry';

const RegistrationFormScreen = () => {
  // Dialog control for registration form
  const registerFormDialog = useBoolean();
  const dispatch = useDispatch();
  // State to store inquiry data for editing
  const [editData, setEditData] = useState<IInquiryData | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store ID of student being moved to registration
  const [moveId, setMoveId] = useState<string | null>(null);

  // State to store dates (currently unused)
  const [dates, setDates] = useState([]);

  // Dialog control for follow-up form
  const followUpDialog = useBoolean();

  // Dialog control for move confirmation popup
  const confirmMovePopup = useBoolean();

  // Query hook to fetch registration form data
  const {
    data: inquiryFormData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationFormQuery,
  });

  // Mutation hook to move student to registration status
  const [moveToRegistration] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToRegistrationMutation,
    popupConfig: {
      successMessage: 'Student moved to registration successfully',
      success: true,
    },
  });

  // Transform inquiry form data into table-friendly format
  // - Formats dates (DOB and DOI) into DD-MM-YYYY
  // - Calculates age from DOB
  // - Combines first, middle and last names
  // - Maps gender type enum to display value
  const tableData = useMemo(
    () =>
      inquiryFormData?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType as any],
        address: [item.addressLine1, item.addressLine2, item.addressLine3]
          .filter(Boolean)
          .join(', '),
        secondaryContactNumber:
          item.secondaryContactNumber && item.secondaryContactNumber !== ''
            ? item.secondaryContactNumber
            : undefined,
      })),
    [inquiryFormData?.items]
  );

  /**
   * Handles closing the registration form dialog with proper cleanup
   * @param _e - Event object (unused)
   * @param isSubmit - Optional flag indicating if the close action is triggered by form submission
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dispatch(StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form']));
      setEditData(null);
      registerFormDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      dispatch(StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form']));
      setEditData(null);
      registerFormDialog.onFalse();
      dispatch(setIsChanges(false));
    }
  };

  console.log(tableData);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {registerFormDialog.value ? (
        <CustomBreadcrumbs
          heading="Move to Registration"
          description="Move students from Form Issuance to Registered Status to begin the formal admission process."
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Student Enrollment', href: '/student/enrollment/registration-form/' },
            { name: 'Registration Form Issued' },
            { name: 'Move to Registration' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          sx={{ mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Registration Form Issued"
          description="After an inquiry Registration Form in a School ERP is provided to the prospective students for the admission process. "
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Student Enrollment', href: '/student/enrollment/registration-form/' },
            { name: 'Registration Form Issued' },
          ]}
          sx={{ mb: 1 }}
        />
      )}
      {registerFormDialog.value ? (
        <Card sx={{ height: '100%' }}>
          <RegisterForm
            editData={editData}
            handleClose={() => {
              setEditData(null);
              registerFormDialog.onFalse();
              dispatch(
                StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form'])
              );
            }}
            isComeFromIssueForm
          />
        </Card>
      ) : (
        <Box>
          <CustomizableTable
            isLoading={isLoading}
            noDataText={<>No Registration Form Issued Data Found </>}
            tableId="student-registration-form-table"
            columns={[
              {
                id: 'studentName',
                label: 'Student Name',
                minWidth: '180px',
                align: 'left',
                sticky: true,
              },
              {
                id: 'formNumber',
                label: 'Form No.',
                minWidth: '100px',
                align: 'left',
                sticky: true,
              },
              {
                id: 'inquiryNumber',
                label: 'Inquiry No.',
                align: 'left',
                minWidth: '115px',
                isFilter: true,
                filterType: 'string',
              },
              { id: 'standard.name', label: 'Class', align: 'left', filterType: 'number' },
              {
                id: 'dobValue',
                label: 'Date of Birth',
                minWidth: '128px',
                align: 'left',
                isFilter: true,
                filterType: 'date',
              },
              { id: 'ageValue', label: 'Age', align: 'left' },
              {
                id: 'doiValue',
                label: 'Date of Inquiry',
                minWidth: '145px',
                align: 'left',
                isDateRangeFilter: true,
                filterType: 'date',
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
              {
                id: 'previousSchoolName',
                label: 'Previous School',
                minWidth: '170px',
                align: 'left',
                render(value, row) {
                  return value || '-';
                },
              },
              {
                id: 'inquiryPreference.preferenceName',
                label: 'Inquiry Preference',
                minWidth: '170px',
                align: 'left',
              },
              {
                id: 'actions',
                label: 'Actions',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'left',
                minWidth: 50,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={({ popover }) => (
                        <MenuList>
                          <MenuItem
                            onClick={async (e) => {
                              // dialog.onTrue();
                              // setMoveId(row.id);
                              setEditData(row as IInquiryData);
                              registerFormDialog.onTrue();
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="mdi:arrow-right-circle" />
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
                            <Iconify icon="clarity:note-edit-line" />
                            Notes
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
        </Box>
      )}

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Notes</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Add and view communication notes and follow-ups related to students inquiries. "
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <CommunicationForm
          isStatus={false}
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          selectedStudent={editData}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />{' '}
      </CustomDialog>
      {/* <ConfirmDialog
        title="Move"
        content="Are you sure want to move in registration ?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await moveToRegistration(moveId);
              refetch();
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
      /> */}
    </Box>
  );
};

export default RegistrationFormScreen;
