import { Scrollbar } from 'src/components/scrollbar';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, TextField, Typography, DialogActions } from '@mui/material';

import type { IAdditionalDiscount } from '../studen-fee-data-interface';

interface Props {
  dialogValue: boolean;
  onClose: () => void;
  studentData: IAdditionalDiscount;
}

const AdditionalDiscountDialog: React.FC<Props> = ({ dialogValue, onClose, studentData }) => {
  const [discountValues, setDiscountValues] = useState<{ [key: string]: string }>({});
  const [remarkValues, setRemarkValues] = useState<{ [key: string]: string }>({});
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [discountErrors, setDiscountErrors] = useState<{ [key: string]: boolean }>({});

  const { studentDetails, data: feeHeads } = studentData;

  useEffect(() => {
    const hasValidDiscount = Object.values(discountValues).some((val) => Number(val) > 0);
    const hasErrors = Object.values(discountErrors).some((error) => error);
    setIsSaveEnabled(hasValidDiscount && !hasErrors);
  }, [discountValues, discountErrors]);

  const handleDiscountChange = (feeHead: string, value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const entered = Number(sanitized);

    const feeRow = feeHeads.find((f) => f.feeHead === feeHead);
    if (!feeRow) return;

    setDiscountValues((prev) => ({
      ...prev,
      [feeHead]: sanitized,
    }));

    setDiscountErrors((prev) => ({
      ...prev,
      [feeHead]: entered > feeRow.payableFee,
    }));
  };

  const handleRemarkChange = (feeHead: string, value: string) => {
    setRemarkValues((prev) => ({
      ...prev,
      [feeHead]: capitalizeWords(value),
    }));
  };

  const totalDiscount = useMemo(
    () => Object.values(discountValues).reduce((acc, val) => acc + Number(val || 0), 0),
    [discountValues]
  );

  const totalRow = useMemo(
    () => ({
      feeHead: 'Total',
      grossFee: feeHeads.reduce((acc, f) => acc + f.grossFee, 0),
      generalDiscount: feeHeads.reduce((acc, f) => acc + f.generalDiscount, 0),
      payableFee: feeHeads.reduce((acc, f) => acc + f.payableFee, 0),
      additionalDiscount: totalDiscount,
    }),
    [feeHeads, totalDiscount]
  );

  const handleSubmit = () => {
    // const updatedData = feeHeads.map((f) => ({
    //   ...f,
    //   additionalDiscount: Number(discountValues[f.feeHead] || 0),
    //   remark: remarkValues[f.feeHead] || '',
    // }));
    // Trigger your onSave / API function here
  };

  return (
    <CustomDialog
      open={dialogValue}
      handleClose={onClose}
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5">Additional Discount</Typography>
          <CustomTooltip title="Set student-specific additional discount per fee head.">
            <Iconify icon="lucide:info" color="info.main" />
          </CustomTooltip>
        </Box>
      }
      maxWidth="xl"
    >
      <Scrollbar sx={{ maxHeight: 500, p: 2 }}>
        <Box display="flex" gap={3} flexWrap="wrap" py={1}>
          <Typography>
            <strong>Name:</strong> {studentDetails.name}
          </Typography>
          <Typography>
            <strong>Standard:</strong> {studentDetails.standard}-{studentDetails.division}
          </Typography>
          <Typography>
            <strong>GR Number:</strong> {studentDetails.grNumber}
          </Typography>
          <Typography>
            <strong>Roll Number:</strong> {studentDetails.rollNumber}
          </Typography>
        </Box>

        <CustomizableTable
          tableId="additional-discount-table"
          isFilter={false}
          isPagination={false}
          isSearch={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head', isFilter: false },
            {
              id: 'grossFee',
              label: 'Gross Fee',
              align: 'right',
              isFilter: false,
              render: (val: number) => (
                <Typography sx={{ fontSize: '12px' }}>{formatNumber(val, 'INR')}</Typography>
              ),
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              align: 'right',
              isFilter: false,
              render: (val: number) => (
                <Typography sx={{ fontSize: '12px' }}>{formatNumber(val, 'INR')}</Typography>
              ),
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              align: 'right',
              isFilter: false,
              render: (val: number) => (
                <Typography sx={{ fontSize: '12px' }}>{formatNumber(val, 'INR')}</Typography>
              ),
            },
            {
              id: 'additionalDiscount',
              label: 'Additional Discount',
              align: 'right',
              isFilter: false,

              render: (_: any, row: any) => {
                const isTotalRow = row.feeHead === 'Total';

                if (isTotalRow) {
                  return (
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatNumber(row.additionalDiscount, 'INR')}
                    </Typography>
                  );
                }

                const feeHeadKey = row.feeHead;
                const rawValue = discountValues[feeHeadKey] || '';
                const exceeds = discountErrors[feeHeadKey];

                return (
                  <NumericFormatCustom
                    size="small"
                    label={`${feeHeadKey} Discount`}
                    value={rawValue}
                    onChange={(e) => handleDiscountChange(feeHeadKey, e.target.value)}
                    error={exceeds}
                    helperText={
                      exceeds ? `Discount should not exceed ₹ ${formatNumber(row.payableFee)}` : ''
                    }
                    fullWidth
                    onBlur={() => {
                      if (exceeds) {
                        handleDiscountChange(feeHeadKey, row.payableFee.toString());
                      }
                    }}
                    sx={{ mb: 2 }}
                  />
                );
              },
            },
            {
              id: 'remark',
              label: 'Remark',
              isFilter: false,
              render: (_: any, row: any) => {
                const isTotalRow = row.feeHead === 'Total';

                if (isTotalRow) {
                  return null;
                }

                return (
                  <TextField
                    size="small"
                    label="Remark"
                    fullWidth
                    value={remarkValues[row.feeHead] || ''}
                    onChange={(e) => handleRemarkChange(row.feeHead, e.target.value)}
                  />
                );
              },
            },
          ]}
          data={[...feeHeads, totalRow]}
        />
      </Scrollbar>
      <DialogActions>
        <SubmitButton onClick={handleSubmit} disabled={!isSaveEnabled} />
      </DialogActions>
    </CustomDialog>
  );
};

export default AdditionalDiscountDialog;
