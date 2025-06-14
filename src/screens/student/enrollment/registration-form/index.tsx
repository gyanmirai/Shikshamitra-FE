'use client';

import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useMoveToRegistrationMutation } from 'src/redux/student/registration/registration-api';
import {
  StudentRegistrationFormApi,
  useGetStudentRegistrationFormQuery,
} from 'src/redux/student/registration-form/registration-form-api';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
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
        genderValue: GenderType[item?.genderType],
        address: [item.addressLine1, item.addressLine2, item.addressLine3]
          .filter(Boolean)
          .join(', '),
      })),
    [inquiryFormData?.items]
  );
  console.log('🚀 ~ RegistrationFormScreen ~ tableData:', tableData);

  return (
    <Box>
      {registerFormDialog.value ? (
        <CustomBreadcrumbs
          heading="Move to Registration"
          description="Move student from registration form issued to registration status. This step allows you to proceed with the formal registration process after initial inquiry."
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Student Enrollment', href: '/student/enrollment/registration-form/' },
            { name: 'Registration Form Issued' },
            { name: 'Move to Registration' },
          ]}
          isBack
          onBack={() => {
            setEditData(null);
            registerFormDialog.onFalse();
            dispatch(StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form']));
          }}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Registration Form Issued"
          description="An Registration Form Issued in a School ERP refers to a form provided to prospective students after inquiry, allowing them to officially apply for admission."
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Student Enrollment', href: '/student/enrollment/registration-form/' },
            { name: 'Registration Form Issued' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      )}
      {registerFormDialog.value ? (
        <RegisterForm
          editData={editData}
          handleClose={() => {
            setEditData(null);
            registerFormDialog.onFalse();
            dispatch(StudentRegistrationFormApi.util.invalidateTags(['Student-Registration-Form']));
          }}
          isComeFromIssueForm
        />
      ) : (
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
            { id: 'formNumber', label: 'Form No.', minWidth: '100px', align: 'left', sticky: true },
            {
              id: 'inquiryNumber',
              label: 'Inquiry No.',
              align: 'left',
              minWidth: '110px',
              isFilter: true,
              filterType: 'string',
            },
            { id: 'standard.name', label: 'Class', align: 'left' },
            {
              id: 'dobValue',
              label: 'DOB',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'date',
            },
            { id: 'ageValue', label: 'Age', align: 'left' },
            {
              id: 'doiValue',
              label: 'Inquiry Date',
              minWidth: '120px',
              align: 'left',
              isDateRangeFilter: true,
            },
            { id: 'genderValue', label: 'Gender', align: 'left' },
            {
              id: 'address',
              label: 'Address',
              minWidth: '120px',
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
            },
            {
              id: 'inquiryPreference.preferenceName',
              label: 'Inquiry Preference',
              minWidth: '130px',
              align: 'left',
            },
            // {
            //   id: 'followUpStatusType',
            //   label: 'Follow Up Status',
            //   filterType: 'enum',
            //   enumOptions: FollowUpStatusTypeOptions,
            //   minWidth: '170px',
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
              isFilter: false,
              isSort: false,
              sticky: true,
              minWidth: 40,
              render(value, row) {
                console.log('🚀 ~ render ~ row:', row);

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
                          Note
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
      )}

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Note"
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
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
