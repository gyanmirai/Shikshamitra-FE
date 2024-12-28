import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, DialogActions } from '@mui/material';

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
        content="Are you sure want to delete?"
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
            Delete
          </LoadingButton>
        }
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Tax Range
        </Button>
      </Box>
      <CustomizableTable
        isLoading={isLoading}
        columns={[
          { id: 'genderValue', label: 'Gender' },
          {
            id: 'fromSalary',
            label: 'From salary',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'toSalary',
            label: 'To salary',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'Tax amount',
            label: 'tax Amount',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'action',
            label: 'Action',
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
      <CustomDialog open={dialog.value} handleClose={handleClose} title="Create New Tax Range">
        <ProfessionalTaxForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default ProfessionalTax;

const numberConvertor = (value: string | number) => {
  if (typeof value === 'string') {
    return value.match(/\d+/g)?.join('');
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
