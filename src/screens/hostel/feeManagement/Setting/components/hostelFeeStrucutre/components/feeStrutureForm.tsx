import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

// import HostelFeeHead from '../../hostelFeeHead/hostelFeeHead';
import HostelPaymentMethodDialog from './hostelPaymentMethod';
import { hostelFeeStrctureValidationSchema } from './validationSchema';

import type {
  // IFeeStructure,
  IHostelFormikValue,
  IHostelFinanceAddFeeCategorySettingDialogProps,
} from '../hostelFeeInterface';

const HostelFeeCategorySettingDialog: React.FC<IHostelFinanceAddFeeCategorySettingDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store the list of fee structures
  // const [feeHeadListForFeeStructure, setFeeHeadListForFeeStructure] = useState<IFeeStructure[]>([]);
  // State to control whether receipt book & grade fields should be disabled
  const [isFieldsDisabled] = useState(false);

  // Initial form values with default/empty values
  const initialValues = useMemo<IHostelFormikValue>(
    () => ({
      id: Math.floor(Math.random() * 10000),
      roomType: '',
      hostelFeeHead: '',
      grossFee: '',
      discountAmount: '',
      discountRemark: '',
      payableFee: '',
      paymentMethod: [],
      chargesType: '',
      lateFeeChargesType: '',
      lateFeeChargesAmount: '',
    }),
    []
  );

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik<IHostelFormikValue>({
    initialValues,
    validationSchema: hostelFeeStrctureValidationSchema,
    onSubmit: (values) => {
      // Check if the fee head combination already exists
    },
  });

  // Track form changes to prompt confirmation when leaving
  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [dispatch, formik.values, initialValues]);

  // Handler for dialog close with unsaved changes check
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  // Handler to remove fee structure from list
  // const handleDelete = (index: number) => {
  //   const updatedFeeHeadList = [...feeHeadListForFeeStructure];
  //   updatedFeeHeadList.splice(index, 1);
  //   setFeeHeadListForFeeStructure(updatedFeeHeadList);
  // };

  const handleSubmit = () => {};

  const feeHeadDialog = useBoolean();
  const paymentMethodDialog = useBoolean();
  return (
    <Box p={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ height: '450px' }}>
          <Grid container spacing={3} py="30px">
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={formik.touched.roomType && Boolean(formik.errors.roomType)}>
                <CustomSelect
                  label="Room Type *"
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                  ]}
                  value={formik.values.roomType}
                  onChange={(e) => formik.setFieldValue('roomType', e)}
                  disabled={isFieldsDisabled}
                  error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                  helperText={formik.touched.roomType ? formik.errors.roomType : undefined}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={formik.touched.hostelFeeHead && Boolean(formik.errors.hostelFeeHead)}
              >
                <CustomSelect
                  label="Fee Type *"
                  options={[
                    { value: 'tuitionFee', label: 'Tuition Fee' },
                    { value: 'sportsFee', label: 'Sports Fee' },
                    { value: 'transportFee', label: 'Transport Fee' },
                  ]}
                  value={formik.values.hostelFeeHead}
                  onChange={(e) => formik.setFieldValue('hostelFeeHead', e)}
                  error={formik.touched.hostelFeeHead && Boolean(formik.errors.hostelFeeHead)}
                  helperText={
                    formik.touched.hostelFeeHead ? formik.errors.hostelFeeHead : undefined
                  }
                  addOtherItemText="Add Fee Type"
                  addOtherItemOnClick={feeHeadDialog.onTrue}
                />
              </ShakingTextField>
              {feeHeadDialog.value && (
                <CustomDialog
                  title="Add Fee Head"
                  open={feeHeadDialog.value}
                  handleClose={feeHeadDialog.onFalse}
                  maxWidth="md"
                >
                  <Scrollbar sx={{ height: '300px' }}>
                    fgh
                    {/* <HostelFeeHead /> */}
                  </Scrollbar>
                </CustomDialog>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={formik.touched.grossFee && Boolean(formik.errors.grossFee)}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Gross Fee *"
                  name="grossFee"
                  value={formik.values.grossFee}
                  onChange={(e) => {
                    const grossFees = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                    const discountAmount = +(
                      formik.values.discountAmount?.match(/\d/g)?.join('') ?? '0'
                    );
                    formik.setFieldValue('payableFee', Math.max(grossFees - discountAmount, 0));
                    formik.handleChange(e);
                  }}
                  error={formik.touched.grossFee && Boolean(formik.errors.grossFee)}
                  helperText={formik.touched.grossFee && formik.errors.grossFee}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
              >
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Discount Amount *"
                  name="discountAmount"
                  value={formik.values.discountAmount}
                  onChange={(e) => {
                    const discountAmount = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                    const grossFees = +(formik.values.grossFee?.match(/\d/g)?.join('') ?? '0');
                    formik.setFieldValue('payableFee', Math.max(grossFees - discountAmount, 0));
                    formik.handleChange(e);
                  }}
                  error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
                  helperText={formik.touched.discountAmount && formik.errors.discountAmount}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={formik.touched.discountRemark && Boolean(formik.errors.discountRemark)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Discount Remark *"
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

            <Grid size={{ xs: 12, md: 6 }}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Payable Fee *"
                name="payableFee"
                value={formik.values.payableFee}
                disabled
                error={formik.touched.payableFee && Boolean(formik.errors.payableFee)}
                helperText={formik.touched.payableFee && formik.errors.payableFee}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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
                  value={formik.values.paymentMethod}
                  onChange={(e) => formik.setFieldValue('paymentMethod', e)}
                  error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                  addOtherItemText="Add Payment Method"
                  addOtherItemOnClick={paymentMethodDialog.onTrue}
                />
              </ShakingTextField>
              {paymentMethodDialog.value && (
                <CustomDialog
                  title="Add Payment Method"
                  open={paymentMethodDialog.value}
                  handleClose={paymentMethodDialog.onFalse}
                >
                  <HostelPaymentMethodDialog />
                </CustomDialog>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.lateFeeChargesType && Boolean(formik.errors.lateFeeChargesType)
                }
              >
                <CustomSelect
                  label="Late Fee Charges Type *"
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
                    formik.touched.lateFeeChargesType ? formik.errors.lateFeeChargesType : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            {formik.values.lateFeeChargesType === 'perDay' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={
                    formik.touched.lateFeeChargesAmount &&
                    Boolean(formik.errors.lateFeeChargesAmount)
                  }
                >
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label="Late Fee Charges Amount *"
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
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
            size="small"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default HostelFeeCategorySettingDialog;
