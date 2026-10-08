'use client';

import React from 'react';
import { getIn } from 'formik';
import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import FinanceRoutingFields from 'src/screens/finance/components/FinanceRoutingFields';
import {
  Grid,
  Paper,
  Table,
  Stack,
  Switch,
  Select,
  Button,
  Tooltip,
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
  FormHelperText,
  TableContainer,
  InputAdornment,
} from '@mui/material';

import SlabTimelinePreview from './SlabTimelinePreview';
import CollectionNumberField from './CollectionNumberField';
import { SectionCard, CollectionInfoTip, computeSlabIssues } from './CollectionCommon';

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
  const isLateFeeEnabled = Boolean(formik.values.enableLateFee);
  const { overlapIndices } = computeSlabIssues(
    formik.values.escalationRules,
    formik.values.maximumChargingDays
  );

  return (
    <SectionCard
      title="Late Fee Rules"
      subtitle="Enable charges on unpaid fee heads, then set the grace period, calculation method, escalation slabs, and limits."
      icon={GlobalIcons.receiptIcon}
      headerSpacing={isLateFeeEnabled ? 2 : 0}
      action={
        <Switch
          size="small"
          checked={isLateFeeEnabled}
          onChange={(_, checked) => formik.setFieldValue('enableLateFee', checked)}
          slotProps={{ input: { 'aria-label': 'Enable late fee charges' } }}
        />
      }
    >
      <Grid container spacing={2}>
        {isLateFeeEnabled && (
          <>
            {/* Grace Period Days */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={formik.touched.gracePeriodDays && Boolean(formik.errors.gracePeriodDays)}
              >
                <CollectionNumberField
                  fullWidth
                  size="small"
                  kind="days"
                  label="Grace period *"
                  placeholder="0"
                  name="gracePeriodDays"
                  value={formik.values.gracePeriodDays}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'gracePeriodDays',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  onBlur={formik.handleBlur}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          days
                          <CollectionInfoTip
                            label="Grace period"
                            title="Number of buffer days after the due date before late fees start accruing."
                          />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { min: 0 },
                  }}
                  error={formik.touched.gracePeriodDays && Boolean(formik.errors.gracePeriodDays)}
                  helperText={
                    formik.touched.gracePeriodDays && (formik.errors.gracePeriodDays as string)
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Grace Day Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={formik.touched.gracePeriodType && Boolean(formik.errors.gracePeriodType)}
              >
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.gracePeriodType && Boolean(formik.errors.gracePeriodType)}
                >
                  <InputLabel id="collection-grace-day-type">Grace day calculation *</InputLabel>
                  <Select
                    label="Grace day calculation *"
                    labelId="collection-grace-day-type"
                    name="gracePeriodType"
                    value={formik.values.gracePeriodType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="Calendar">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={GlobalIcons.calendar} width={16} height={16} />
                        <Typography variant="body2">Calendar Days (Standard)</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="WorkingDay">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:calendar-date-bold" width={16} height={16} />
                        <Typography variant="body2">Working Days Only</Typography>
                      </Stack>
                    </MenuItem>
                  </Select>
                  {formik.touched.gracePeriodType && formik.errors.gracePeriodType && (
                    <FormHelperText>{formik.errors.gracePeriodType as string}</FormHelperText>
                  )}
                </FormControl>
              </ShakingTextField>
            </Grid>

            {/* Apply On Fee Heads */}
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={
                  formik.touched.lateFeeApplyOnFeeHeads &&
                  Boolean(formik.errors.lateFeeApplyOnFeeHeads)
                }
              >
                <Autocomplete
                  multiple
                  size="small"
                  options={feeHeads}
                  groupBy={(option) => option.feeCategoryName || 'Other'}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={feeHeads.filter((h) =>
                    formik.values.lateFeeApplyOnFeeHeads?.includes(h.id)
                  )}
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
                        <Typography variant="body2">{option.name}</Typography>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="lateFeeApplyOnFeeHeads"
                      label="Apply late fee on fee heads *"
                      placeholder="Select applicable fee heads..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            <CollectionInfoTip
                              label="Apply late fee on fee heads"
                              title="Late fees are computed only on unpaid balances of the selected fee heads."
                            />
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lateFeeApplyOnFeeHeads &&
                        Boolean(formik.errors.lateFeeApplyOnFeeHeads)
                      }
                      helperText={
                        formik.touched.lateFeeApplyOnFeeHeads &&
                        (formik.errors.lateFeeApplyOnFeeHeads as string)
                      }
                    />
                  )}
                />
              </ShakingTextField>
            </Grid>

            {/* Calculation method */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={formik.touched.lateFeeType && Boolean(formik.errors.lateFeeType)}
              >
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.lateFeeType && Boolean(formik.errors.lateFeeType)}
                >
                  <InputLabel id="collection-calculation-method">Calculation method *</InputLabel>
                  <Select
                    label="Calculation method *"
                    labelId="collection-calculation-method"
                    name="lateFeeType"
                    value={formik.values.lateFeeType}
                    onChange={(e) => {
                      formik.handleChange(e);
                      // Reset type-specific fields
                      formik.setFieldValue('flatAmount', null);
                      formik.setFieldValue('percentage', null);
                      formik.setFieldValue('amountPerDay', null);
                      formik.setFieldValue('amountPerWeek', null);
                      formik.setFieldValue('amountPerMonth', null);
                    }}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="Flat">Flat Fixed Amount (₹)</MenuItem>
                    <MenuItem value="Percentage">Percentage Per Day (%)</MenuItem>
                    <MenuItem value="PerDay">Daily Fixed Amount (₹/day)</MenuItem>
                    <MenuItem value="PerWeek">Weekly Fixed Amount (₹/week)</MenuItem>
                    <MenuItem value="PerMonth">Monthly Fixed Amount (₹/month)</MenuItem>
                    <MenuItem value="Compound">Compound Interest</MenuItem>
                    <MenuItem value="Slab">Escalation Slab Based</MenuItem>
                  </Select>
                  {formik.touched.lateFeeType && formik.errors.lateFeeType && (
                    <FormHelperText>{formik.errors.lateFeeType as string}</FormHelperText>
                  )}
                </FormControl>
              </ShakingTextField>
            </Grid>

            {/* Dynamic Type Fields */}
            {formik.values.lateFeeType === 'Flat' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.flatAmount && Boolean(formik.errors.flatAmount)}
                >
                  <CollectionNumberField
                    fullWidth
                    size="small"
                    kind="amount"
                    label="Flat late fee amount *"
                    placeholder="0.00"
                    name="flatAmount"
                    value={formik.values.flatAmount ?? ''}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'flatAmount',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      },
                      htmlInput: { min: 0 },
                    }}
                    error={formik.touched.flatAmount && Boolean(formik.errors.flatAmount)}
                    helperText={formik.touched.flatAmount && (formik.errors.flatAmount as string)}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {(formik.values.lateFeeType === 'Percentage' ||
              formik.values.lateFeeType === 'Compound') && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.percentage && Boolean(formik.errors.percentage)}
                >
                  <CollectionNumberField
                    fullWidth
                    size="small"
                    kind="percentage"
                    label="Interest rate percentage *"
                    placeholder="0.00"
                    name="percentage"
                    value={formik.values.percentage ?? ''}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'percentage',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      },
                      htmlInput: { min: 0, max: 100, step: 0.01 },
                    }}
                    error={formik.touched.percentage && Boolean(formik.errors.percentage)}
                    helperText={formik.touched.percentage && (formik.errors.percentage as string)}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.lateFeeType === 'Percentage' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="collection-calculation-base">Calculation base</InputLabel>
                  <Select
                    label="Calculation base"
                    labelId="collection-calculation-base"
                    name="percentageBase"
                    value={formik.values.percentageBase}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="OutstandingAmount">Outstanding Overdue Balance</MenuItem>
                    <MenuItem value="OriginalFee">Original Fee Amount</MenuItem>
                    <MenuItem value="RemainingBalance">Remaining Total Balance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formik.values.lateFeeType === 'Compound' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="collection-compound-frequency">Compound frequency</InputLabel>
                  <Select
                    label="Compound frequency"
                    labelId="collection-compound-frequency"
                    name="compoundFrequency"
                    value={formik.values.compoundFrequency}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="Daily">Daily Compounding</MenuItem>
                    <MenuItem value="Weekly">Weekly Compounding</MenuItem>
                    <MenuItem value="Monthly">Monthly Compounding</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerDay' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.amountPerDay && Boolean(formik.errors.amountPerDay)}
                >
                  <CollectionNumberField
                    fullWidth
                    size="small"
                    kind="amount"
                    label="Amount per day *"
                    placeholder="0.00"
                    name="amountPerDay"
                    value={formik.values.amountPerDay ?? ''}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'amountPerDay',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/ day</InputAdornment>,
                      },
                      htmlInput: { min: 0 },
                    }}
                    error={formik.touched.amountPerDay && Boolean(formik.errors.amountPerDay)}
                    helperText={
                      formik.touched.amountPerDay && (formik.errors.amountPerDay as string)
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerWeek' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.amountPerWeek && Boolean(formik.errors.amountPerWeek)}
                >
                  <CollectionNumberField
                    fullWidth
                    size="small"
                    kind="amount"
                    label="Amount per week *"
                    placeholder="0.00"
                    name="amountPerWeek"
                    value={formik.values.amountPerWeek ?? ''}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'amountPerWeek',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/ week</InputAdornment>,
                      },
                      htmlInput: { min: 0 },
                    }}
                    error={formik.touched.amountPerWeek && Boolean(formik.errors.amountPerWeek)}
                    helperText={
                      formik.touched.amountPerWeek && (formik.errors.amountPerWeek as string)
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.lateFeeType === 'PerMonth' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.amountPerMonth && Boolean(formik.errors.amountPerMonth)}
                >
                  <CollectionNumberField
                    fullWidth
                    size="small"
                    kind="amount"
                    label="Amount per month *"
                    placeholder="0.00"
                    name="amountPerMonth"
                    value={formik.values.amountPerMonth ?? ''}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'amountPerMonth',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        endAdornment: <InputAdornment position="end">/ month</InputAdornment>,
                      },
                      htmlInput: { min: 0 },
                    }}
                    error={formik.touched.amountPerMonth && Boolean(formik.errors.amountPerMonth)}
                    helperText={
                      formik.touched.amountPerMonth && (formik.errors.amountPerMonth as string)
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {/* Slab Builder Section */}
            {formik.values.lateFeeType === 'Slab' && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.background.defaultChannel, 0.5),
                    borderColor: 'divider',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>
                        Escalation slabs
                      </Typography>
                      <CollectionInfoTip
                        label="Escalation slabs"
                        title="Configure tiered late charges based on how many days overdue the payment is."
                      />
                    </Stack>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                      onClick={addSlab}
                      disabled={formik.values.escalationRules.some(
                        (rule: any) =>
                          rule.endDay === null ||
                          rule.endDay >= (formik.values.maximumChargingDays ?? 365)
                      )}
                    >
                      Add Slab
                    </Button>
                  </Stack>

                  <SlabTimelinePreview
                    rules={formik.values.escalationRules}
                    maximumChargingDays={formik.values.maximumChargingDays}
                  />

                  {formik.values.escalationRules.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderStyle: 'dashed',
                        borderRadius: 1.5,
                      }}
                    >
                      <Iconify
                        icon="solar:chart-square-bold-duotone"
                        width={36}
                        height={36}
                        sx={{ color: 'text.disabled', mb: 1 }}
                      />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        No escalation slabs defined yet.
                      </Typography>
                      <Typography variant="caption" color="text.disabled" display="block">
                        Click &quot;Add Slab&quot; above to create day ranges (e.g., Days 1–15: ₹50,
                        Days 16–30: ₹100).
                      </Typography>
                    </Paper>
                  ) : (
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ borderRadius: 1.5, overflowX: 'auto' }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08) }}
                          >
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>
                              From Day
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>
                              To Day
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>
                              Type
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>
                              Value
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}
                              align="right"
                            >
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values.escalationRules.map((rule: any, idx: number) => {
                            const isOverlap = overlapIndices.includes(idx);
                            return (
                              <TableRow
                                key={idx}
                                sx={{
                                  bgcolor: isOverlap
                                    ? (theme) => alpha(theme.palette.error.main, 0.06)
                                    : 'transparent',
                                  '&:hover': {
                                    bgcolor: (theme) =>
                                      isOverlap
                                        ? alpha(theme.palette.error.main, 0.1)
                                        : alpha(theme.palette.action.hover, 0.5),
                                  },
                                }}
                              >
                                <TableCell sx={{ py: 0.75 }}>
                                  <CollectionNumberField
                                    size="small"
                                    kind="days"
                                    name={`escalationRules[${idx}].startDay`}
                                    value={rule.startDay}
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `escalationRules[${idx}].startDay`,
                                        e.target.value === '' ? null : Number(e.target.value)
                                      )
                                    }
                                    onBlur={formik.handleBlur}
                                    error={Boolean(
                                      getIn(formik.touched, `escalationRules[${idx}].startDay`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].startDay`)
                                    )}
                                    helperText={
                                      getIn(formik.touched, `escalationRules[${idx}].startDay`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].startDay`)
                                    }
                                    sx={{ width: 100 }}
                                    slotProps={{
                                      htmlInput: {
                                        min: 0,
                                        style: { fontSize: '12px', padding: '5px 8px' },
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 0.75 }}>
                                  <CollectionNumberField
                                    size="small"
                                    kind="days"
                                    placeholder="Open"
                                    name={`escalationRules[${idx}].endDay`}
                                    value={rule.endDay ?? ''}
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `escalationRules[${idx}].endDay`,
                                        e.target.value === '' ? null : Number(e.target.value)
                                      )
                                    }
                                    onBlur={formik.handleBlur}
                                    error={Boolean(
                                      getIn(formik.touched, `escalationRules[${idx}].endDay`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].endDay`)
                                    )}
                                    helperText={
                                      getIn(formik.touched, `escalationRules[${idx}].endDay`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].endDay`)
                                    }
                                    sx={{ width: 100 }}
                                    slotProps={{
                                      htmlInput: {
                                        min: 0,
                                        style: { fontSize: '12px', padding: '5px 8px' },
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 0.75 }}>
                                  <FormControl size="small">
                                    <Select
                                      size="small"
                                      name={`escalationRules[${idx}].calculationType`}
                                      value={rule.calculationType}
                                      onChange={(e) =>
                                        formik.setFieldValue(
                                          `escalationRules[${idx}].calculationType`,
                                          e.target.value
                                        )
                                      }
                                      onBlur={formik.handleBlur}
                                      sx={{ width: 110, height: 32, fontSize: '12px' }}
                                    >
                                      <MenuItem value="Flat" sx={{ fontSize: '12px' }}>
                                        Flat (₹)
                                      </MenuItem>
                                      <MenuItem value="Percentage" sx={{ fontSize: '12px' }}>
                                        Percentage (%)
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </TableCell>
                                <TableCell sx={{ py: 0.75 }}>
                                  <CollectionNumberField
                                    size="small"
                                    kind={
                                      rule.calculationType === 'Percentage'
                                        ? 'percentage'
                                        : 'amount'
                                    }
                                    name={`escalationRules[${idx}].value`}
                                    value={rule.value}
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `escalationRules[${idx}].value`,
                                        e.target.value === '' ? null : Number(e.target.value)
                                      )
                                    }
                                    onBlur={formik.handleBlur}
                                    error={Boolean(
                                      getIn(formik.touched, `escalationRules[${idx}].value`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].value`)
                                    )}
                                    helperText={
                                      getIn(formik.touched, `escalationRules[${idx}].value`) &&
                                      getIn(formik.errors, `escalationRules[${idx}].value`)
                                    }
                                    sx={{ width: 125 }}
                                    slotProps={{
                                      htmlInput: {
                                        min: 0,
                                        style: { fontSize: '12px', padding: '5px 8px' },
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 0.75 }} align="right">
                                  <Tooltip title="Delete slab">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => removeSlab(idx)}
                                      sx={{
                                        '&:hover': {
                                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                        },
                                      }}
                                    >
                                      <Iconify icon={GlobalIcons.delete} width={16} height={16} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {formik.touched.escalationRules &&
                    typeof formik.errors.escalationRules === 'string' && (
                      <FormHelperText error sx={{ mx: 1.75, mt: 0.75 }}>
                        {formik.errors.escalationRules}
                      </FormHelperText>
                    )}
                </Paper>
              </Grid>
            )}

            {/* Rounding Method */}

            {/* Runaway Caps */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.maximumLateFeeAmount && Boolean(formik.errors.maximumLateFeeAmount)
                }
              >
                <CollectionNumberField
                  fullWidth
                  size="small"
                  kind="amount"
                  label="Maximum late fee amount"
                  placeholder="No limit"
                  name="maximumLateFeeAmount"
                  value={formik.values.maximumLateFeeAmount ?? ''}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'maximumLateFeeAmount',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  onBlur={formik.handleBlur}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <CollectionInfoTip
                            label="Maximum late fee amount"
                            title="Optional cap: late fees will never exceed this total amount."
                          />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { min: 0 },
                  }}
                  error={
                    formik.touched.maximumLateFeeAmount &&
                    Boolean(formik.errors.maximumLateFeeAmount)
                  }
                  helperText={
                    formik.touched.maximumLateFeeAmount &&
                    (formik.errors.maximumLateFeeAmount as string)
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.maximumChargingDays && Boolean(formik.errors.maximumChargingDays)
                }
              >
                <CollectionNumberField
                  fullWidth
                  size="small"
                  kind="days"
                  label="Maximum charging days"
                  placeholder="No limit"
                  name="maximumChargingDays"
                  value={formik.values.maximumChargingDays ?? ''}
                  onChange={(e) =>
                    formik.setFieldValue(
                      'maximumChargingDays',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  onBlur={formik.handleBlur}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          days
                          <CollectionInfoTip
                            label="Maximum charging days"
                            title="Optional cutoff: stop accruing additional late fees after this many days."
                          />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { min: 0 },
                  }}
                  error={
                    formik.touched.maximumChargingDays && Boolean(formik.errors.maximumChargingDays)
                  }
                  helperText={
                    formik.touched.maximumChargingDays &&
                    (formik.errors.maximumChargingDays as string)
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FinanceRoutingFields
                formik={formik}
                academicYearId={formik.values.academicYearId || ''}
                operation="collection-policy"
                categoryField="lateFeeIncomeCategoryId"
                categoryLabel="Late fee income category"
              />
            </Grid>
          </>
        )}
      </Grid>
    </SectionCard>
  );
}
