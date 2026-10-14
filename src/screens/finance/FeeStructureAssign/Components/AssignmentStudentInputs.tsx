import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { FormSectionHeader } from 'src/components/form-section-card';
import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';
import { useAssignmentTransportSourcesQuery } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import AssignmentMoneyInput from './AssignmentMoneyInput';
import { formatAssignmentMoney } from './assignmentMoney';

export default function AssignmentStudentInputs({
  candidate,
  request,
  onChange,
  canOverrideDates,
  disabled,
}: {
  candidate: AssignmentCandidate;
  request: AssignmentRequest;
  onChange: (value: AssignmentRequest) => void;
  canOverrideDates: boolean;
  disabled: boolean;
}) {
  const [touchedAmounts, setTouchedAmounts] = useState<string[]>([]);
  const usesTransport = request.servicePeriods.some((p) => p.source === 'TransportService');
  const transport = useAssignmentTransportSourcesQuery(
    { studentId: request.studentId, academicYearId: request.academicYearId },
    { skip: !usesTransport }
  );
  const updatePeriod = (period: AssignmentServicePeriod) =>
    onChange({
      ...request,
      servicePeriods: [
        ...request.servicePeriods.filter((p) => p.feeHeadId !== period.feeHeadId),
        period,
      ],
    });
  return (
    <Stack spacing={2}>
      <FormSectionHeader
        icon="mdi:format-list-checks"
        title="Fee heads and service periods"
        descriptionTooltip="Mandatory heads are always included. Select optional heads as needed. Fixed amounts and installment schedules come from the published fee structure. Academic-year dates are configured boundaries, not verified admission or service dates."
      />
      <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {candidate.heads.map((head) => {
          const included =
            !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId);
          const period = request.servicePeriods.find((p) => p.feeHeadId === head.feeHeadId) ?? {
            feeHeadId: head.feeHeadId,
            source: 'AcademicYear' as const,
          };
          const variable = request.variableFeeHeads?.find((h) => h.feeHeadId === head.feeHeadId);
          return (
            <Box
              key={head.feeHeadId}
              component="section"
              aria-label={head.feeHeadName}
              sx={{ py: 2, minWidth: 0 }}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {head.isOptional ? (
                    <FormControlLabel
                      sx={{
                        m: 0,
                        ml: -1,
                        '& .MuiFormControlLabel-label': {
                          typography: 'subtitle2',
                          overflowWrap: 'anywhere',
                        },
                      }}
                      control={
                        <Checkbox
                          checked={included}
                          disabled={!head.isOptional || disabled}
                          onChange={(_, checked) =>
                            onChange({
                              ...request,
                              selectedOptionalFeeHeadIds: checked
                                ? [...request.selectedOptionalFeeHeadIds, head.feeHeadId]
                                : request.selectedOptionalFeeHeadIds.filter(
                                    (id) => id !== head.feeHeadId
                                  ),
                              servicePeriods: checked
                                ? request.servicePeriods
                                : request.servicePeriods.filter(
                                    (p) => p.feeHeadId !== head.feeHeadId
                                  ),
                              variableFeeHeads: checked
                                ? request.variableFeeHeads
                                : request.variableFeeHeads?.filter(
                                    (h) => h.feeHeadId !== head.feeHeadId
                                  ),
                              feeHeadDetails: checked
                                ? request.feeHeadDetails
                                : request.feeHeadDetails.filter(
                                    (h) => h.feeHeadId !== head.feeHeadId
                                  ),
                            })
                          }
                        />
                      }
                      label={`${head.feeHeadName} · ${head.isOptional ? 'Optional' : 'Mandatory'}`}
                    />
                  ) : (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {head.feeHeadName}
                      </Typography>
                      <Label>Mandatory</Label>
                    </Stack>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {head.isVariable ? 'Student amount' : 'Fixed amount'} ·{' '}
                    {head.isOneTime ? 'One-time charge' : 'Total for term coverage'}
                  </Typography>
                </Box>
                {!head.isVariable && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                      pt: head.isOptional ? 1 : 0,
                    }}
                  >
                    {formatAssignmentMoney(head.configuredAmount ?? 0)}
                  </Typography>
                )}
              </Stack>
              {included && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      sm: head.isVariable ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                    },
                    gap: 2,
                    alignItems: 'start',
                  }}
                >
                  <Stack spacing={1}>
                    <CustomSelect
                      label={`Service period for ${head.feeHeadName}`}
                      value={period.source}
                      disabled={disabled}
                      options={[
                        { value: 'AcademicYear', label: 'Configured academic year' },
                        ...(head.supportsTransportSource && !head.isVariable
                          ? [{ value: 'TransportService', label: 'Verified transport service' }]
                          : []),
                        ...(canOverrideDates
                          ? [{ value: 'ManualOverride', label: 'Authorized manual dates' }]
                          : []),
                      ]}
                      onChange={(value) =>
                        updatePeriod({
                          feeHeadId: head.feeHeadId,
                          source: value as AssignmentServicePeriod['source'],
                        })
                      }
                    />
                    {period.source === 'AcademicYear' && (
                      <Typography variant="caption" color="text.secondary">
                        Configured year dates; not a verified joining date.
                      </Typography>
                    )}
                    {period.source === 'TransportService' && (
                      <>
                        <CustomSelect
                          label={`Transport record for ${head.feeHeadName}`}
                          value={period.sourceReferenceId ?? ''}
                          isLoading={transport.isLoading}
                          disabled={disabled}
                          options={(transport.data ?? []).map((t) => ({
                            value: t.id,
                            label: t.label,
                          }))}
                          onChange={(value) =>
                            updatePeriod({
                              feeHeadId: head.feeHeadId,
                              source: 'TransportService',
                              sourceReferenceId: String(value),
                            })
                          }
                        />
                        {transport.isError && (
                          <Alert
                            severity="error"
                            action={
                              <Button
                                size="small"
                                startIcon={<Iconify icon="mdi:refresh" />}
                                onClick={() => transport.refetch()}
                              >
                                Retry
                              </Button>
                            }
                          >
                            Transport records could not be loaded.
                          </Alert>
                        )}
                      </>
                    )}
                    {period.source === 'ManualOverride' && (
                      <>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <TextField
                            type="date"
                            label="Service start"
                            fullWidth
                            value={period.startDate?.slice(0, 10) ?? ''}
                            disabled={disabled}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) =>
                              updatePeriod({
                                ...period,
                                startDate: e.target.value
                                  ? `${e.target.value}T00:00:00Z`
                                  : undefined,
                              })
                            }
                          />
                          <TextField
                            type="date"
                            label="Service end"
                            fullWidth
                            value={period.endDate?.slice(0, 10) ?? ''}
                            disabled={disabled}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) =>
                              updatePeriod({
                                ...period,
                                endDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
                              })
                            }
                          />
                        </Stack>
                        <TextField
                          label="Reason for service date override"
                          required
                          value={period.reason ?? ''}
                          disabled={disabled}
                          inputProps={{ maxLength: 500 }}
                          onChange={(e) => updatePeriod({ ...period, reason: e.target.value })}
                        />
                      </>
                    )}
                  </Stack>
                  {head.isVariable && (
                    <Stack spacing={1.5}>
                      <AssignmentMoneyInput
                        label={`${head.feeHeadName} student amount for term coverage`}
                        required
                        fullWidth
                        value={variable?.amount ?? null}
                        disabled={disabled}
                        error={
                          touchedAmounts.includes(head.feeHeadId) && !!amountError(variable?.amount)
                        }
                        helperText={
                          touchedAmounts.includes(head.feeHeadId) && amountError(variable?.amount)
                            ? amountError(variable?.amount)
                            : 'Enter the full coverage total; installments split this amount.'
                        }
                        onBlur={() =>
                          setTouchedAmounts((previous) =>
                            previous.includes(head.feeHeadId)
                              ? previous
                              : [...previous, head.feeHeadId]
                          )
                        }
                        onAmountChange={(amount) =>
                          onChange({
                            ...request,
                            variableFeeHeads: [
                              ...(request.variableFeeHeads ?? []).filter(
                                (h) => h.feeHeadId !== head.feeHeadId
                              ),
                              {
                                feeHeadId: head.feeHeadId,
                                amount,
                                zeroAmountReason: variable?.zeroAmountReason,
                              },
                            ],
                          })
                        }
                      />
                      {variable?.amount === 0 && (
                        <TextField
                          label="Reason for zero amount"
                          required
                          value={variable.zeroAmountReason ?? ''}
                          disabled={disabled}
                          inputProps={{ maxLength: 500 }}
                          onChange={(e) =>
                            onChange({
                              ...request,
                              variableFeeHeads: (request.variableFeeHeads ?? []).map((h) =>
                                h.feeHeadId === head.feeHeadId
                                  ? { ...h, zeroAmountReason: e.target.value }
                                  : h
                              ),
                            })
                          }
                        />
                      )}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
