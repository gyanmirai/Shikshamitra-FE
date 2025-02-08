import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';

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
  enterChargesAmount: string;
}

const validationSchema = Yup.object({
  bookRecipt: Yup.string().required('Receipt Book is required'),
  applicableGrade: Yup.string().required('Applicable Grade is required'),
  feeHead: Yup.string().required('Fee Category is required'),
  grossFee: Yup.string().required('Gross Fee is required'),
  discountAmount: Yup.string().required('Discount Amount is required'),
  discountRemark: Yup.string().required('Discount Remark is required'),
  payableFee: Yup.string().required('Payable Fee is required'),
  paymentMethod: Yup.array().min(1, 'At least one Payment Method is required'),
  paymentDueDate: Yup.date().required('Payment Due Date is required').nullable(),
  chargesType: Yup.string().required('Charges Type is required'),
  enterChargesAmount: Yup.string().required('Charges Amount is required'),
});

const FinanceAddFeeCategorySettingDialog: React.FC<FinanceAddFeeCategorySettingDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [feeHeadListForFeeStructure, setFeeHeadListForFeeStructure] = useState<any[]>([]);
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
      enterChargesAmount: '',
    }),
    []
  );

  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted');
      formik.handleSubmit();

      const isDuplicate = feeHeadListForFeeStructure.some(
        (item) => item.feeHead === values.feeHead
      );
      if (isDuplicate) {
        alert('This Fee Head is already added.');
        return;
      }

      setFeeHeadListForFeeStructure((prev) => [...prev, values]);
      setIsFieldsDisabled(true); // Disable receipt book & grade after first entry
    },
  });

  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [dispatch, formik.values, initialValues]);

  const handleClear = () => {
    setFeeHeadListForFeeStructure([]);
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

  useEffect(() => {
    // Convert values to numbers (handle empty cases gracefully)
    const grossFee = Number(formik.values.grossFee) || 0;
    const discountAmount = Number(formik.values.discountAmount) || 0;

    // Calculate payable fee
    const payableFee = Math.max(grossFee - discountAmount, 0); // Ensure it doesn't go negative

    // Set the calculated payable fee
    formik.setFieldValue('payableFee', payableFee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.grossFee, formik.values.discountAmount]); // Runs whenever grossFee or discountAmount changes

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box display="flex" justifyContent="space-between">
        <CustomBreadcrumbs
          heading="Fee Structure"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Fee Structure' }]}
        />
        <Box display="flex" gap={2}>
          <Button
            type="submit"
            onClick={() => formik.handleSubmit()}
            variant="contained"
            size="small"
            disabled={feeHeadListForFeeStructure.length > 0}
          >
            Add
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleClear}
            disabled={feeHeadListForFeeStructure.length === 0}
          >
            Clear
          </Button>
          <Button variant="contained" size="small" onClick={handleCloseDialog}>
            Back
          </Button>
        </Box>
      </Box>

      <Box py={2} display="flex" flexDirection="column" gap={3}>
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

        <NumericFormatCustom
          label="Gross Fee"
          name="grossFee"
          value={formik.values.grossFee}
          onChange={formik.handleChange}
          error={formik.touched.grossFee && Boolean(formik.errors.grossFee)}
          helperText={formik.touched.grossFee && formik.errors.grossFee}
        />

        <NumericFormatCustom
          label="Discount Amount"
          name="discountAmount"
          value={formik.values.discountAmount}
          onChange={formik.handleChange}
          error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
          helperText={formik.touched.discountAmount && formik.errors.discountAmount}
        />

        <TextField
          label="Discount Remark"
          name="discountRemark"
          value={formik.values.discountRemark}
          onChange={formik.handleChange}
          error={formik.touched.discountRemark && Boolean(formik.errors.discountRemark)}
          helperText={formik.touched.discountRemark && formik.errors.discountRemark}
        />

        <TextField
          label="Payable Fee"
          name="payableFee"
          value={formik.values.payableFee}
          disabled
          error={formik.touched.payableFee && Boolean(formik.errors.payableFee)}
          helperText={formik.touched.payableFee && formik.errors.payableFee}
        />

        <DatePicker
          label="Fees Due Date"
          value={formik.values.paymentDueDate}
          onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
          slotProps={{
            textField: {
              error: formik.touched.paymentDueDate && Boolean(formik.errors.paymentDueDate),
            },
          }}
        />

        {/* <FinanceAddedFeeHeadForFeeStructure data={feeHeadListForFeeStructure} /> */}
      </Box>
    </form>
  );
};

export default FinanceAddFeeCategorySettingDialog;
