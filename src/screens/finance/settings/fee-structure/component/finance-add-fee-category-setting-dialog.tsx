import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

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
  feeName: string;
  totalAmount: string;
  applicableGrade: string;
  paymentDueDate: any;
  paymentMethod: string[];
  multipleApplicableGrade: string[];
  feeType: string[];
  feeHead: string;
  amount: string;
  bookRecipt: string;
  availableFeeHead?: string;
  feeAmountForAvailbleHead?: string;
  discountCategory: string[];
  discountAmount: number,
  finalFee: number,

}
const validationSchema = Yup.object({
  amount: Yup.string().required("Fee Amount can't be empty"),
  bookRecipt: Yup.string().required("Receipt Book can't be empty"),
  applicableGrade: Yup.string().required('Applicable Grade is required'),
  feeHead: Yup.string().required('Fee Category is required'),
  paymentMethod: Yup.string().required('Payment Method is required'),
  paymentDueDate: Yup.date().required('Payment Due Date is required').nullable(),
});
const feeHeadList = [
  { value: 'tuitionFee', label: 'Tuition Fee' },
  { value: 'sportsFee', label: 'Sports Fee' },
  { value: 'transportFee', label: 'Transport Fee' },
];

const bookReciptList = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'gseb', label: 'GSEB' },
];

const discountCategoryList = [
  { value: 'summerPromotion', label: 'Summner Campaign' },
];

