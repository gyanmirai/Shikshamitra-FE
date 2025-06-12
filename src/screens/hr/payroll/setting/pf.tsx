import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Add from '@mui/icons-material/Add';
import { Box, Stack, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetPFQuery,
  useAddPFMutation,
  useUpdatePFMutation,
  useDeletePFMutation,
} from 'src/redux/PF/PFApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface IPF {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  code: string;
  name: string;
  employeePercentage: number;
  employerPercentage: number;
}
const PF = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [editData, setEditData] = useState<null | IPF>(null);
  // const [employee, setEmployee] = useState<string[] | undefined>([]);

  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPFQuery,
  });
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePFMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isPFDeleteLoading}
            color="error"
            onClick={async () => {
              await deletePF(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          PF
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No PF Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              PF
            </Box>
          </>
        }
        tableId="pf-table"
        isLoading={isLoading}
        columns={[
          { id: 'code', label: 'Code' },
          { id: 'name', label: 'Name' },
          { id: 'employeePercentage', label: 'Employee Percentage' },
          { id: 'employerPercentage', label: 'Employer Percentage' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,

            minWidth: '140px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row as IPF);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IPF);
                    confirm.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={PFData?.items || []}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">{editData ? 'Update PF' : 'Create New PF'}</Typography>
            <Tooltip
              arrow
              placement="right"
              title="In this section, you can create a new Provident Fund (PF) entry by specifying the percentage to be deducted from the employee's salary."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <PFForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default PF;

const PFForm = ({ editData, handleClose }: { editData: any; handleClose: () => void }) => {
  const [addPF, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddPFMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'PF created successfully',
    },
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePFMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'PF updated successfully',
    },
  });

  const formik = useFormik({
    initialValues: {
      code: editData?.code || '',
      name: editData?.name || '',
      employeePercentage: editData?.employeePercentage || '',
      employerPercentage: editData?.employerPercentage || '',
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required('Code is required'),
      name: Yup.string().required('Name is required'),
      employeePercentage: Yup.number().required('Employee Percentage is required'),
      employerPercentage: Yup.number().required('Employer Percentage is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updatePF({
            body: values,
            id: editData.id,
          });
        } else {
          await addPF(values);
        }
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <TextField
            size="small"
            label="Code"
            fullWidth
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code ? String(formik.errors.code) : ''}
          />
          <TextField
            size="small"
            label="Name"
            fullWidth
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name ? String(formik.errors.name) : ''}
          />
          <TextField
            size="small"
            label="Employee Percentage"
            type="number"
            fullWidth
            name="employeePercentage"
            value={formik.values.employeePercentage}
            onChange={formik.handleChange}
            error={formik.touched.employeePercentage && Boolean(formik.errors.employeePercentage)}
            helperText={
              formik.touched.employeePercentage && formik.errors.employeePercentage
                ? String(formik.errors.employeePercentage)
                : ''
            }
          />
          <TextField
            size="small"
            type="number"
            label="Employer Percentage"
            fullWidth
            name="employerPercentage"
            value={formik.values.employerPercentage}
            onChange={formik.handleChange}
            error={formik.touched.employerPercentage && Boolean(formik.errors.employerPercentage)}
            helperText={
              formik.touched.employerPercentage && formik.errors.employerPercentage
                ? String(formik.errors.employerPercentage)
                : ''
            }
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button size="small" variant="outlined">
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdatePFLoading}
          size="small"
          variant="contained"
          type="submit"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
