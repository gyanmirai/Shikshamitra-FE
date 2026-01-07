'use client';

import type { RootState } from 'src/redux/store';
import type { IPaymentFieldConfig } from 'src/screens/finance/FeeCollection/Components/type';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ExpandMore } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetDetailedChargeQuery } from 'src/redux/library/charges-management/charges-get-api';
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

  // Get academicYearId from Redux state
  const { currentAcademicYearId } = useSelector((state: RootState) => state.globalState);

  // Fetch detailed charge information
  const { data: detailedCharge } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDetailedChargeQuery,
    params: {
      chargeId: charge?.id || '',
      academicYearId: currentAcademicYearId,
    },
  });

  // Use detailed charge data if available, otherwise fallback to prop
  const chargeData = detailedCharge || charge;

  return (
    <DialogScrollContent>
      <LibraryChargeInfo charge={chargeData} />

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
                  value={chargeData?.bookTitle ?? ''}
                  fullWidth
                  size="small"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Charge Category"
                  value={chargeData?.chargeCategory ?? ''}
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
                value={chargeData?.bookTitle ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Charge Category"
                value={chargeData?.chargeCategory ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <NumericFormatCustom
                label="Amount"
                value={chargeData?.fineAmount ?? ''}
                fullWidth
                size="small"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Due Date"
                value={chargeData?.dueDate ? dayjs(chargeData?.dueDate, 'DD/MM/YYYY') : null}
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
                value={chargeData?.returnDate ? dayjs(chargeData?.returnDate, 'DD/MM/YYYY') : null}
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
                value={chargeData?.reason ?? ''}
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
                      value={chargeData?.paymentDetails?.paymentMethod ?? ''}
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
                      value={chargeData?.paymentDetails?.paymentAmount ?? ''}
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
            {!chargeData?.paymentDetails ||
            Object.values(chargeData.paymentDetails).every(
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
                    value={chargeData?.paymentDetails?.paymentMethod ?? ''}
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
                    value={chargeData?.paymentDetails?.paymentAmount ?? ''}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Notes"
                    value={chargeData?.paymentDetails?.notes ?? ''}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
                {chargeData?.paymentDetails?.paymentMethod !== 'Cash' &&
                  paymentMethodsConfig[
                    chargeData?.paymentDetails?.paymentMethod as keyof typeof paymentMethodsConfig
                  ]?.map((field: IPaymentFieldConfig) => (
                    <Grid
                      size={6}
                      key={`${chargeData?.paymentDetails?.paymentMethod}-${field.name}`}
                    >
                      <TextField
                        label={field.label}
                        value={
                          chargeData?.paymentDetails?.[
                            field.name as keyof typeof chargeData.paymentDetails
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
