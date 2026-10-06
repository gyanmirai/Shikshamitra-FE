import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
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

export default function AssignmentStudentInputs({
  candidate,
  request,
  onChange,
  canOverrideDates,
  canOverrideAmount,
  disabled,
}: {
  candidate: AssignmentCandidate;
  request: AssignmentRequest;
  onChange: (value: AssignmentRequest) => void;
  canOverrideDates: boolean;
  canOverrideAmount: boolean;
  disabled: boolean;
}) {
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
        const amount =
          request.feeHeadDetails.find((h) => h.feeHeadId === head.feeHeadId)?.amount ??
          head.configuredAmount;
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
                : formatNumber(head.configuredAmount ?? 0, 'INR')}{' '}
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
                    <TextField
                      label={`${head.feeHeadName} student amount for term coverage`}
                      type="number"
                      required
                      fullWidth
                      value={variable?.amount ?? ''}
                      disabled={disabled}
                      inputProps={{ min: 0, max: 9999999999.99, step: 1 }}
                      error={variable !== undefined && !!amountError(variable.amount)}
                      helperText={
                        variable !== undefined && amountError(variable.amount)
                          ? amountError(variable.amount)
                          : 'Required when included. Enter the full coverage total before proration; installments split this amount.'
                      }
                      onChange={(e) =>
                        onChange({
                          ...request,
                          variableFeeHeads: [
                            ...(request.variableFeeHeads ?? []).filter(
                              (h) => h.feeHeadId !== head.feeHeadId
                            ),
                            {
                              feeHeadId: head.feeHeadId,
                              amount: e.target.value === '' ? null : Number(e.target.value),
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
                {!head.isVariable && canOverrideAmount && (
                  <TextField
                    label={`Authorized ${head.isOneTime ? 'one-time' : 'annual total'} amount`}
                    type="number"
                    value={amount ?? ''}
                    disabled={disabled}
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(e) =>
                      onChange({
                        ...request,
                        feeHeadDetails: [
                          ...request.feeHeadDetails.filter((h) => h.feeHeadId !== head.feeHeadId),
                          { feeHeadId: head.feeHeadId, amount: Number(e.target.value) },
                        ],
                      })
                    }
                  />
                )}
              </Stack>
            )}
          </Box>
        );
      })}
      {request.feeHeadDetails.some(
        (h) =>
          h.amount !== candidate.heads.find((x) => x.feeHeadId === h.feeHeadId)?.configuredAmount
      ) && (
        <TextField
          label="Reason for amount override"
          required
          disabled={disabled}
          value={request.overrideReason ?? ''}
          inputProps={{ maxLength: 500 }}
          onChange={(e) => onChange({ ...request, overrideReason: e.target.value })}
        />
      )}
    </Stack>
  );
}
