'use client';

import type { IPaymentFieldConfig } from 'src/screens/finance/FeeCollection/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { paymentMethodsConfig } from 'src/screens/finance/FeeCollection/Components/paymentConfigMethods';

import LibraryChargeInfo from './LibraryChargesInfo';

import type { ILibraryChargeData } from './type';

interface CollectChargesViewProps {
  charge: ILibraryChargeData | null;
}

const CollectChargesView: React.FC<CollectChargesViewProps> = ({ charge }) => (
  <DialogScrollContent>
    <LibraryChargeInfo charge={charge} />
    {/* Assigned Charge Details */}
    <Grid size={{ xs: 12 }}>
      <SectionCard title="Charge Details">
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
      </SectionCard>
    </Grid>

    {/* Payment Section */}
    <Grid size={{ xs: 12 }} sx={{ pb: 0 }}>
      <SectionCard title="Payment Details">
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
                    {/* ...existing dynamic field rendering code... */}
                  </Grid>
                ))}
            </>
          )}
        </Grid>
      </SectionCard>
    </Grid>
  </DialogScrollContent>
);

export default CollectChargesView;
