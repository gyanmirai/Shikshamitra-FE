import React from 'react';
import { NumericFormat } from 'react-number-format';
import { Scrollbar } from 'src/components/scrollbar';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import { formatNumber } from 'src/utils/formate_number';
import { EmptyContent } from 'src/components/empty-content';
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
    return <EmptyContent title="No Fee Structure Available" />;
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
          width: '100%',
        }}
      >
        <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 600, flex: 1 }}>Fee Structure Details</Typography>
            <Chip
              label={`Total : ${formatNumber(totalFeeAmount, 'INR')}`}
              color="success"
              size="small"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ width: '100%' }}>
          <Grid container spacing={2}>
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
                        <Typography variant="body1">{index + 1}.</Typography>
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
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default FeeStructureViewCard;
