import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
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
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, minWidth: 0 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={included}
                  disabled={!head.isOptional || disabled}
                  onChange={(_, checked) =>
                    onChange({
                      ...request,
                      selectedOptionalFeeHeadIds: checked
                        ? [...request.selectedOptionalFeeHeadIds, head.feeHeadId]
                        : request.selectedOptionalFeeHeadIds.filter((id) => id !== head.feeHeadId),
                      servicePeriods: checked
                        ? request.servicePeriods
                        : request.servicePeriods.filter((p) => p.feeHeadId !== head.feeHeadId),
                      variableFeeHeads: checked
                        ? request.variableFeeHeads
                        : request.variableFeeHeads?.filter((h) => h.feeHeadId !== head.feeHeadId),
                      feeHeadDetails: checked
                        ? request.feeHeadDetails
                        : request.feeHeadDetails.filter((h) => h.feeHeadId !== head.feeHeadId),
                    })
                  }
                />
              }
              label={`${head.feeHeadName} · ${head.isOptional ? 'Optional' : 'Mandatory'}`}
            />
            <Typography variant="body2" color="text.secondary">
              {head.isVariable
                ? 'Variable amount entered per student'
                : formatAssignmentMoney(head.configuredAmount ?? 0)}{' '}
              · {head.isOneTime ? 'One-time' : 'Total for Payment Term coverage'} · Payment schedule
              from the published term
            </Typography>
            {included && (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
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
                    Uses the academic-year boundaries. This does not claim a verified admission or
                    service start date.
                  </Typography>
                )}
                {period.source === 'TransportService' && (
                  <>
                    <CustomSelect
                      label={`Transport record for ${head.feeHeadName}`}
                      value={period.sourceReferenceId ?? ''}
                      isLoading={transport.isLoading}
                      disabled={disabled}
                      options={(transport.data ?? []).map((t) => ({ value: t.id, label: t.label }))}
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
                            startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
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
                {head.isVariable && (
                  <>
                    <AssignmentMoneyInput
                      label={`${head.feeHeadName} student amount for term coverage`}
                      required
                      fullWidth
                      value={variable?.amount ?? null}
                      disabled={disabled}
                      error={
                        touchedAmounts.includes(head.feeHeadId) &&
                        !!amountError(variable?.amount)
                      }
                      helperText={
                        touchedAmounts.includes(head.feeHeadId) && amountError(variable?.amount)
                          ? amountError(variable?.amount)
                          : 'Required when included. Enter the full coverage total before proration; installments split this amount.'
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
                  </>
                )}
                {!head.isVariable && (
                  <TextField
                    label={`Configured ${head.isOneTime ? 'one-time' : 'annual total'} amount`}
                    value={formatAssignmentMoney(head.configuredAmount ?? 0)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    helperText="Fixed amount from the published fee structure."
                  />
                )}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
