'use client';

import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
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

const StatutoryTemplate = () => {
  const dialog = useBoolean();
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
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {}}
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
        title="Add Statutory Component"
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
