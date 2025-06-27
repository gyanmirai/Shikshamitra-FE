import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Switch,
  Button,
  MenuItem,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

const EarningComponent = ({
  isEarningComponentOpen,
}: {
  isEarningComponentOpen: UseBooleanReturn;
}) => {
  const [editData, setEditData] = useState<any>(null);

  return (
    <Box>
      <CustomizableTable
        tableId="earning-component"
        columns={[
          { id: 'name', label: 'Name', align: 'left', minWidth: '10vw' },
          { id: 'description', label: 'Description', align: 'left', minWidth: '10vw' },
          { id: 'componentType', label: 'Component Type', align: 'left', minWidth: '11vw' },
          { id: 'dependOn', label: 'Depend On', align: 'left', minWidth: '10vw' },
          { id: 'amount', label: 'Amount', align: 'left', minWidth: '10vw' },
          {
            id: 'visibleInPayslip',
            label: 'Visible In Payslip',
            align: 'left',
            minWidth: '10vw',
            render(value, row) {
              return value ? 'Yes' : 'No';
            },
          },
          {
            id: 'action',
            label: 'Action',
            minWidth: '4vw',
            align: 'left',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row);
                    isEarningComponentOpen.onTrue();
                  }}
                  handleDeleteClick={() => {}}
                />
              );
            },
          },
        ]}
        data={[
          {
            name: 'Basic Salary',
            description: 'Base salary component',
            componentType: 'Fixed',
            dependOn: 'None',
            amount: '30000',
            visibleInPayslip: true,
          },
          {
            name: 'House Rent Allowance',
            description: 'HRA component',
            componentType: 'Fixed',
            dependOn: 'Basic',
            amount: '40%',
            visibleInPayslip: true,
          },
          {
            name: 'Performance Bonus',
            description: 'Quarterly performance bonus',
            componentType: 'Variable',
            dependOn: 'Basic',
            amount: '15%',
            visibleInPayslip: true,
          },
          {
            name: 'Transport Allowance',
            description: 'Monthly transport allowance',
            componentType: 'Fixed',
            dependOn: 'None',
            amount: '3000',
            visibleInPayslip: true,
          },
          {
            name: 'Special Allowance',
            description: 'Additional benefits',
            componentType: 'Variable',
            dependOn: 'Gross',
            amount: '10%',
            visibleInPayslip: false,
          },
        ]}
      />
      <CustomDialog
        maxWidth="md"
        open={isEarningComponentOpen.value}
        handleClose={() => {
          isEarningComponentOpen.onFalse();
          setEditData(null);
        }}
        title="Earning Component"
      >
        <EarningComponentForm
          editData={editData}
          handleClose={() => {
            isEarningComponentOpen.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default EarningComponent;

const componentTypes = ['Fixed', 'Percentage'];
const dependsOnOptions = ['Basic', 'Gross', 'Fixed'];

const validationSchema = Yup.object({
  componentName: Yup.string().required('Component Name is required'),
  description: Yup.string(),
  componentType: Yup.string().required('Component Type is required'),
  dependOn: Yup.string().required('Depend On is required'),
  amount: Yup.string().required('Amount is required'),
});

const EarningComponentForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      componentName: editData?.name || '',
      description: editData?.description || '',
      componentType: editData?.componentType || '',
      dependOn: editData?.dependOn || '',
      amount: editData?.amount || '',
      visibleInPayslip: editData?.visibleInPayslip || true,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <>
      <DialogScrollContent>
        {/* General Information */}
        <SectionCard title="General Information">
          <Grid item xs={12} sm={6}>
            <ShakingTextField
              error={formik.touched.componentName && Boolean(formik.errors.componentName)}
            >
              <TextField
                size="small"
                fullWidth
                label="Component Name *"
                name="componentName"
                value={formik.values.componentName}
                onChange={formik.handleChange}
                error={formik.touched.componentName && Boolean(formik.errors.componentName)}
                helperText={(formik.touched.componentName && formik.errors.componentName) as string}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ShakingTextField
              error={formik.touched.description && Boolean(formik.errors.description)}
            >
              <TextField
                size="small"
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </ShakingTextField>
          </Grid>
        </SectionCard>

        {/* Earning Configuration */}
        <SectionCard title="Earning Configuration">
          <Grid item xs={12} sm={6} md={4}>
            <ShakingTextField
              error={formik.touched.componentType && Boolean(formik.errors.componentType)}
            >
              <TextField
                size="small"
                select
                fullWidth
                label="Component Type *"
                name="componentType"
                value={formik.values.componentType}
                onChange={formik.handleChange}
                error={formik.touched.componentType && Boolean(formik.errors.componentType)}
                helperText={(formik.touched.componentType && formik.errors.componentType) as string}
              >
                {componentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ShakingTextField error={formik.touched.dependOn && Boolean(formik.errors.dependOn)}>
              <TextField
                size="small"
                select
                fullWidth
                label="Depend on *"
                name="dependOn"
                value={formik.values.dependOn}
                onChange={formik.handleChange}
                error={formik.touched.dependOn && Boolean(formik.errors.dependOn)}
                helperText={(formik.touched.dependOn && formik.errors.dependOn) as string}
              >
                {dependsOnOptions.map((dep) => (
                  <MenuItem key={dep} value={dep}>
                    {dep}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
              <TextField
                size="small"
                fullWidth
                label="Amount Percentage/Amount *"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={(formik.touched.amount && formik.errors.amount) as string}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} alignItems="center" display="flex">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="visibleInPayslip"
                  checked={formik.values.visibleInPayslip}
                  onChange={formik.handleChange}
                />
              }
              label="Visible in Payslip"
            />
          </Grid>
        </SectionCard>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
