'use client';

import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Tooltip,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

const StatutoryTemplate = () => {
  const dialog = useBoolean();
  const deleteConfirmationDialog = useBoolean();
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem>
            <Iconify icon="mdi:arrow-right-circle" />
            <ListItemText>Assign Employee</ListItemText>
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} size="small" variant="contained" onClick={dialog.onTrue}>
          Statutory Template
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Statutory Template Found{' '}
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
              Statutory Template
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by Template Name, Type...',
          label: 'Search by Template Name, Type....',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        tableId="Statutory-template-table"
        // isLoading={isLoading}
        columns={[
          { id: 'templateName', label: 'Template Name' },
          { id: 'templateType', label: 'Template Type' },
          { id: 'employeePercentage', label: 'Employee Percentage' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,

            minWidth: '140px',

            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    deleteConfirmationDialog.onTrue();
                  }}
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            templateName: 'EPF1',
            templateType: 'EPF',
            employeePercentage: '12%',
          },
          {
            id: 2,
            templateName: 'PT1',
            templateType: 'PT',
            employeePercentage: '5%',
          },
          {
            id: 3,
            templateName: 'TDS2',
            templateType: 'TDS',
            employeePercentage: '2%',
          },
          {
            id: 4,
            templateName: 'TDS1',
            templateType: 'TDS',
            employeePercentage: '8%',
          },
        ]}
      />
      <CustomDialog
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Add Statutory Component</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This section allows you to create and manage statutory templates for compliance with legal requirements. You can configure templates for tax calculations, deductions, benefits, and other statutory obligations as per the applicable laws."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        handleClose={dialog.onFalse}
        open={dialog.value}
      >
        <AddStatutoryComponent
          payElements={[]}
          handleClose={() => {
            dialog.onFalse();
          }}
          editData={[]}
        />
      </CustomDialog>

      {deleteConfirmationDialog.value && (
        <ConfirmDialog
          open={deleteConfirmationDialog.value}
          onClose={deleteConfirmationDialog.onFalse}
          title="Delete Item"
          content=" Are you sure you want to delete?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}
    </Box>
  );
};

export default StatutoryTemplate;

interface AddStatutoryComponentFormProps {
  payElements: any[];
  handleClose: () => void;
  editData?: any | null;
}

const AddStatutoryComponent = ({
  payElements,
  handleClose,
  editData,
}: AddStatutoryComponentFormProps) => {
  const { values, setFieldValue, handleChange, handleSubmit } = useFormik({
    initialValues: {
      templateName: editData?.templateName || '',
      templateType: editData?.templateType || '',
      employeePercentage: editData?.employeePercentage || 0,
      employerPercentage: editData?.employerPercentage || 0,
      professionalTax: editData?.professionalTax || '',
      tdsAmount: editData?.tdsAmount || 0,
    },
    onSubmit: async (val) => {
      console.log('on submit calls');

      //   try {
      //     if (editData) {
      //       await updatePayElement({
      //         id: editData.id,
      //         body: {
      //           code: val.code,
      //           name: val.name,
      //           type: val.payElementType,
      //           isEmployeeSpecific: val.employeeSpecific,
      //           isDependent: val.depend,
      //           ...(val.depend
      //             ? {
      //                 dependent: {
      //                   elementCode: val.elementCode,
      //                   percentage: null,
      //                   amount: val.amount,
      //                 },
      //               }
      //             : {}),

      //           isVisibleInPaySlip: val.paySlip,
      //         },
      //       });
      //     } else {
      //       await addPayElement({
      //         code: val.code,
      //         name: val.name,
      //         type: val.payElementType,
      //         isEmployeeSpecific: val.employeeSpecific,
      //         isDependent: val.depend,
      //         ...(val.depend
      //           ? {
      //               dependent: {
      //                 elementCode: val.elementCode,
      //                 percentage: null,
      //                 amount: val.amount,
      //               },
      //             }
      //           : {}),

      //         isVisibleInPaySlip: val.paySlip,
      //       });
      //     }
      //     handleClose();
      //   } catch (error) {
      //     console.log(error);
      //   }
    },
  });

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="templateName"
                label="Template Name"
                value={values.templateName}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                name="templateType"
                label="Template Type"
                value={values.templateType}
                options={[
                  { value: 'EPF', label: 'EPF' },
                  { value: 'ESI', label: 'ESI' },
                  { value: 'PT', label: 'PT' },
                  { value: 'TDS', label: 'TDS' },
                ]}
                onChange={(val) => {
                  setFieldValue('templateType', val);
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="employeePercentage"
                label="Employee Percentage"
                value={values.employeePercentage}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="employerPercentage"
                label="Employer Percentage"
                value={values.employerPercentage}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">For PT</Typography>
            </Grid>
            <Grid item xs={12} />
            <Grid item xs={12}>
              <Typography variant="subtitle2">For TDS</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="tdsAmount"
                label="TDS Amount"
                value={values.tdsAmount}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button variant="outlined">Cancel</Button>
          <LoadingButton variant="contained" type="submit">
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Box>
  );
};
