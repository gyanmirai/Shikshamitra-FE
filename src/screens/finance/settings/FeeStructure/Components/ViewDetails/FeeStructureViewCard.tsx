import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { NumericFormat } from 'react-number-format';
import { formatNumber } from 'src/utils/formate_number';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import { FeePaymentTypeOptions } from 'src/enums/fee-payment-type';
import { FeeOptionalTypeOptions } from 'src/enums/fee-optional-type';
import { Box, Chip, Paper, Stack, Divider, Typography } from '@mui/material';

import type { IClassWiseFeeData } from '../../type';

interface FeeStructureViewCardProps {
  className: string;
  feeStructure: IClassWiseFeeData;
}

const FeeStructureViewCard: React.FC<FeeStructureViewCardProps> = ({ className, feeStructure }) => {
  const feeHeads = feeStructure.feeHeads || [];

  if (!feeHeads || feeHeads.length === 0) {
    return <EmptyContent title="No Fee Structure Available" />;
  }

  const totalFeeAmount = feeHeads.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify icon="solar:bill-list-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {feeStructure.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fee heads assigned to this division
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={`Total: ${formatNumber(totalFeeAmount, 'INR')}`}
          color="success"
          size="small"
          variant="outlined"
        />
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box>
        <CustomizableTable
          tableId="fee-items-table"
          noDataText="No Fee Items Found"
          columns={[
            { id: 'categoryName', label: 'Category', align: 'left' },
            { id: 'feeHeadName', label: 'Name', align: 'left' },
            {
              id: 'amount',
              label: 'Amount',
              align: 'left',
              filterType: 'number',
              render: (value) => (
                <Typography variant="body2">
                  <NumericFormat value={value} displayType="text" thousandSeparator prefix="₹" />
                </Typography>
              ),
            },
            {
              id: 'isOneTime',
              label: 'Payment Type',
              align: 'left',
              filterType: 'enum',
              enumOptions: FeePaymentTypeOptions,
              render: (value) =>
                value ? (
                  <Label color="info" variant="soft">
                    One Time
                  </Label>
                ) : (
                  <Label color="default" variant="soft">
                    Recurring
                  </Label>
                ),
            },
            {
              id: 'isOptional',
              label: 'Status',
              align: 'left',
              filterType: 'enum',
              enumOptions: FeeOptionalTypeOptions,
              render: (value) =>
                !value ? (
                  <Label color="success" variant="soft">
                    Mandatory
                  </Label>
                ) : (
                  <Label color="warning" variant="soft">
                    Optional
                  </Label>
                ),
            },
          ]}
          data={feeHeads || []}
        />
      </Box>
    </Paper>
  );
};

export default FeeStructureViewCard;
