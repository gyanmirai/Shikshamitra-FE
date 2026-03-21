'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/custom-dialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  inquiryPreferenceApi,
  useGetInquiryPreferenceQuery,
  useAddInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
} from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import type { IInquiryPreference } from './type';

const InquiryPreference = () => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  // Dialog state for add/edit inquiry preference form
  // const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  const [editData, setEditData] = useState<null | IInquiryPreference>(null);
  const inquiryPreferenceDialog = useBoolean();

  const [query, setQuery] = useState({
    skipCount: 0,
    maxResultCount: 10,
    sorting: '',
  });

  const {
    data: inquiryPreference,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: currentYear?.id,
      ...query,
    },
    options: {
      skip: !currentYear?.id,
    },
  });

  const [deletePreference, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteInquiryPreferenceMutation,
  });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      inquiryPreferenceDialog.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      inquiryPreferenceDialog.onFalse();
      setEditData(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Inquiry Preference"
        links={[
          { name: 'Student Enrollment', href: '/student/dashboard/' },
          { name: 'Settings', href: '/student/dashboard/' },
          { name: 'Inquiry Preference' },
        ]}
        description="Manage how inquiries are received to optimize student admissions tracking."
        action={
          <Button
            startIcon={<Add />}
            onClick={inquiryPreferenceDialog.onTrue}
            variant="contained"
            size="small"
            sx={{ px: '32px' }}
          >
            Inquiry Preference
          </Button>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {editData?.preferenceName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    inquiryPreferenceApi.util.updateQueryData(
                      'getInquiryPreference',
                      {
                        academicYearId: currentYear?.id,
                        ...query,
                      },
                      (draft: any) => {
                        const index = draft?.items?.findIndex(
                          (pref: any) => pref.id === editData?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1 && draft?.items) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    inquiryPreferenceApi.util.updateQueryData(
                      'getInquiryPreference',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        if (!draft?.items) return;
                        draft.items.splice(index, 0, editData);
                      }
                    )
                  ),
                onCommit: () => deletePreference(editData?.id),
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="inquiry-preference"
        tableTitle="Inquiry Preference"
        noDataText={
          <>
            No Inquiry Preference Data Found{' '}
            <Box
              onClick={() => {
                inquiryPreferenceDialog.onTrue();
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
              Add Inquiry Preference
            </Box>
          </>
        }
        isLoading={isLoading || isFetching}
        columns={[
          { id: 'preferenceName', label: 'Preference Name' },
          {
            id: 'action',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 40,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  handleDeleteClick={() => {
                    setEditData(row as IInquiryPreference);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    setEditData(row as IInquiryPreference);
                    inquiryPreferenceDialog.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
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
        data={inquiryPreference?.items || []}
      />{' '}
      <CustomDialog
        open={inquiryPreferenceDialog.value}
        handleClose={() => {
          inquiryPreferenceDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {' '}
              {editData ? 'Update Inquiry Preference' : 'Add Inquiry Preference'}{' '}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Define how inquiries were received to better track student admission sources."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <InquiryPreferenceForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default InquiryPreference;

export const InquiryPreferenceForm = ({
  editData,
  handleClose,
}: {
  editData: null | IInquiryPreference;
  handleClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const [addPreference, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddInquiryPreferenceMutation,
  });
  const [updatePreference, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateInquiryPreferenceMutation,
  });

  const { initialValues, values, setFieldValue, handleSubmit, errors, touched } = useFormik<{
    fieldName: string;
  }>({
    initialValues: {
      fieldName: editData?.preferenceName || '',
    },
    validationSchema: Yup.object({
      fieldName: Yup.string().required('Preference Name is required'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        await updatePreference({
          id: editData.id,
          body: {
            preferenceName: formikValues.fieldName,
          },
        });
        shikshaMitraToast.success({
          message: `${formikValues.fieldName} Inquiry preference updated successfully`,
        });
        handleClose?.(null, true);
        return;
      }
      await addPreference({
        academicYearId: currentYear?.id,
        data: {
          preferenceName: formikValues.fieldName,
        },
      });
      shikshaMitraToast.success({
        message: `${formikValues.fieldName} Inquiry preference added successfully`,
      });
      handleClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      {/* <form onSubmit={handleSubmit}> */}
      <DialogScrollContent>
        {/* <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}> */}
        <Stack spacing={2}>
          <ShakingTextField error={!!(touched.fieldName && errors.fieldName) || false}>
            <TextField
              fullWidth
              size="small"
              label="Preference Name *"
              name="fieldName"
              value={values.fieldName}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');

                setFieldValue('fieldName', onlyLetters);
                // setFieldTouched('previousSchool', true);
              }}
              error={Boolean(errors.fieldName && touched.fieldName)}
              helperText={(touched.fieldName && errors.fieldName) || ''}
            />
          </ShakingTextField>
        </Stack>
        {/* </Scrollbar> */}
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={() => {
            handleClose?.(null, false);
          }}
          size="small"
        >
          Cancel
        </Button>

        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdateLoading || isLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            handleSubmit(e);
          }}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};
