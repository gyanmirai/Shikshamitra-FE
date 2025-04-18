'use client';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useMoveToRegistrationMutation } from 'src/redux/student/registration/registration-api';
import { useGetStudentRegistrationFormQuery } from 'src/redux/student/registration-form/registration-form-api';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';

import type { IInquiryData } from '../Inquiry';

const RegistrationFormScreen = () => {
  const registerFormDialog = useBoolean();
  const [editData, setEditData] = useState<IInquiryData | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [dates, setDates] = useState([]);
  const followUpDialog = useBoolean();
  const confirmMovePopup = useBoolean();
  const {
    data: inquiryFormData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationFormQuery,
  });

  const [moveToRegistration] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToRegistrationMutation,
    popupConfig: {
      successMessage: 'Student moved to registration successfully',
      success: true,
    },
  });

  const tableData = useMemo(
    () =>
      inquiryFormData?.items.map((item: IInquiryData) => ({
        ...item,
        dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
        ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
        doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
        studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
        genderValue: GenderType[item?.genderType],
      })),
    [inquiryFormData?.items]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Issued Registration Form"
        description="An Issued Registration Form in a School ERP refers to a form provided to prospective students after inquiry, allowing them to officially apply for admission."
        links={[
          { name: 'Student' },
          { name: 'Student Enroll' },
          { name: 'Issued Registration Form' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        isLoading={isLoading}
        noDataText={<>No Issued Registration Form Data Found </>}
        tableId="student-registration-form-table"
        searchFieldProps={{
          placeholder: 'Search by Inquiry number, Student name, Class..',
          label: 'Search by Inquiry number, Student name, Class..',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'formNumber', label: 'Form No', minWidth: '110px', align: 'left' },
          {
            id: 'inquiryNumber',
            label: 'Inquiry Number',
            align: 'left',
            minWidth: '162px',
            isFilter: true,
            filterType: 'string',
          },
          { id: 'standard.name', label: 'Class', align: 'left' },
          { id: 'studentName', label: 'Student Name', minWidth: '160px', align: 'left' },
          {
            id: 'dobValue',
            label: 'DOB',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          { id: 'ageValue', label: 'Age', align: 'left' },
          {
            id: 'doiValue',
            label: 'DOI',
            minWidth: '120px',
            align: 'left',
            isDateRangeFilter: true,
          },
          { id: 'genderValue', label: 'Gender', align: 'left' },
          { id: 'address', label: 'Address', minWidth: '120px', align: 'left' },
          { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '160px', align: 'left' },
          {
            id: 'alternativeContactNumber',
            label: 'Alternate Contact Details',
            minWidth: '232px',
            align: 'left',
          },
          { id: 'previousSchoolName', label: 'Previous School', minWidth: '170px', align: 'left' },
          {
            id: 'inquiryPreference.preferenceName',
            label: 'Inquiry Preferences',
            minWidth: '200px',
            align: 'left',
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 40,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={async (e) => {
                          // dialog.onTrue();
                          // setMoveId(row.id);
                          registerFormDialog.onTrue();
                          setEditData(row as IInquiryData);
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
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
                        <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                        Follow Up
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
      />{' '}
      <CustomDialog
        maxWidth="xl"
        open={registerFormDialog.value}
        handleClose={() => {
          setEditData(null);
          registerFormDialog.onFalse();
        }}
        title="Move to Admission"
      >
        <RegisterForm
          editData={editData}
          handleClose={() => {
            setEditData(null);
            registerFormDialog.onFalse();
          }}
          isComeFromIssueForm
        />
      </CustomDialog>
      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Follow Up"
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
