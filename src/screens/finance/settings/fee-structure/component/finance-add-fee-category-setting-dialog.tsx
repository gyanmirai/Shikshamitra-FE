import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Card, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { feeStructurevalidationSchema } from '../validationSchema';
import FeeHeadDialog from '../../general-setting/dialog/fee-head-dialog';
import PaymentMethodDialog from '../../general-setting/dialog/payment-method';
import FinanceAddedFeeHeadForFeeStructure from './finance-added-fee-head-for-fee-structure';
import FinanceReceiptBookDialogForDropdown from '../../general-setting/dialog/receipt-book-dialog';

import type {
  IFormikValue,
  IFeeStructure,
  IFinanceAddFeeCategorySettingDialogProps,
} from '../fee-structure-interface';

const FinanceAddFeeCategorySettingDialog: React.FC<IFinanceAddFeeCategorySettingDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
  setSelectedEntry,
}) => {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store the list of fee structures
  const [feeHeadListForFeeStructure, setFeeHeadListForFeeStructure] = useState<IFeeStructure[]>([]);
  // State to control whether receipt book & grade fields should be disabled
  const [isFieldsDisabled, setIsFieldsDisabled] = useState(false);

  // Initial form values with default/empty values
  const initialValues = useMemo<IFormikValue>(
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

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik<IFormikValue>({
    initialValues,
    validationSchema: feeStructurevalidationSchema,
    onSubmit: (values) => {
      // Check if the fee head combination already exists
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

      // Add new fee structure to the list
      setFeeHeadListForFeeStructure((prev: IFeeStructure[]) => [
        ...prev,
        {
          ...values,
          lateFeeChargesAmount:
            values.lateFeeChargesType === 'none' ? 0 : values.lateFeeChargesAmount,
        } as IFeeStructure,
      ]);

      // Disable receipt book & grade fields after first entry
      setIsFieldsDisabled(true);

      // Reset form while keeping some field values
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
        // Preserve these fields
        applicableGrade: values.applicableGrade,
        bookRecipt: values.bookRecipt,
      });
    },
  });

  // Track form changes to prompt confirmation when leaving
  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [dispatch, formik.values, initialValues]);

  // Handler to clear form and enable fields
  const handleClear = () => {
    formik.resetForm();
    setIsFieldsDisabled(false);
  };

  // Handler to remove fee structure from list
  const handleDelete = (index: number) => {
    const updatedFeeHeadList = [...feeHeadListForFeeStructure];
    updatedFeeHeadList.splice(index, 1);
    setFeeHeadListForFeeStructure(updatedFeeHeadList);
  };

  // Handler to edit existing fee structure
  const handleEdit = (row: any) => {
    formik.setValues(row);
  };
  const handleSubmit = () => {};

  const receiptBookDialog = useBoolean();
  const feeHeadDialog = useBoolean();
  const paymentMethodDialog = useBoolean();
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <CustomBreadcrumbs
          heading="Fee Structure"
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Setting', href: '/finance/settings/create-fee-structure/' },
            { name: 'Fee Structure' },
          ]}
          description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => {
            onClose(null, false);
          }}
          action={
            <Button
              size="small"
              startIcon={<Iconify icon="si:add-duotone" />}
              type="submit"
              variant="contained"
            >
              Add
            </Button>
          }
        />
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <Scrollbar sx={{ height: 'calc(100vh - 260px)', p: 2 }}>
            <Grid container spacing={3} py="30px">
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.bookRecipt && Boolean(formik.errors.bookRecipt)}
                >
                  <CustomSelect
                    label="Receipt Book *"
                    options={[
                      { value: 'cbse', label: 'CBSE' },
                      { value: 'gseb', label: 'GSEB' },
                    ]}
                    autoFocus
                    value={formik.values.bookRecipt}
                    onChange={(e) => formik.setFieldValue('bookRecipt', e)}
                    disabled={isFieldsDisabled}
                    error={formik.touched.bookRecipt && Boolean(formik.errors.bookRecipt)}
                    helperText={formik.touched.bookRecipt ? formik.errors.bookRecipt : undefined}
                    // addOtherItemText="Add Receipt Book"
                    // addOtherItemOnClick={receiptBookDialog.onTrue}
                  />
                </ShakingTextField>
                {receiptBookDialog.value && (
                  <CustomDialog
                    title="Add Receipt Book"
                    open={receiptBookDialog.value}
                    handleClose={receiptBookDialog.onFalse}
                  >
                    <FinanceReceiptBookDialogForDropdown />
                  </CustomDialog>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.applicableGrade && Boolean(formik.errors.applicableGrade)}
                >
                  <CustomSelect
                    label="Class *"
                    options={[
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                    ]}
                    value={formik.values.applicableGrade}
                    onChange={(e) => formik.setFieldValue('applicableGrade', e)}
                    disabled={isFieldsDisabled}
                    error={formik.touched.applicableGrade && Boolean(formik.errors.applicableGrade)}
                    helperText={
                      formik.touched.applicableGrade ? formik.errors.applicableGrade : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}>
                  <CustomSelect
                    label="Fee Head *"
                    options={[
                      { value: 'tuitionFee', label: 'Tuition Fee' },
                      { value: 'sportsFee', label: 'Sports Fee' },
                      { value: 'transportFee', label: 'Transport Fee' },
                    ]}
                    value={formik.values.feeHead}
                    onChange={(e) => formik.setFieldValue('feeHead', e)}
                    error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
                    helperText={formik.touched.feeHead ? formik.errors.feeHead : undefined}
                    // addOtherItemText="Add Fee Head"
                    addOtherItemOnClick={feeHeadDialog.onTrue}
                  />
                </ShakingTextField>
                {feeHeadDialog.value && (
                  <CustomDialog
                    title="Add Fee Head"
                    open={feeHeadDialog.value}
                    handleClose={feeHeadDialog.onFalse}
                  >
                    <FeeHeadDialog />
                  </CustomDialog>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.grossFee && Boolean(formik.errors.grossFee)}
                >
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label="Gross Fee *"
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
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
                >
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
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.discountRemark && Boolean(formik.errors.discountRemark)}
                >
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
                </ShakingTextField>
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
                <ShakingTextField
                  error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                >
                  <CustomSelect
                    multiple
                    label="Payment Method *"
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'check', label: 'Check' },
                    ]}
                    disabled={isFieldsDisabled}
                    value={formik.values.paymentMethod}
                    onChange={(e) => formik.setFieldValue('paymentMethod', e)}
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                    // addOtherItemText="Add Payment Method"
                    addOtherItemOnClick={paymentMethodDialog.onTrue}
                    helperText={
                      (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                    }
                  />
                </ShakingTextField>
                {paymentMethodDialog.value && (
                  <CustomDialog
                    title="Add Payment Method"
                    open={paymentMethodDialog.value}
                    handleClose={paymentMethodDialog.onFalse}
                  >
                    <PaymentMethodDialog />
                  </CustomDialog>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={
                    formik.touched.lateFeeChargesType && Boolean(formik.errors.lateFeeChargesType)
                  }
                >
                  <CustomSelect
                    label="Late Fee Charges Type"
                    options={[
                      { value: 'perDay', label: 'Per Day' },

                      { value: 'none', label: 'None' },
                    ]}
                    value={formik.values.lateFeeChargesType}
                    onChange={(e) => formik.setFieldValue('lateFeeChargesType', e)}
                    error={
                      formik.touched.lateFeeChargesType && Boolean(formik.errors.lateFeeChargesType)
                    }
                    helperText={
                      formik.touched.lateFeeChargesType
                        ? formik.errors.lateFeeChargesType
                        : undefined
                    }
                  />{' '}
                </ShakingTextField>
              </Grid>

              {formik.values.lateFeeChargesType === 'perDay' && (
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={
                      formik.touched.lateFeeChargesAmount &&
                      Boolean(formik.errors.lateFeeChargesAmount)
                    }
                  >
                    <NumericFormatCustom
                      size="small"
                      fullWidth
                      label="Late Fee Charges Amount"
                      name="lateFeeChargesAmount"
                      value={formik.values.lateFeeChargesAmount}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.lateFeeChargesAmount &&
                        Boolean(formik.errors.lateFeeChargesAmount)
                      }
                      helperText={
                        formik.touched.lateFeeChargesAmount && formik.errors.lateFeeChargesAmount
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Fees Due Date *"
                  value={formik.values.paymentDueDate}
                  onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </Grid>

            {/* We can create multiple fee heads for a single fee structure. Previous entries are listed below in a table, similar to a to-do list, for easy tracking and management. */}
            <FinanceAddedFeeHeadForFeeStructure
              onDelete={handleDelete}
              onEdit={handleEdit}
              data={feeHeadListForFeeStructure}
            />
          </Scrollbar>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={data ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data ? 16 : 20}
                  height={data ? 16 : 20}
                />
              }
              type="submit"
              variant="contained"
              size="small"
            >
              {data ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Card>
      </form>
    </BackPopUpChecked>
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
