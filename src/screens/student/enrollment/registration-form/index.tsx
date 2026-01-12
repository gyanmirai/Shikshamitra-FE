'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { GenderType, GenderOptions } from 'src/enums/gender';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, MenuItem, MenuList, Typography } from '@mui/material';
import {
  StudentRegistrationFormApi,
  useGetStudentRegistrationFormQuery,
} from 'src/redux/student/registration-form/registration-form-api';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';

import type { IGeneralInformationResponse } from '../register/type';

const RegistrationFormScreen = () => {
  // Dialog control for registration form
  const registerFormDialog = useBoolean();
  const dispatch = useDispatch();
  // State to store inquiry data for editing
  const [editData, setEditData] = useState<IGeneralInformationResponse | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Dialog control for follow-up form
  const followUpDialog = useBoolean();

  const { currentMedium } = useSelector((state: any) => state.globalState);

  // Query hook to fetch registration form data
  const { data: inquiryFormData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationFormQuery,
    params: {
      academicMediumId: currentMedium.id,
    },
    options: {
      skip: !currentMedium.id,
    },
  });

  // Mutation hook to move student to registration status
  // const [moveToRegistration] = useQueryAndMutation({
  //   type: 'mutation',
  //   currentQueryAndMutation: useMoveToRegistrationMutation,
  //   popupConfig: {
  //     successMessage: 'Student moved to registration successfully',
  //     success: true,
  //   },
  // });

  // Transform inquiry form data into table-friendly format
  // - Formats dates (DOB and DOI) into DD-MM-YYYY
  // - Calculates age from DOB
  // - Combines first, middle and last names
  // - Maps gender type enum to display value
  const tableData = useMemo(
    () =>
      inquiryFormData?.data?.items?.map((item: any) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        genderValue: GenderType[item?.gender as any],
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
      })),
    [inquiryFormData?.data?.items]
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

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '180px',
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
      {
        id: 'formNo',
        label: 'Form No.',
        minWidth: '100px',
        align: 'left',
        sticky: true,
      },
      {
        id: 'inquiryNo',
        label: 'Inquiry No.',
        align: 'left',
        minWidth: '115px',
        isFilter: true,
        filterType: 'string',
      },
      { id: 'standard', label: 'Class', align: 'left', filterType: 'number' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '128px',
        align: 'left',
        isFilter: true,
        filterType: 'date',
      },
      { id: 'age', label: 'Age', align: 'left' },
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
        minWidth: '170px',
        align: 'left',
        render(value, row) {
          return value || '-';
        },
      },
      {
        id: 'inquiryPreference',
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
                      setEditData(row as IGeneralInformationResponse);
                      registerFormDialog.onTrue();
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:arrow-right-circle" />
                    Move to Registration
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      setEditData(row as IGeneralInformationResponse);
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
    ],
    [followUpDialog, registerFormDialog]
  );

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
            { name: 'Student Enrollment', href: '/student/enrollment/dashboard/' },
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
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Registration Form Issued Data Found </>}
          tableId="student-registration-form-table"
          columns={columns}
          data={tableData || []}
        />
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
          studentEnrollmentId={(editData as IGeneralInformationResponse)?.studentId || ''}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default RegistrationFormScreen;
