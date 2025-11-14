import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import { formatNumber } from 'src/utils/formate_number';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { IFeeStructure, IClassWiseFeeData } from '../../type';

interface FeeStructureViewCardProps {
  className: string;
  feeStructure: IClassWiseFeeData;
  index: number;
  expanded: boolean; // ✅ new prop
  onChange: () => void; // ✅ new prop
  feeStructureMain: IFeeStructure;
}

const FeeStructureViewCard: React.FC<FeeStructureViewCardProps> = ({
  className,
  feeStructure,
  index,
  expanded,
  onChange,
  feeStructureMain,
}) => {
  const [feeItems, setFeeItems] = useState(feeStructure.feeItems);

  if (!feeItems || feeItems.length === 0) {
    return <EmptyContent title="No Fee Structure Available" />;
  }

  const totalFeeAmount = feeItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange} // ✅ allow toggle
      sx={{
        border: '1px solid #ccc',
        boxShadow: 'none',
        borderRadius: 1,
        '&:before': { display: 'none' },
        width: '100%',
        mb: expanded ? 0 : 2,
      }}
    >
      <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography sx={{ fontWeight: 600, flex: 1 }}>{feeStructure.feeStructureName}</Typography>
          <Chip
            label={`Total : ${formatNumber(totalFeeAmount, 'INR')}`}
            color="success"
            size="small"
            variant="outlined"
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ width: '100%' }}>
        <CustomizableTable
          tableId="fee-items-table"
          noDataText="No Fee Items Found"
          columns={[
            { id: 'feeCategory', label: 'Category', align: 'left' },

            { id: 'feeHead', label: 'Name', align: 'left' },

            {
              id: 'amount',
              label: 'Amount',
              align: 'left',
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
              render: (value) =>
                value ? (
                  <Chip label="One Time" color="info" size="small" variant="soft" />
                ) : (
                  <Chip label="Recurring" color="default" size="small" variant="soft" />
                ),
            },
            {
              id: 'required',
              label: 'Status',
              align: 'left',
              render: (value) =>
                value ? (
                  <Chip label="Mandatory" color="success" size="small" variant="soft" />
                ) : (
                  <Chip label="Optional" color="warning" size="small" variant="soft" />
                ),
            },
          ]}
          data={feeItems || []}
        />

        {/* <Grid container spacing={2}>
          <Grid size={12} ml={8}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Category
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Name
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Amount
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Payment Type
                </Typography>
              </Grid>
              <Grid size={2} ml={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12} sx={{ mt: 2 }}>
            <Scrollbar sx={{ maxHeight: 300 }}>
              {feeItems.map((item, ind) => (
                <Paper
                  key={ind}
                  sx={{
                    border: '1px dashed #000',
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={0.5}>
                      <Typography variant="body1">{ind + 1}.</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography variant="body1">{item.feeCategory}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography variant="body1">{item.feeHead}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography variant="body1">
                        <NumericFormat
                          value={item.amount}
                          displayType="text"
                          thousandSeparator
                          prefix="₹"
                        />
                      </Typography>
                    </Grid>
                    <Grid size={2}>
                      {item.isOneTime ? (
                        <Chip label="One Time" color="info" size="small" variant="soft" />
                      ) : (
                        <Chip label="Recurring" color="default" size="small" variant="soft" />
                      )}
                    </Grid>
                    <Grid size={2}>
                      {item.required ? (
                        <Chip label="Mandatory" color="success" size="small" variant="soft" />
                      ) : (
                        <Chip label="Optional" color="warning" size="small" variant="soft" />
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Scrollbar>
          </Grid>
        </Grid> */}
      </AccordionDetails>
    </Accordion>
  );
};

export default FeeStructureViewCard;
