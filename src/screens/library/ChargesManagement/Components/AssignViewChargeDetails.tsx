'use client';

import type { IPaymentFieldConfig } from 'src/screens/finance/FeeCollection/Components/type';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { paymentMethodsConfig } from 'src/screens/finance/FeeCollection/Components/paymentConfigMethods';
import {
  Grid,
  TextField,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import LibraryChargeInfo from './LibraryChargesInfo';

import type { ILibraryChargeData } from './type';

interface CollectChargesViewProps {
  charge: ILibraryChargeData | null;
}

const CollectChargesView: React.FC<CollectChargesViewProps> = ({ charge }) => {
  const [expandedChargeDetails, setExpandedChargeDetails] = useState(false);
  const [expandedPaymentDetails, setExpandedPaymentDetails] = useState(false);

  return (
    <DialogScrollContent>
      <LibraryChargeInfo charge={charge} />

      {/* Charge Details Accordion */}
      <Accordion
        expanded={expandedChargeDetails}
        onChange={() => setExpandedChargeDetails(!expandedChargeDetails)}
        sx={{
          boxShadow: 1,
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '& .MuiAccordionSummary-content': {
              my: 1.5,
              display: 'block',
            },
          }}
        >
          <Typography variant="h6" color="primary.main" mb={expandedChargeDetails ? 0 : 1}>
            Charge Details
          </Typography>

          {/* Show preview when collapsed - First 2 fields */}
          {!expandedChargeDetails && (
            <Grid container spacing={2} mt={0.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Book Title"
                  value={charge?.bookTitle ?? ''}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Charge Category"
                  value={charge?.chargeCategory ?? ''}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Book Title"
                value={charge?.bookTitle ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Charge Category"
                value={charge?.chargeCategory ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <NumericFormatCustom
                label="Amount"
                value={charge?.fineAmount ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Due Date"
                value={charge?.dueDate ? dayjs(charge?.dueDate, 'DD/MM/YYYY') : null}
                disabled
                format="DD/MM/YYYY"
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Return Date"
                value={charge?.returnDate ? dayjs(charge?.returnDate, 'DD/MM/YYYY') : null}
                disabled
                format="DD/MM/YYYY"
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason of Charge"
                value={charge?.reason ?? ''}
                fullWidth
                size="small"
                multiline
                rows={2}
                disabled
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Payment Details Accordion */}
      <Accordion
        expanded={expandedPaymentDetails}
        onChange={() => setExpandedPaymentDetails(!expandedPaymentDetails)}
        sx={{
          boxShadow: 1,
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '& .MuiAccordionSummary-content': {
              my: 1.5,
              display: 'block',
            },
          }}
        >
          <Typography variant="h6" color="primary.main" mb={expandedPaymentDetails ? 0 : 1}>
            Payment Details
          </Typography>

          {/* Show preview when collapsed - First 2 fields */}
          {!expandedPaymentDetails && (
            <Grid container spacing={2} mt={0.5}>
              {!charge?.paymentDetails ||
              Object.values(charge.paymentDetails).every(
                (val) => val === '' || val === null || val === undefined
              ) ? (
                <Grid size={12}>
                  <TextField
                    value="No payment has been made for this charge."
                    fullWidth
                    size="small"
                    disabled
                    InputProps={{ style: { color: '#d32f2f', fontWeight: 600 } }}
                  />
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Payment Method"
                      value={charge?.paymentDetails?.paymentMethod ?? ''}
                      fullWidth
                      size="small"
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <NumericFormatCustom
                      fullWidth
                      label="Amount"
                      size="small"
                      value={charge?.paymentDetails?.paymentAmount ?? ''}
                      disabled
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            {!charge?.paymentDetails ||
            Object.values(charge.paymentDetails).every(
              (val) => val === '' || val === null || val === undefined
            ) ? (
              <Grid size={12}>
                <TextField
                  value="No payment has been made for this charge."
                  fullWidth
                  size="small"
                  disabled
                  InputProps={{ style: { color: '#d32f2f', fontWeight: 600 } }}
                />
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Payment Method"
                    value={charge?.paymentDetails?.paymentMethod ?? ''}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <NumericFormatCustom
                    fullWidth
                    label="Amount"
                    size="small"
                    value={charge?.paymentDetails?.paymentAmount ?? ''}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Notes"
                    value={charge?.paymentDetails?.notes ?? ''}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
                {charge?.paymentDetails?.paymentMethod !== 'Cash' &&
                  paymentMethodsConfig[
                    charge?.paymentDetails?.paymentMethod as keyof typeof paymentMethodsConfig
                  ]?.map((field: IPaymentFieldConfig) => (
                    <Grid size={6} key={`${charge?.paymentDetails?.paymentMethod}-${field.name}`}>
                      <TextField
                        label={field.label}
                        value={
                          charge?.paymentDetails?.[
                            field.name as keyof typeof charge.paymentDetails
                          ] ?? ''
                        }
                        fullWidth
                        size="small"
                        disabled
                      />
                    </Grid>
                  ))}
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </DialogScrollContent>
  );
};

export default CollectChargesView;