const FinanceAddFeeCategorySettingDialog: React.FC<FinanceAddFeeCategorySettingDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  // Using useFormik to manage form state
  const [totalAmount, setTotalAmount] = useState(0);
  const [availableFeeHeadList, setAvailableFeeHeadList] = useState([]);
  const [availableFeeSubCategoryList, setavailableFeeSubCategoryList] = useState([]);
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const [showWhatAreChanging, setShowWhatAreChanging] = useState(false);
  const [feeAmountState, setFeeAmountState] = useState('');
  const [fixedReductionAmountState, setfixedReductionAmountState] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const handleFeeDiscountAmountChange = (formattedValue: string, numericValue: number) => {
    setDiscountAmount(formattedValue);

  };
  const handleFeeAmountChange = (formattedValue: string, numericValue: number) => {
    setFeeAmountState(formattedValue);

  };

  const handlefixedReductionAmountChange = (formattedValue: string, numericValue: number) => {
    setfixedReductionAmountState(formattedValue);

  };

  useEffect(() => {
    if (isEdit) {
      const updatedFeeHeadList = data.feeSubCategoryList.map((val: any) => ({
        value: val.value,
        label: val.name,
      }));

      const updatedFeeSubCategoryList = data.feeSubCategoryList.map((val: any) => ({
        value: val.value,
        label: val.name,
        amount: val.amount,
      }));

      setavailableFeeSubCategoryList(updatedFeeSubCategoryList);

      setAvailableFeeHeadList(updatedFeeHeadList);
    }
  }, [data.feeSubCategoryList, isEdit]);

  const formik = useFormik<FormikValue>({
    initialValues: {
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      feeName: isEdit ? (data.feeCategoryName ?? '') : '',
      totalAmount: isEdit ? data.amount : totalAmount,
      applicableGrade: isEdit ? (data.applicableGrade ?? '') : '',
      paymentDueDate:
        isEdit && data.paymentDueDate ? dayjs(data.paymentDueDate, 'DD-MM-YYYY') : null,
      paymentMethod: [],
      multipleApplicableGrade: [],
      feeType: [],
      feeHead: '',
      amount: isEdit ? data.amount : '0',
      bookRecipt: isEdit ? data.bookRecipt.toLowerCase() : '',
      availableFeeHead: data.feeSubCategoryList,
      feeAmountForAvailbleHead: '0',
      discountAmount: isEdit ? (100) : 0,
      discountCategory: [],
      finalFee: 0,

    },
    validationSchema,
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      let existingEntryIndex;

      if (isBulkEdit) {
        existingEntryIndex = allData.findIndex(
          (val: any) =>
            normalize(val.bookRecipt) === normalize(formik.values.bookRecipt) &&
            formik.values.multipleApplicableGrade.some(
              (grade: string) => normalize(grade) === normalize(val.applicableGrade)
            )
        );
      } else {
        existingEntryIndex = allData.findIndex(
          (val: any) =>
            normalize(val.bookRecipt) === normalize(formik.values.bookRecipt) &&
            normalize(val.applicableGrade) === normalize(formik.values.applicableGrade)
        );
      }

      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
        // const existingIndex = availableFeeSubCategoryList.findIndex((val: any) => val.value === formik.values.feeHead);

        // const updatedDataFor: any = availableFeeSubCategoryList[existingIndex];

        // console.log(`you are going to changed  ${updatedDataFor.label} from ${updatedDataFor.amount} to ${formik.values.feeAmountForAvailbleHead}`)

        // if (existingIndex !== -1) {
        //     setShowWhatAreChanging(true)
        // }
        // // onSave(values)
        // const isConfirmed = window.confirm(
        //     `You are about to change ${updatedDataFor.label} from ${updatedDataFor.amount} to ${formik.values.feeAmountForAvailbleHead}. Are you sure you want to save?`
        // );

        // if (isConfirmed) {
        //     onSave(values); // Proceed with save if confirmed
        // } else {
        //     console.log("Save action cancelled.");
        // }
      }
    },
  });

  const [isBulkEdit, setIsBulkEdit] = useState(false);

  const calculateTotal = () =>
    formik.values.feeType.reduce((total, feeType) => {
      // @ts-ignore
      const amount = parseFloat(formik.values[feeType]) || 0;
      return total + amount;
    }, 0);

  return (
    <CustomDialog maxWidth="md" title="Add/Edit Fee Structure" open={dialogValue} handleClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  disabled={isEdit}
                  checked={isBulkEdit}
                  onChange={() => setIsBulkEdit(!isBulkEdit)}
                />
              }
              label="Switch to Bulk Update"
            />

            <Box py="13px" display="flex" flexDirection="row" gap={4}>
              <CustomSelect
                label="Book Receipt"
                options={bookReciptList}
                value={formik.values.bookRecipt}
                onChange={(e) => formik.setFieldValue('bookRecipt', e)}
                formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                error={formik.touched.bookRecipt && Boolean(formik.errors.bookRecipt)}
                // helperText={formik.touched.bookRecipt && formik.errors.bookRecipt}
                disabled={isEdit}
              />

              {isBulkEdit ? (
                <CustomSelect
                  multiple
                  label="Applicable Grade"
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                  ]}
                  value={formik.values.multipleApplicableGrade}
                  onChange={(selectedValues) =>
                    formik.setFieldValue('multipleApplicableGrade', selectedValues as string[])
                  }
                  formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                  disabled={isEdit}
                  error={
                    formik.touched.multipleApplicableGrade &&
                    Boolean(formik.errors.multipleApplicableGrade)
                  }
                  // helperText={
                  //   formik.touched.multipleApplicableGrade &&
                  //   formik.errors.multipleApplicableGrade
                  // }
                />
              ) : (
                <CustomSelect
                  label="Applicable Grade"
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                  ]}
                  value={formik.values.applicableGrade}
                  onChange={(e) => formik.setFieldValue('applicableGrade', e)}
                  formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                  disabled={isEdit}
                  error={formik.touched.applicableGrade && Boolean(formik.errors.applicableGrade)}
                  // helperText={formik.touched.applicableGrade && formik.errors.applicableGrade}
                />
              )}
            </Box>

            <Box py="13px" display="flex" flexDirection="row" gap={4}>
              <CustomSelect
                label="Fee Type"
                options={isEdit ? availableFeeHeadList : feeHeadList}
                value={formik.values.feeHead}
                onChange={(selectedValues) => {
                  formik.setFieldValue('feeHead', selectedValues);
                  if (isEdit) {
                    const selectedFeeHead: any = availableFeeSubCategoryList.find(
                      (item: any) => item.value === selectedValues
                    );
                    if (selectedFeeHead) {
                      formik.setFieldValue('feeAmountForAvailbleHead', selectedFeeHead.amount || 0);
                    }
                  }
                }}
                formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
                // helperText={formik.touched.feeHead && formik.errors.feeHead}
              />

              {isEdit ? (
                <TextField
                  name="feeAmountForAvailbleHead"
                  label="Fee Amount"
                  value={formik.values.feeAmountForAvailbleHead}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  sx={{ flex: 1 }}
                  error={
                    formik.touched.feeAmountForAvailbleHead &&
                    Boolean(formik.errors.feeAmountForAvailbleHead)
                  }
                  helperText={
                    formik.touched.feeAmountForAvailbleHead &&
                    formik.errors.feeAmountForAvailbleHead
                  }
                />
              ) : (
                <FormattedAmountInput
                  label="Fee Amount"
                  value={feeAmountState}
                  onChange={handleFeeAmountChange}
                  sx={{ flex: 1 }}
                />
              )}
            </Box>

            <Box py="13px" display="flex" flexDirection="row" gap={4}>
              <CustomSelect
                label="Discount Category"
                options={availableFeeHeadList}
                value={formik.values.feeHead}
                onChange={(selectedValues) => {
                  formik.setFieldValue('feeHead', selectedValues);
                  const selectedFeeHead: any = availableFeeSubCategoryList.find(
                    (item: any) => item.value === selectedValues
                  );
                  if (selectedFeeHead) {
                    formik.setFieldValue('feeAmountForAvailbleHead', selectedFeeHead.amount || 0);
                  }
                }}
                formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
                // helperText={formik.touched.feeHead && formik.errors.feeHead}
              />

              <FormattedAmountInput
                label="Discount Amount"
                value={discountAmount}
                onChange={handleFeeDiscountAmountChange}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box py="13px" display="flex" flexDirection="row" gap={4}>
              <TextField
                name="finalAmount"
                label="Final Amount"
                value={formik.values.finalFee}
                size="small"
                fullWidth
                sx={{ flex: 1 }}
                disabled
              />
              <CustomSelect
                multiple
                label="Payment Method"
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'check', label: 'Check' },
                ]}
                value={formik.values.paymentMethod}
                onChange={(e) => formik.setFieldValue('paymentMethod', e)}
                formControlProps={{ sx: { minWidth: 195, flex: 1 } }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                // helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
              />
            </Box>

            <Box py="13px" display="flex" flexDirection="row" gap={4}>
              <DatePicker
                minDate={dayjs()}
                label="Total Fees Due Date"
                value={formik.values.paymentDueDate}
                onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ flex: 1 }}
              />
              <FormattedAmountInput
                label="Fixed Reduction"
                value={fixedReductionAmountState}
                onChange={handlefixedReductionAmountChange}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box>
              {showExistingEntryMessage && (
                <Typography component="span" fontSize="13px" color="red">
                  This Fee Structure Already Exists
                </Typography>
              )}
            </Box>
          </Box>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>

    // <CustomDialog maxWidth="md" title="Add/Edit Fee Structure" open={dialogValue} handleClose={onClose}>
    //   <form onSubmit={formik.handleSubmit}>
    //     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
    //       <Box>
    //         <FormControlLabel
    //           control={
    //             <Switch
    //               disabled={isEdit}
    //               value={isBulkEdit}
    //               onChange={(value) => {
    //                 setIsBulkEdit(!isBulkEdit);
    //               }}
    //             />
    //           }
    //           label="Switch to Bulk Update"
    //         />

    //         <Box py="13px" display="flex" flexDirection="row" gap={4}>
    //           <CustomSelect
    //             label="Book Recipt"
    //             options={bookReciptList}
    //             value={formik.values.bookRecipt}
    //             onChange={(e) => formik.setFieldValue('bookRecipt', e)}
    //             formControlProps={{ sx: { minWidth: 195 } }}
    //             error={formik.touched.bookRecipt && Boolean(formik.errors.bookRecipt)}
    //             // @ts-ignore
    //             helperText={formik.touched.bookRecipt && formik.errors.bookRecipt}
    //             disabled={isEdit}
    //           />

    //           {isBulkEdit && (
    //             <CustomSelect
    //               multiple
    //               label="Applicable Grade"
    //               options={[
    //                 { value: '1', label: '1' },
    //                 { value: '2', label: '2' },
    //                 { value: '3', label: '3' },
    //               ]}
    //               // @ts-ignore
    //               value={formik.values.multipleApplicableGrade}
    //               onChange={(selectedValues) =>
    //                 formik.setFieldValue('multipleApplicableGrade', selectedValues as string[])
    //               }
    //               formControlProps={{ sx: { minWidth: 195 } }}
    //               disabled={isEdit}
    //               error={
    //                 formik.touched.multipleApplicableGrade &&
    //                 Boolean(formik.errors.multipleApplicableGrade)
    //               }
    //               // @ts-ignore
    //               helperText={
    //                 formik.touched.multipleApplicableGrade && formik.errors.multipleApplicableGrade
    //               }
    //             />
    //           )}

    //           {!isBulkEdit && (
    //             <CustomSelect
    //               label="Applicable Grade"
    //               options={[
    //                 { value: '1', label: '1' },
    //                 { value: '2', label: '2' },
    //                 { value: '3', label: '3' },
    //               ]}
    //               value={formik.values.applicableGrade}
    //               onChange={(e) => formik.setFieldValue('applicableGrade', e)}
    //               formControlProps={{ sx: { minWidth: 195 } }}
    //               disabled={isEdit}
    //               error={formik.touched.applicableGrade && Boolean(formik.errors.applicableGrade)}
    //               // @ts-ignore
    //               helperText={formik.touched.applicableGrade && formik.errors.applicableGrade}
    //             />
    //           )}
    //         </Box>
    //         <Box py="13px" display="flex" flexDirection="row" gap={4}>
    //           {!isEdit && (
    //             <CustomSelect
    //               label="Fee Type"
    //               options={feeHeadList}
    //               // @ts-ignore
    //               value={formik.values.feeHead}
    //               onChange={(selectedValues) => formik.setFieldValue('feeHead', selectedValues)}
    //               formControlProps={{ sx: { minWidth: 195 } }}
    //               error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
    //               // @ts-ignore
    //               helperText={formik.touched.feeHead && formik.errors.feeHead}
    //             />
    //           )}

    //           {isEdit && (
    //             <CustomSelect
    //               label="Fee Type"
    //               options={availableFeeHeadList}
    //               // @ts-ignore
    //               value={formik.values.feeHead}
    //               onChange={(selectedValues) => {
    //                 formik.setFieldValue('feeHead', selectedValues);
    //                 const selectedFeeHead: any = availableFeeSubCategoryList.find(
    //                   (item: any) => item.value === selectedValues
    //                 );

    //                 if (selectedFeeHead) {
    //                   formik.setFieldValue('feeAmountForAvailbleHead', selectedFeeHead.amount || 0);
    //                 }
    //               }}
    //               formControlProps={{ sx: { minWidth: 195 } }}
    //               error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
    //               // @ts-ignore
    //               helperText={formik.touched.feeHead && formik.errors.feeHead}
    //             />
    //           )}
    //           {isEdit && (
    //             <Box width="195px">
    //               <TextField
    //                 name="feeAmountForAvailbleHead"
    //                 label="Fee Amount"
    //                 value={formik.values.feeAmountForAvailbleHead}
    //                 onChange={formik.handleChange}
    //                 size="small"
    //                 fullWidth
    //                 sx={{ width: '100%' }}
    //                 error={
    //                   formik.touched.feeAmountForAvailbleHead &&
    //                   Boolean(formik.errors.feeAmountForAvailbleHead)
    //                 }
    //                 // @ts-ignore
    //                 helperText={
    //                   formik.touched.feeAmountForAvailbleHead &&
    //                   formik.errors.feeAmountForAvailbleHead
    //                 }

    //               // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
    //               // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
    //               />
    //             </Box>
    //           )}
    //           {!isEdit && (
    //             <Box width="200px">

    //               <FormattedAmountInput
    //                 label="Fee Amount"
    //                 value={feeAmountState}
    //                 onChange={handleFeeAmountChange}
    //               />
    //               {/* <TextField
    //                 name="amount"
    //                 label="Fee Amount"
    //                 value={formatNumber(formik.values.amount)}
    //                 onChange={formik.handleChange}
    //                 fullWidth
    //                 sx={{ width: '100%' }}
    //                 size="small"
    //                 error={formik.touched.amount && Boolean(formik.errors.amount)}
    //                 // @ts-ignore
    //                 helperText={formik.touched.amount && formik.errors.amount}

    //                 // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
    //                 // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
    //               /> */}
    //             </Box>
    //           )}
    //         </Box>

    //         <Box py="13px" display="flex" flexDirection="row" gap={4}>
    //           <CustomSelect
    //             label="Discount Category"
    //             options={availableFeeHeadList}
    //             // @ts-ignore
    //             value={formik.values.feeHead}
    //             onChange={(selectedValues) => {
    //               formik.setFieldValue('feeHead', selectedValues);
    //               const selectedFeeHead: any = availableFeeSubCategoryList.find(
    //                 (item: any) => item.value === selectedValues
    //               );

    //               if (selectedFeeHead) {
    //                 formik.setFieldValue('feeAmountForAvailbleHead', selectedFeeHead.amount || 0);
    //               }
    //             }}
    //             formControlProps={{ sx: { minWidth: 195 } }}
    //             error={formik.touched.feeHead && Boolean(formik.errors.feeHead)}
    //             // @ts-ignore
    //             helperText={formik.touched.feeHead && formik.errors.feeHead}
    //           />

    //           <FormattedAmountInput
    //             label="Discount Amount"
    //             value={discountAmount}
    //             onChange={handleFeeDiscountAmountChange}
    //           />
    //         </Box>
    //         <Box py="13px" display="flex" flexDirection="row" gap={4}>
    //           <TextField
    //             name="finalAmount"
    //             label="Final Amount"
    //             value={formik.values.finalFee}
    //             onChange={() => { }}
    //             size="small"
    //             fullWidth
    //             sx={{ width: '100%' }}
    //             disabled
    //           // error={
    //           //   formik.touched.feeAmountForAvailbleHead &&
    //           //   Boolean(formik.errors.feeAmountForAvailbleHead)
    //           // }
    //           // // @ts-ignore
    //           // helperText={
    //           //   formik.touched.feeAmountForAvailbleHead &&
    //           //   formik.errors.feeAmountForAvailbleHead
    //           // }

    //           />
    //           <CustomSelect
    //             multiple
    //             label="Payment Method"
    //             options={[
    //               { value: 'cash', label: 'Cash' },
    //               { value: 'check', label: 'Check' },
    //             ]}
    //             value={formik.values.paymentMethod}
    //             onChange={(e) => formik.setFieldValue('paymentMethod', e)}
    //             formControlProps={{ sx: { minWidth: 195 } }}
    //             error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
    //             // @ts-ignore
    //             helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
    //           />


    //         </Box>
    //         <Box py="13px" display="flex" flexDirection="row" gap={4}>
    //           <DatePicker
    //             minDate={dayjs()}
    //             label="Payment Due Date"
    //             // @ts-ignore
    //             value={formik.values.paymentDueDate}
    //             onChange={(newValue) => formik.setFieldValue('paymentDueDate', newValue)}
    //             format="DD-MM-YYYY"
    //             slotProps={{ textField: { size: 'small' } }}
    //             sx={{ flex: 1 }}
    //           />
    //           <FormattedAmountInput
    //             label="Fixed Reduction"
    //             value={fixedReductionAmountState}
    //             onChange={handlefixedReductionAmountChange}
    //             sx={{ flex: 1 }}
    //           />
    //         </Box>


    //         {/* <Box pt="10px" display="flex" flexDirection="column" gap={3}>


    //                         {formik.values.feeType.map((selectedFeeType: string) => {
    //                             const selectedOption = {
    //                                 tuitionfee: 'Tuition Fee Amount',
    //                                 sportsfee: 'Sports Fee Amount',
    //                                 transportfee: 'Transport Fee Amount',
    //                             }[selectedFeeType];



    //                             return (
    //                                 <TextField
    //                                     key={selectedFeeType}
    //                                     disabled={isEdit}
    //                                     name={selectedFeeType}
    //                                     label={selectedOption}
    //                                     // @ts-ignore
    //                                     value={formik.values[selectedFeeType] || ''}
    //                                     onChange={(event) => {
    //                                         const { value } = event.target;
    //                                         formik.setFieldValue(selectedFeeType, value);
    //                                     }}
    //                                     size="small"
    //                                     InputProps={{
    //                                         readOnly: isEdit,
    //                                     }}
    //                                 />
    //                             );
    //                         })} */}
    //         {/* <TextField
    //                             name="totalAmount"
    //                             label="Total Amount"
    //                             value={calculateTotal()}
    //                             onChange={formik.handleChange}
    //                             size="small"
    //                             disabled

    //                         // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
    //                         // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
    //                         /> */}

    //         {/* </Box> */}
    //         <Box>
    //           {showExistingEntryMessage ? (
    //             <Typography component="span" fontSize="13px" color="red">
    //               This Fee Structure is Already Exists
    //             </Typography>
    //           ) : (
    //             <Box height="13px" />
    //           )}
    //         </Box>


    //       </Box>
    //     </Scrollbar>
    //     <DialogActions>
    //       {/* <Button onClick={onClose} variant="contained" size="small">
    //             Cancel
    //           </Button> */}
    //       <Button type="submit" variant="contained" size="small">
    //         Save
    //       </Button>
    //     </DialogActions>
    //   </form>
    // </CustomDialog>
  );
};

export default FinanceAddFeeCategorySettingDialog;
