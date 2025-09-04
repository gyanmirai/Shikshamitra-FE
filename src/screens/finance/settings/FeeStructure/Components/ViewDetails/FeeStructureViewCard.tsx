import React from 'react';
import { NumericFormat } from 'react-number-format';

import { Grid, Chip, Paper, Typography } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

interface FeeStructureViewCardProps {
  className: string;
  feeItems: {
    feeCategory: string;
    feeHead: string;
    amount: number;
    isOneTime: boolean;
    required: boolean;
  }[];
}

const FeeStructureViewCard: React.FC<FeeStructureViewCardProps> = ({ className, feeItems }) => {
  if (!feeItems || feeItems.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mt: 2 }}>
        No fee heads added for this class.
      </Typography>
    );
  }

  const totalFeeAmount = feeItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Grid xs={12} key={className} sx={{ ml: 3, mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Total Fee Amount: ₹{totalFeeAmount}
      </Typography>

      <Scrollbar sx={{ height: '100%', mb: 2 }}>
        {feeItems.map((item, index) => (
          <Paper
            key={index}
            sx={{
              border: '1px dashed #000',
              borderRadius: 1,
              p: 1.5,
              mb: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={0.5}>
                <Typography variant="subtitle2">{index + 1}.</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">{item.feeCategory}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant="body2" color="text.secondary">
                  Fee Head
                </Typography>
                <Typography variant="body1">{item.feeHead}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1">
                  <NumericFormat
                    value={item.amount}
                    displayType="text"
                    thousandSeparator
                    prefix="₹"
                  />
                </Typography>
              </Grid>

              <Grid item xs={2}>
                {item.isOneTime ? (
                  <Chip label="One Time" color="info" size="small" />
                ) : (
                  <Chip label="Recurring" color="default" size="small" />
                )}
              </Grid>

              <Grid item xs={2}>
                {item.required ? (
                  <Chip label="Optional" color="warning" size="small" />
                ) : (
                  <Chip label="Mandatory" color="success" size="small" />
                )}
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Scrollbar>
    </Grid>
  );
};

export default FeeStructureViewCard;
