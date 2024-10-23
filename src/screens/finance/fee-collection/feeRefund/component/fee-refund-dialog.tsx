import React from 'react';
import { useFormik } from 'formik';

import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CommonTable from 'src/components/commonTable';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FeeRefundDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
  total: any;
}
interface FormikValue {
  totalAmount: number;
  paymentMode: string;
  transectionIdOrCheque: string;
  bankName: string;
  remarks: string;
  id: number;
}
const columnsTable = [
  { key: 'feeHead', label: 'Fee Head' },
  { key: 'refundAmount', label: 'Refund Amount' },
];
const FeeRefundDialog: React.FC<FeeRefundDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
  total,
}) => {
  console.log('selectedEntry', data);
  console.log('alldata', allData);

  const datax: any[] = [];

  allData.forEach((val: any) => {
    const refundData = {
      feeHead: val.feeHead,
      refundAmount: val.refundAmount,
    };
    datax.push(refundData);
  });

  const formik = useFormik<FormikValue>({
    initialValues: {
      totalAmount: total,
      paymentMode: '',
      transectionIdOrCheque: '',
      bankName: '',
      remarks: '',

      id: isEdit
        ? data.id ?? Math.floor(Math.random() * 1000000000)
        : Math.floor(Math.random() * 1000000000),
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      // const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      console.log('Form Submitted type', values);
    },
  });
  return (
    <CustomDialog title="Refund" open={dialogValue} handleClose={onClose}>
      {/* <Box px="20px">
                {showExistingEntryMessage ? (
                    <Typography component="span" fontSize="14" color="red">
                        This Income Source is Already Exist
                    </Typography>
                ) : (
                    <Box height="25px" />
                )}
            </Box> */}
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <TextField
                  name="amount"
                  label="Amount"
                  value={formik.values.totalAmount}
                  onChange={formik.handleChange}
                  size="small"
                  disabled
                />

                <CustomSelect
                  label="Payment Mode"
                  options={[]}
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { minWidth: 190 } }}
                />
              </Box>

              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <TextField
                  name="transectionId"
                  label="Transection Id/Cheque No"
                  value={formik.values.transectionIdOrCheque}
                  onChange={formik.handleChange}
                  size="small"
                />

                <TextField
                  name="bankName"
                  label="Bank Name"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Box>
              <TextField
                multiline
                rows={4}
                name="remarks"
                label="Remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                size="small"
              />
            </Box>
            <DialogActions>
              {/* <Button onClick={onClose} variant="contained" size="small">
                               Cancel
                            </Button> */}
              <Button onClick={onClose} variant="contained" size="small">
                Generate Receipt
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>

        <CommonTable isPagination={false} columns={columnsTable} data={datax} />
        <Box pb="25px" />
      </Scrollbar>
    </CustomDialog>
  );
};

export default FeeRefundDialog;
