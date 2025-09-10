'use client';

import type { IPaymentFieldConfig } from 'src/screens/finance/FeeCollection/Components/type';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Grid, MenuItem, TextField } from '@mui/material';
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
            <TextField
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
              value={charge?.dueDate ? dayjs(charge?.dueDate) : null}
              disabled
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
    <Grid size={{ xs: 12 }}>
      <SectionCard title="Payment Details">
        <Grid container spacing={2}>
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
            <TextField
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
                {field.type === 'date' ? (
                  <DatePicker
                    label={field.label}
                    value={
                      charge?.paymentDetails?.[field.name as keyof typeof charge.paymentDetails]
                        ? dayjs(
                            charge?.paymentDetails[
                              field.name as keyof typeof charge.paymentDetails
                            ] as string
                          )
                        : null
                    }
                    disabled
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                ) : field.type === 'select' ? (
                  <TextField
                    select
                    fullWidth
                    label={field.label}
                    size="small"
                    value={
                      charge?.paymentDetails?.[field.name as keyof typeof charge.paymentDetails] ||
                      ''
                    }
                    disabled
                  >
                    {field.options?.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : field.type === 'multiline' ? (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    label={field.label}
                    value={
                      charge?.paymentDetails?.[
                        field.name as keyof NonNullable<typeof charge.paymentDetails>
                      ] || ''
                    }
                    disabled
                  />
                ) : field.type === 'amount' ? (
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label={field.label}
                    value={
                      charge?.paymentDetails?.[
                        field.name as keyof NonNullable<typeof charge.paymentDetails>
                      ] || ''
                    }
                    disabled
                  />
                ) : (
                  <TextField
                    fullWidth
                    type={field.type}
                    label={field.label}
                    size="small"
                    value={
                      charge?.paymentDetails?.[
                        field.name as keyof NonNullable<typeof charge.paymentDetails>
                      ] || ''
                    }
                    disabled
                  />
                )}
              </Grid>
            ))}
        </Grid>
      </SectionCard>
    </Grid>
  </DialogScrollContent>
);

export default CollectChargesView;
