'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Chip,
  Stack,
  Switch,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetInquiryPreferenceQuery,
  useAddInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
  useUpdateInquiryPreferenceStatusMutation,
} from 'src/redux/student/inquiry-preference/inquiry-preference-api';

import type { IInquiryPreference } from './type';

const InquiryPreference = ({ inquiryPreferenceDialog: externalDialog }: any) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  // Dialog state for add/edit inquiry source form
  // const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  const statusConfirm = useBoolean();
  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  const [editData, setEditData] = useState<null | IInquiryPreference>(null);
  const [statusData, setStatusData] = useState<null | IInquiryPreference>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const localInquiryPreferenceDialog = useBoolean();
  const inquiryPreferenceDialog = externalDialog || localInquiryPreferenceDialog;

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
  const [updatePreferenceStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateInquiryPreferenceStatusMutation,
  });

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

  const handleOpenStatusConfirm = (row: IInquiryPreference) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Inquiry Source"
        links={[
          { name: 'Student Enrollment', href: '/student/dashboard/' },
          { name: 'Settings', href: '/student/dashboard/' },
          { name: 'Inquiry Source' },
        ]}
        description="Manage inquiry sources used during admissions."
        action={
          <Button
            startIcon={<Add />}
            onClick={inquiryPreferenceDialog.onTrue}
            variant="contained"
            size="small"
            sx={{ px: '32px' }}
          >
            Inquiry Source
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
              try {
                await deletePreference(editData?.id).unwrap();
                shikshaMitraToast.success({ message: 'Inquiry source deleted successfully' });
                confirm.onFalse();
                setEditData(null);
              } catch {
                // Keep the dialog open; API error toast is handled by middleware.
              }
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={statusConfirm.value}
        onClose={() => {
          statusConfirm.onFalse();
          setStatusData(null);
          setDeactivationReason('');
        }}
        title={nextStatus ? 'Activate Inquiry Source' : 'Deactivate Inquiry Source'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Activate' : 'Deactivate'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {statusData?.preferenceName}
              </Box>
              ?
            </Typography>
            {!nextStatus && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Deactivation reason"
                value={deactivationReason}
                onChange={(event) => setDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              try {
                await updatePreferenceStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason || null,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Inquiry source ${nextStatus ? 'activated' : 'deactivated'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch {
                // Keep the dialog open; API error toast is handled by middleware.
              }
            }}
          >
            {nextStatus ? 'Activate' : 'Deactivate'}
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="inquiry-preference"
        tableTitle="Inquiry Source"
        noDataText={
          <>
            No Inquiry Source Data Found{' '}
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
              Add Inquiry Source
            </Box>
          </>
        }
        isLoading={isLoading || isFetching}
        columns={[
          { id: 'preferenceName', label: 'Inquiry Source' },
          {
            id: 'description',
            label: 'Description',
            render(value) {
              return value || '-';
            },
          },
          {
            id: 'isActive',
            label: 'Status',
            minWidth: 140,
            render(value, row) {
              const source = row as IInquiryPreference;
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={value ? 'Active' : 'Inactive'}
                    color={value ? 'success' : 'default'}
                    variant="soft"
                  />
                  <Switch
                    size="small"
                    checked={source.isActive}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => handleOpenStatusConfirm(source)}
                  />
                </Stack>
              );
            },
          },
          { id: 'assignedStudentsCount', label: 'Usage', align: 'right', filterType: 'number' },
          { id: 'displayOrder', label: 'Order', align: 'right', filterType: 'number' },
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
                  disableDeleteIcon={!(row as IInquiryPreference).canDelete}
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
        serverSidePagination
        serverSideSort
        totalCount={inquiryPreference?.totalCount || 0}
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: (page - 1) * rowsPerPage,
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
              {editData ? 'Update Inquiry Source' : 'Add Inquiry Source'}{' '}
            </Typography>
            <CustomTooltip arrow placement="right" title="Define how inquiries were received.">
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <InquiryPreferenceForm
          handleClose={handleClose}
          editData={editData}
          academicYearId={currentYear?.id}
        />
      </CustomDialog>
    </Box>
  );
};

export default InquiryPreference;

export const InquiryPreferenceForm = ({
  editData,
  handleClose,
  academicYearId,
}: {
  editData: null | IInquiryPreference;
  handleClose?: (e: any, isSubmit: boolean) => void;
  academicYearId?: string | null;
}) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const targetAcademicYearId = academicYearId || currentYear?.id;
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
    description: string;
    displayOrder: number;
  }>({
    initialValues: {
      fieldName: editData?.preferenceName || '',
      description: editData?.description || '',
      displayOrder: editData?.displayOrder || 0,
    },
    validationSchema: Yup.object({
      fieldName: Yup.string().required('Inquiry Source is required'),
      description: Yup.string().max(500, 'Description cannot exceed 500 characters'),
      displayOrder: Yup.number()
        .min(0, 'Display order cannot be negative')
        .required('Display order is required'),
    }),
    onSubmit: async (formikValues) => {
      if (editData) {
        try {
          await updatePreference({
            id: editData.id,
            body: {
              preferenceName: formikValues.fieldName,
              description: formikValues.description || null,
              displayOrder: formikValues.displayOrder,
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: `${formikValues.fieldName} inquiry source updated successfully`,
          });
          handleClose?.(null, true);
        } catch {
          // Keep the dialog open; API error toast is handled by middleware.
        }
        return;
      }
      if (!targetAcademicYearId) {
        shikshaMitraToast.error({ message: 'Academic year is required for inquiry source.' });
        return;
      }

      try {
        await addPreference({
          academicYearId: targetAcademicYearId,
          data: {
            preferenceName: formikValues.fieldName,
            description: formikValues.description || null,
            displayOrder: formikValues.displayOrder,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `${formikValues.fieldName} inquiry source added successfully`,
        });
        handleClose?.(null, true);
      } catch {
        // Keep the dialog open; API error toast is handled by middleware.
      }
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
              label="Inquiry Source *"
              name="fieldName"
              value={values.fieldName}
              onChange={(e) => {
                setFieldValue('fieldName', e.target.value);
              }}
              error={Boolean(errors.fieldName && touched.fieldName)}
              helperText={(touched.fieldName && errors.fieldName) || ''}
            />
          </ShakingTextField>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Description"
            name="description"
            value={values.description}
            onChange={(event) => setFieldValue('description', event.target.value)}
            error={Boolean(errors.description && touched.description)}
            helperText={(touched.description && errors.description) || ''}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Display Order"
            name="displayOrder"
            value={values.displayOrder}
            onChange={(event) => setFieldValue('displayOrder', Number(event.target.value))}
            error={Boolean(errors.displayOrder && touched.displayOrder)}
            helperText={(touched.displayOrder && errors.displayOrder) || ''}
            inputProps={{ min: 0 }}
          />
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
