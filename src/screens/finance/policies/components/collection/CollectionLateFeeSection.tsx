'use client';

import React from 'react';
import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  Paper,
  Table,
  Switch,
  Select,
  Button,
  Checkbox,
  MenuItem,
  TableRow,
  TextField,
  TableHead,
  TableCell,
  TableBody,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  Autocomplete,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from './CollectionCommon';
import HeadSelector from '../../../components/HeadSelector';

interface CollectionLateFeeSectionProps {
  formik: any;
  feeHeads: any[];
  addSlab: () => void;
  removeSlab: (index: number) => void;
}

export default function CollectionLateFeeSection({
  formik,
  feeHeads,
  addSlab,
  removeSlab,
}: CollectionLateFeeSectionProps) {
  return (
    <SectionCard
      title="Late Fee Configuration"
      subtitle="Setup late fee parameters, grace periods, and calculation methods."
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.enableLateFee}
                onChange={(e) => formik.setFieldValue('enableLateFee', e.target.checked)}
              />
            }
            label="Enable Late Fee"
          />
        </Grid>

        {formik.values.enableLateFee && (
          <>
            {/* Grace Period */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Grace Period (Days) *"
                name="gracePeriodDays"
                value={formik.values.gracePeriodDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gracePeriodDays && Boolean(formik.errors.gracePeriodDays)}
                helperText={
                  (formik.touched.gracePeriodDays && (formik.errors.gracePeriodDays as string)) ||
                  'Days after due date before late fees start'
                }
              />
            </Grid>

            {/* Apply On Fee Heads */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                multiple
                size="small"
                options={feeHeads}
                getOptionLabel={(option) => option.name || ''}
                value={feeHeads.filter((h) => formik.values.lateFeeApplyOnFeeHeads?.includes(h.id))}
                onChange={(_, newValue) => {
                  formik.setFieldValue(
                    'lateFeeApplyOnFeeHeads',
                    newValue.map((v) => v.id)
                  );
                }}
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props as any;
                  return (
                    <li key={key || option.id} {...optionProps}>
                      <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                      {option.name}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Apply On Fee Heads *"
                    error={
                      formik.touched.lateFeeApplyOnFeeHeads &&
                      Boolean(formik.errors.lateFeeApplyOnFeeHeads)
                    }
                    helperText={
                      formik.touched.lateFeeApplyOnFeeHeads &&
                      (formik.errors.lateFeeApplyOnFeeHeads as any)
                    }
                  />
                )}
              />
            </Grid>

            {/* Calculation Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Calculation Type *</InputLabel>
                <Select
                  label="Calculation Type *"
                  name="lateFeeType"
                  value={formik.values.lateFeeType}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Clear unused variables
                    formik.setFieldValue('flatAmount', null);
                    formik.setFieldValue('percentage', null);
                    formik.setFieldValue('amountPerDay', null);
                    formik.setFieldValue('amountPerWeek', null);
                    formik.setFieldValue('amountPerMonth', null);
                  }}
                >
                  <MenuItem value="Flat">Flat Amount</MenuItem>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="PerDay">Per Day</MenuItem>
                  <MenuItem value="PerWeek">Per Week</MenuItem>
                  <MenuItem value="PerMonth">Per Month</MenuItem>
                  <MenuItem value="Compound">Compound</MenuItem>
                  <MenuItem value="Slab">Slab Based</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dynamic Fields */}
            {formik.values.lateFeeType === 'Flat' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Late Fee Amount (₹) *"
                  name="flatAmount"
                  value={formik.values.flatAmount ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.flatAmount && Boolean(formik.errors.flatAmount)}
                  helperText={formik.touched.flatAmount && (formik.errors.flatAmount as string)}
                />
              </Grid>
            )}

            {(formik.values.lateFeeType === 'Percentage' ||
              formik.values.lateFeeType === 'Compound') && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Percentage (%) *"
                  name="percentage"
                  value={formik.values.percentage ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.percentage && Boolean(formik.errors.percentage)}
                  helperText={formik.touched.percentage && (formik.errors.percentage as string)}
                />
              </Grid>
            )}

            {formik.values.lateFeeType === 'Percentage' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Calculation Base</InputLabel>
                  <Select
                    label="Calculation Base"
                    name="percentageBase"
                    value={formik.values.percentageBase}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="OutstandingAmount">Outstanding Amount</MenuItem>
                    <MenuItem value="OriginalFee">Original Fee</MenuItem>
                    <MenuItem value="RemainingBalance">Remaining Balance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formik.values.lateFeeType === 'Compound' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Compound Frequency</InputLabel>
                  <Select
                    label="Compound Frequency"
                    name="compoundFrequency"
                    value={formik.values.compoundFrequency}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerDay' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Amount Per Day (₹) *"
                  name="amountPerDay"
                  value={formik.values.amountPerDay ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.amountPerDay && Boolean(formik.errors.amountPerDay)}
                  helperText={formik.touched.amountPerDay && (formik.errors.amountPerDay as string)}
                />
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerWeek' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Amount Per Week (₹) *"
                  name="amountPerWeek"
                  value={formik.values.amountPerWeek ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.amountPerWeek && Boolean(formik.errors.amountPerWeek)}
                  helperText={
                    formik.touched.amountPerWeek && (formik.errors.amountPerWeek as string)
                  }
                />
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerMonth' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Amount Per Month (₹) *"
                  name="amountPerMonth"
                  value={formik.values.amountPerMonth ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.amountPerMonth && Boolean(formik.errors.amountPerMonth)}
                  helperText={
                    formik.touched.amountPerMonth && (formik.errors.amountPerMonth as string)
                  }
                />
              </Grid>
            )}

            {/* Slab builder */}
            {formik.values.lateFeeType === 'Slab' && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Interactive Slab Builder</Typography>
                  <Button size="small" variant="outlined" startIcon={<Add />} onClick={addSlab}>
                    Add Slab
                  </Button>
                </Box>
                {formik.values.escalationRules.length === 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      bgcolor: 'action.hover',
                      borderStyle: 'dashed',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      No slabs built yet. Build slabs to specify charges for different late windows.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '11px', py: 1 }}>From Day</TableCell>
                          <TableCell sx={{ fontSize: '11px', py: 1 }}>To Day</TableCell>
                          <TableCell sx={{ fontSize: '11px', py: 1 }}>Type</TableCell>
                          <TableCell sx={{ fontSize: '11px', py: 1 }}>Value</TableCell>
                          <TableCell sx={{ fontSize: '11px', py: 1 }} align="right">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formik.values.escalationRules.map((rule: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ py: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={rule.startDay}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `escalationRules[${idx}].startDay`,
                                    +e.target.value
                                  )
                                }
                                sx={{ width: 80 }}
                                slotProps={{
                                  htmlInput: { style: { fontSize: '12px', padding: '4px 8px' } },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                placeholder="Max"
                                value={rule.endDay ?? ''}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `escalationRules[${idx}].endDay`,
                                    e.target.value === '' ? null : +e.target.value
                                  )
                                }
                                sx={{ width: 80 }}
                                slotProps={{
                                  htmlInput: { style: { fontSize: '12px', padding: '4px 8px' } },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <Select
                                size="small"
                                value={rule.calculationType}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `escalationRules[${idx}].calculationType`,
                                    e.target.value
                                  )
                                }
                                sx={{ width: 100, height: 28, fontSize: '12px' }}
                              >
                                <MenuItem value="Flat" sx={{ fontSize: '12px' }}>
                                  Flat (₹)
                                </MenuItem>
                                <MenuItem value="Percentage" sx={{ fontSize: '12px' }}>
                                  Percent (%)
                                </MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={rule.value}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `escalationRules[${idx}].value`,
                                    +e.target.value
                                  )
                                }
                                sx={{ width: 80 }}
                                slotProps={{
                                  htmlInput: { style: { fontSize: '12px', padding: '4px 8px' } },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }} align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeSlab(idx)}
                              >
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            )}

            {/* Rounding Method & Consider as Income toggle */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Rounding Method</InputLabel>
                <Select
                  label="Rounding Method"
                  name="roundingMethod"
                  value={formik.values.roundingMethod}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="RoundUp">Round Up</MenuItem>
                  <MenuItem value="RoundDown">Round Down</MenuItem>
                  <MenuItem value="NearestRupee">Nearest Rupee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: formik.values.considerAsIncome ? 'primary.lighter' : 'transparent',
                  borderColor: formik.values.considerAsIncome ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  formik.setFieldValue('considerAsIncome', !formik.values.considerAsIncome)
                }
              >
                <FormControlLabel
                  sx={{ m: 0, pointerEvents: 'none' }}
                  control={<Switch size="small" checked={formik.values.considerAsIncome} />}
                  label={
                    <Box ml={0.5}>
                      <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                        Consider as Income
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontSize="0.68rem"
                      >
                        Treat late fee collection as operational income
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Grid>

            {/* Late-Fee Income Head */}
            {formik.values.considerAsIncome && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <HeadSelector
                  headType="Income"
                  label="Late-Fee Income Head *"
                  value={formik.values.lateFeeIncomeHeadId}
                  onChange={(val) => formik.setFieldValue('lateFeeIncomeHeadId', val)}
                  error={
                    formik.touched.lateFeeIncomeHeadId && Boolean(formik.errors.lateFeeIncomeHeadId)
                  }
                  helperText={
                    formik.touched.lateFeeIncomeHeadId &&
                    (formik.errors.lateFeeIncomeHeadId as string)
                  }
                />
              </Grid>
            )}
          </>
        )}
      </Grid>
    </SectionCard>
  );
}
