import React from 'react';
import { NumericFormat } from 'react-number-format';

import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

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
    <Grid size={12} key={className}>
      <Accordion
        defaultExpanded
        sx={{
          border: '1px solid #ccc',
          boxShadow: 'none',
          borderRadius: 1,
          '&:before': { display: 'none' },
          mb: 2,
          width: '100%',
        }}
      >
        <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 600, flex: 1 }}>Fee Structure Details</Typography>
            <Chip
              label={`Total Fee Amount : ₹${totalFeeAmount}`}
              color="success"
              size="small"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid size={12} sx={{ mt: 2 }}>
              <Scrollbar sx={{ maxHeight: 300 }}>
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
                      <Grid size={0.5}>
                        <Typography variant="subtitle2">{index + 1}.</Typography>
                      </Grid>

                      <Grid size={2}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">{item.feeCategory}</Typography>
                      </Grid>

                      <Grid size={2}>
                        <Typography variant="body2" color="text.secondary">
                          Fee Head
                        </Typography>
                        <Typography variant="body1">{item.feeHead}</Typography>
                      </Grid>

                      <Grid size={2}>
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

                      <Grid size={2}>
                        {item.isOneTime ? (
                          <Chip label="One Time" color="info" size="small" />
                        ) : (
                          <Chip label="Recurring" color="default" size="small" />
                        )}
                      </Grid>

                      <Grid size={2}>
                        {item.required ? (
                          <Chip label="Mandatory" color="success" size="small" />
                        ) : (
                          <Chip label="Optional" color="warning" size="small" />
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Scrollbar>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default FeeStructureViewCard;
