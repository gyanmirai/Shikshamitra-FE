import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import FinanceAddedFeeHeadForFeeStructure from './finance-added-fee-head-for-fee-structure';

const validationSchema = Yup.object({
  bookRecipt: Yup.string().required('Receipt Book is required'),
  applicableGrade: Yup.string().required('Applicable Grade is required'),
  feeHead: Yup.string().required('Fee Category is required'),
  grossFee: Yup.string().required('Gross Fee is required'),
  discountAmount: Yup.string()
    .transform((value) => value.replace(/[^0-9.]/g, ''))
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      if (!value) return true; // Allow empty values (optional)
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  // discountRemark: Yup.string().required('Discount Remark is required'),
  // payableFee: Yup.string().required('Payable Fee is required'),
  paymentMethod: Yup.array().min(1, 'At least one Payment Method is required'),
  paymentDueDate: Yup.date().required('Payment Due Date is required'),

  // lateFeeChargesType: Yup.string().required('Late Fee Charges Type is required'),
  lateFeeChargesAmount: Yup.string()
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      if (!value) return true; // Allow empty values when not required
      return Number(value) > 0;
    })
    .when('lateFeeChargesType', {
      is: 'perDay',
      then: (schema) => schema.required('Late Fee Charges Amount is required when type is per day'),
    }),
});

interface FinanceAddFeeCategorySettingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  id: number;
  bookRecipt: string;
  applicableGrade: string;
  feeHead: string;
  grossFee: string;
  discountAmount: string;
  discountRemark: string;
  payableFee: string;
  paymentMethod: string[];
  paymentDueDate: any;
  multipleApplicableGrade: string[];
  chargesType: string;

  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
}

