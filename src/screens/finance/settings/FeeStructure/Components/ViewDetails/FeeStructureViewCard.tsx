import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { NumericFormat } from 'react-number-format';
import { formatNumber } from 'src/utils/formate_number';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import { FeePaymentTypeOptions } from 'src/enums/fee-payment-type';
import { FeeOptionalTypeOptions } from 'src/enums/fee-optional-type';
import {
  Box,
  Chip,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { IClassWiseFeeData } from '../../type';

interface FeeStructureViewCardProps {
  className: string;
  feeStructure: IClassWiseFeeData;
}

const FeeStructureViewCard: React.FC<FeeStructureViewCardProps> = ({ className, feeStructure }) => {
  const [expanded, setExpanded] = React.useState(false);
  const feeHeads = feeStructure.feeHeads || [];

  const totalFeeAmount = feeHeads.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        borderRadius: 1.5,
        transition: 'box-shadow 0.2s ease',
        boxShadow: 'var(--shadows-4)',
        overflow: 'hidden',
        mb: 2,
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
        },
      }}
    >
      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />} sx={{ m: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify
              icon="solar:bill-list-bold-duotone"
              width={18}
              sx={{ color: 'primary.main' }}
            />
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
            sx={{ mr: 1 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        <Box>
          {feeHeads.length === 0 ? (
            <EmptyContent title="No Fee Heads Available" mt={4} />
          ) : (
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
                      <NumericFormat
                        value={value}
                        displayType="text"
                        thousandSeparator
                        prefix="₹"
                      />
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
                {
                  id: 'payableMonth',
                  label: 'Payble Month',
                  align: 'left',
                  filterType: 'string',
                  render: (value, row) => (
                    <Typography variant="caption" fontSize="13px">
                      {`${FeeMonth[row.payableMonth] || '-'} - ${row.payableYear || '-'}`}
                    </Typography>
                  ),
                },
              ]}
              data={feeHeads || []}
            />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default FeeStructureViewCard;
