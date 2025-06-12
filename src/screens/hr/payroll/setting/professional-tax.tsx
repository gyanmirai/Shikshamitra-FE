import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, Tooltip, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetProfessionalTaxQuery,
  useAddProfessionalTaxMutation,
  useDeleteProfessionalTaxMutation,
  useUpdateProfessionalTaxMutation,
} from 'src/redux/ProfessionalTax/ProfessionalTaxApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface IProfessionalTaxRange {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  genderType: number;
  fromSalary: number;
  toSalary: number;
  taxAmount: number;
}
const ProfessionalTax = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();

  const [editData, setEditData] = useState<null | IProfessionalTaxRange>(null);
  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetProfessionalTaxQuery,
  });
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteProfessionalTaxMutation,
  });

  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };

  const tableData = PFData?.items?.map((item: IProfessionalTaxRange) => ({
    ...item,
    genderValue: item.genderType === 3 ? 'All' : GenderType[item.genderType],
  }));
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
          Tax Range
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Tax Range Found{' '}
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
              Tax Range
            </Box>
          </>
        }
        tableId="professional-table"
        isLoading={isLoading}
        columns={[
          { id: 'genderValue', label: 'Gender' },
          {
            id: 'fromSalary',
            label: 'From salary',
            filterType: 'number',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'toSalary',
            label: 'To salary',
            filterType: 'number',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'taxAmount',
            label: 'Tax Amount',
            filterType: 'number',
            render(value, row) {
              return formatCurrency(value);
            },
          },
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
                  showThreeDots={false}
                  handleEditClick={() => {
                    setEditData(row as IProfessionalTaxRange);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IProfessionalTaxRange);
                    confirm.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Create New Tax Range</Typography>
            <Tooltip
              arrow
              placement="right"
              title="In this section, you can create a Professional Tax entry by setting the tax range, allowing for customized tax deductions based on salary brackets."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <ProfessionalTaxForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default ProfessionalTax;

const numberConvertor = (value: string | number): number => {
  if (typeof value === 'string') {
    const matches = value.match(/\d+/g);
    return matches ? +matches.join('') : 0;
  }

  return value;
};

const ProfessionalTaxForm = ({
  handleClose,
  editData,
}: {
  editData: IProfessionalTaxRange | null;
  handleClose: () => void;
}) => {
  const [addPf, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddProfessionalTaxMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax created successfully',
    },
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateProfessionalTaxMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Professional Tax updated successfully',
    },
  });
  const formik = useFormik({
    initialValues: {
      gender: editData?.genderType || 0,
      fromSalary: editData?.fromSalary || '',
      toSalary: editData?.toSalary || '',
      taxAmount: editData?.taxAmount || '',
    },
    validationSchema: Yup.object().shape({
      gender: Yup.number()
        .oneOf([0, 1, 2, 3], 'Invalid gender selected')
        .required('Gender is required'),
      fromSalary: Yup.string().required('From salary is required'),
      toSalary: Yup.string().required('To salary is required'),
      taxAmount: Yup.string().required('Tax amount is required'),
    }),
    onSubmit: async (values) => {
      console.log(values);
      try {
        if (editData) {
          await updatePF({
            id: editData.id,
            body: {
              genderType: values.gender,
              fromSalary: numberConvertor(values.fromSalary),
              toSalary: numberConvertor(values.toSalary),
              taxAmount: numberConvertor(values.taxAmount),
            },
          });
        } else {
          await addPf({
            genderType: values.gender,
            fromSalary: numberConvertor(values.fromSalary),
            toSalary: numberConvertor(values.toSalary),
            taxAmount: numberConvertor(values.taxAmount),
          });
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
        <Stack spacing={2} sx={{ p: 2 }}>
          <CustomSelect
            options={[
              { label: 'All', value: 3 },
              ...GenderTypeArray.map((item, index) => ({
                label: GenderType[index],
                value: index,
              })),
            ]}
            label="Gender"
            value={formik.values.gender}
            onChange={(val) => formik.setFieldValue('gender', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            error={formik.touched.gender && Boolean(formik.errors.gender)}
            helperText={(formik.touched.gender && formik.errors.gender) || ''}
          />

          <NumericFormatCustom
            size="small"
            label="From Salary"
            name="fromSalary"
            value={formik.values.fromSalary}
            onChange={formik.handleChange}
            error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
            helperText={formik.touched.fromSalary && formik.errors.fromSalary}
          />
          <NumericFormatCustom
            size="small"
            label="To Salary"
            name="toSalary"
            value={formik.values.toSalary}
            onChange={formik.handleChange}
            error={formik.touched.toSalary && Boolean(formik.errors.toSalary)}
            helperText={formik.touched.toSalary && formik.errors.toSalary}
          />
          <NumericFormatCustom
            size="small"
            label="Tax Amount"
            name="taxAmount"
            value={formik.values.taxAmount}
            onChange={formik.handleChange}
            error={formik.touched.taxAmount && Boolean(formik.errors.taxAmount)}
            helperText={formik.touched.taxAmount && formik.errors.taxAmount}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading || isUpdatePFLoading} variant="contained" type="submit">
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