const FinanceAddFeeCategorySettingDialog: React.FC<FinanceAddFeeCategorySettingDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  interface FeeStructure {
    feeHead: string;
    grossFee: string;
    discountAmount: string;
    discountRemark: string;
    payableFee: string;
    paymentMethod: string[];
    lateFeeChargesAmount: string;
    lateFeeChargesType: string;
    applicableGrade: string;
    bookRecipt: string;
  }

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [feeHeadListForFeeStructure, setFeeHeadListForFeeStructure] = useState<FeeStructure[]>([]);
  const [isFieldsDisabled, setIsFieldsDisabled] = useState(false); // Controls disabling of receipt book & grade

  const initialValues = useMemo<FormikValue>(
    () => ({
      id: Math.floor(Math.random() * 10000),
      bookRecipt: '',
      applicableGrade: '',
      feeHead: '',
      grossFee: '',
      discountAmount: '',
      discountRemark: '',
      payableFee: '',
      paymentMethod: [],
      paymentDueDate: dayjs(),
      multipleApplicableGrade: [],
      chargesType: '',

      lateFeeChargesType: '',
      lateFeeChargesAmount: '',
    }),
    []
  );

  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const isDuplicate = feeHeadListForFeeStructure.some(
        (item) =>
          item.feeHead === values.feeHead &&
          item.applicableGrade === values.applicableGrade &&
          item.bookRecipt === values.bookRecipt
      );
      if (isDuplicate) {
        alert('This Fee Head is already added.');
        return;
      }

      setFeeHeadListForFeeStructure((prev: FeeStructure[]) => [
        ...prev,
        {
          ...values,
          lateFeeChargesAmount:
            values.lateFeeChargesType === 'none' ? 0 : values.lateFeeChargesAmount,
        } as FeeStructure,
      ]);

      setIsFieldsDisabled(true);

      formik.setValues({
        ...values, // Keep existing values
        feeHead: '',
        grossFee: '',
        discountAmount: '',
        discountRemark: '',
        payableFee: '',
        paymentMethod: [],
        lateFeeChargesAmount: '',
        lateFeeChargesType: '',

        // Fields you want to keep unchanged
        applicableGrade: values.applicableGrade,
        bookRecipt: values.bookRecipt,
      });
    },
  });

  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [dispatch, formik.values, initialValues]);

  const handleClear = () => {
    // setFeeHeadListForFeeStructure([]);
    formik.resetForm();
    setIsFieldsDisabled(false);
  };

  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  const handleDelete = (index: number) => {
    const updatedFeeHeadList = [...feeHeadListForFeeStructure];
    updatedFeeHeadList.splice(index, 1);
    setFeeHeadListForFeeStructure(updatedFeeHeadList);
  };
  const handleEdit = (row: any) => {
    formik.setValues(row);
  };

  const handleSubmit = () => {};

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" justifyContent="space-between">
          <CustomBreadcrumbs
            heading="Fee Structure"
            links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Fee Structure' }]}
          />
          <Box display="flex" gap={2}>
            <Button
              startIcon={<Iconify icon="bx:arrow-back" />}
              variant="contained"
              size="small"
              onClick={handleCloseDialog}
            >
              Back
            </Button>
            <Button
              startIcon={<Iconify icon="si:add-duotone" />}
              type="submit"
              variant="contained"
              size="small"
            >
              Add
            </Button>
            <Button
              startIcon={<Iconify icon="si:add-duotone" />}
              variant="contained"
              size="small"
              onClick={handleClear}
              disabled={feeHeadListForFeeStructure.length === 0}
            >
              Add For Other Class
            </Button>
            <Button variant="contained" size="small" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} py="30px">
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Receipt Book"
              options={[
                { value: 'cbse', label: 'CBSE' },
                { value: 'gseb', label: 'GSEB' },
              ]}
              value={formik.values.bookRecipt}
              onChange={(e) => formik.setFieldValue('bookRecipt', e)}
              disabled={isFieldsDisabled}
              error={formik.touched.bookRecipt && Boolean(formik.errors.bookRecipt)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Applicable Class"
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
              ]}
              value={formik.values.applicableGrade}
              onChange={(e) => formik.setFieldValue('applicableGrade', e)}
              disabled={isFieldsDisabled}
              error={formik.touched.applicableGrade && Boolean(formik.errors.applicableGrade)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Fee Type"
              options={[
                { value: 'tuitionFee', label: 'Tuition Fee' },
                { value: 'sportsFee', label: 'Sports Fee' },
                { value: 'transportFee', label: 'Transport Fee' },
              ]}
              value={formik.values.feeHead}
              onChange={(e) => formik.setFieldValue('feeHead', e)}
              error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NumericFormatCustom
              size="small"
              fullWidth
              label="Gross Fee"
              name="grossFee"
              value={formik.values.grossFee}
              onChange={(e) => {
                console.log(e.target.value);
                const grossFees = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                const discountAmount = +(
                  formik.values.discountAmount?.match(/\d/g)?.join('') ?? '0'
                );

                // Calculate payable fee
                const payableFee = Math.max(grossFees - discountAmount, 0); // Ensure it doesn't go negative

                // Set the calculated payable fee
                formik.setFieldValue('payableFee', payableFee);
                formik.handleChange(e);
              }}
              error={formik.touched.grossFee && Boolean(formik.errors.grossFee)}
              helperText={formik.touched.grossFee && formik.errors.grossFee}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NumericFormatCustom
              size="small"
              fullWidth
              label="Discount Amount"
              name="discountAmount"
              value={formik.values.discountAmount}
              onChange={(e) => {
                const discountAmount = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                const grossFees = +(formik.values.grossFee?.match(/\d/g)?.join('') ?? '0');
                // Calculate payable fee
                const payableFee = Math.max(grossFees - discountAmount, 0); // Ensure it doesn't go negative

                // Set the calculated payable fee
                formik.setFieldValue('payableFee', payableFee);
                formik.handleChange(e);
              }}
              error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
              helperText={formik.touched.discountAmount && formik.errors.discountAmount}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Discount Remark"
              name="discountRemark"
              value={formik.values.discountRemark}
              onChange={(e) => {
                formik.setFieldValue('discountRemark', capitalizeWords(e.target.value));
              }}
              error={formik.touched.discountRemark && Boolean(formik.errors.discountRemark)}
              helperText={formik.touched.discountRemark && formik.errors.discountRemark}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label="Payable Fee"
              name="payableFee"
              value={formik.values.payableFee}
              disabled
              error={formik.touched.payableFee && Boolean(formik.errors.payableFee)}
              helperText={formik.touched.payableFee && formik.errors.payableFee}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              multiple
              label="Payment Method"
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'check', label: 'Check' },
              ]}
              value={formik.values.paymentMethod}
              onChange={(e) => formik.setFieldValue('paymentMethod', e)}
              error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              // helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Late Fee Charges Type"
              options={[
                { value: 'perDay', label: 'Per Day' },

                { value: 'none', label: 'None' },
              ]}
              value={formik.values.lateFeeChargesType}
              onChange={(e) => formik.setFieldValue('lateFeeChargesType', e)}
              error={formik.touched.lateFeeChargesType && Boolean(formik.errors.lateFeeChargesType)}
            />
          </Grid>

          {formik.values.lateFeeChargesType === 'perDay' && (
            <Grid item xs={12} md={6}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Late Fee Charges Amount"
                name="lateFeeChargesAmount"
                value={formik.values.lateFeeChargesAmount}
                onChange={formik.handleChange}
                error={
                  formik.touched.lateFeeChargesAmount && Boolean(formik.errors.lateFeeChargesAmount)
                }
                helperText={
                  formik.touched.lateFeeChargesAmount && formik.errors.lateFeeChargesAmount
                }
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fees Due Date"
              value={formik.values.paymentDueDate}
              onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
        </Grid>
      </form>
      <FinanceAddedFeeHeadForFeeStructure
        onDelete={handleDelete}
        onEdit={handleEdit}
        data={feeHeadListForFeeStructure}
      />
    </>
  );
};

export default FinanceAddFeeCategorySettingDialog;
function resetForm(arg0: {
  values: {
    feeHead: string;
    grossFee: string;
    discountAmount: string;
    discountRemark: string;
    payableFee: string;
    paymentMethod: never[];
    lateFeeChargesAmount: string;
    lateFeeChargesType: string;
    // Keep these fields unchanged
    applicableGrade: string;
    bookRecipt: string;
  };
}) {
  throw new Error('Function not implemented.');
}
