import type {
  SalaryBasis,
  SalaryTemplateVersion,
  SalaryTemplateCalculation,
} from 'src/redux/hr/salary-template-api';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { LoadingButton } from 'src/components/loading-button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Chip, Grid, Alert, Button, MenuItem, TextField, Typography } from '@mui/material';

import { SalaryTotals } from '../structure/salary-summary-view';
import { formatRuleLabel } from './salary-template-editor-utils';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

type Props = {
  salaryBasis: SalaryBasis;
  setSalaryBasis: (value: SalaryBasis) => void;
  readOnly: boolean;
  previewCurrent: boolean;
  hasPreviewed: boolean;
  busy: boolean;
  sampleAmount: number;
  setSampleAmount: (value: number) => void;
  effectiveMonth: string;
  setEffectiveMonth: (value: string) => void;
  runSample: () => void;
  calculating: boolean;
  archived: boolean;
  previewError: string;
  previewGuidance?: string;
  previewDetails?: string;
  previewValidationFields?: { name: string; message: string }[];
  previewFields: string[];
  onCorrect: (field: string) => void;
  calculation?: SalaryTemplateCalculation;
  versions: SalaryTemplateVersion[];
};
export default function SalaryTemplateReview({
  salaryBasis,
  setSalaryBasis,
  readOnly,
  previewCurrent,
  hasPreviewed,
  busy,
  sampleAmount,
  setSampleAmount,
  effectiveMonth,
  setEffectiveMonth,
  runSample,
  calculating,
  archived,
  previewError,
  previewGuidance,
  previewDetails,
  previewValidationFields,
  previewFields,
  onCorrect,
  calculation,
  versions,
}: Props) {
  return (
    <Box display="grid" gap={2}>
      <Box
        component="section"
        id="salary-sample-calculation"
        aria-label="Salary preview"
        tabIndex={-1}
      >
        <SectionCard
          title="Salary preview"
          paperProps={{
            sx: {
              mb: 0,
              borderColor: 'divider',
              boxShadow: 'none',
              transition: 'none',
              '&:hover': { boxShadow: 'none' },
            },
          }}
          gridProps={{ spacing: 0, sx: { display: 'block' } }}
          headerContent={
            <Chip
              size="small"
              variant="outlined"
              label={
                previewCurrent
                  ? 'Preview ready'
                  : hasPreviewed
                    ? 'Preview needs refresh'
                    : 'Preview required'
              }
            />
          }
        >
          <Typography variant="body2" color="text.secondary" mb={2}>
            Full-month estimate before attendance, unpaid leave, and monthly adjustments. Actual
            payable salary is calculated in Run Payroll.
          </Typography>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Default salary basis"
                value={salaryBasis}
                disabled={busy || readOnly}
                onChange={(event) => setSalaryBasis(event.target.value as SalaryBasis)}
              >
                <MenuItem value="EMPLOYER_COST">Monthly cost to school (CTC)</MenuItem>
                <MenuItem value="GROSS">Monthly salary</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ShakingTextField>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  disabled={busy}
                  name="sampleMonthlyAmount"
                  id="salary-preview-monthly-amount"
                  label={
                    salaryBasis === 'EMPLOYER_COST'
                      ? 'Monthly cost to school (CTC)'
                      : 'Monthly salary'
                  }
                  value={sampleAmount}
                  error={Boolean(previewError && previewFields.includes('monthlyAmount'))}
                  slotProps={{
                    htmlInput: {
                      inputMode: 'decimal',
                      'aria-describedby': previewError ? 'salary-preview-error' : undefined,
                    },
                  }}
                  decimalScale={2}
                  roundToWholeRupees={false}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || floatValue <= 100000000
                  }
                  onValueChange={({ floatValue }) => setSampleAmount(floatValue ?? 0)}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} id="salary-preview-effective-month">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Preview month"
                  disabled={busy}
                  views={['year', 'month']}
                  openTo="month"
                  format="MMMM YYYY"
                  value={effectiveMonth ? dayjs(`${effectiveMonth}-01`) : null}
                  onChange={(value) =>
                    setEffectiveMonth(value?.isValid() ? value.format('YYYY-MM') : '')
                  }
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      name: 'sampleEffectiveMonth',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: 'flex', justifyContent: 'flex-end', alignSelf: 'center' }}
            >
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:calculator" />}
                loading={calculating}
                onClick={runSample}
                disabled={archived || calculating || busy}
              >
                {hasPreviewed ? 'Refresh preview' : 'Preview salary'}
              </LoadingButton>
            </Grid>
          </Grid>
          {previewError ? (
            <Alert id="salary-preview-error" severity="error" sx={{ mt: 2 }}>
              {previewError}
              {previewDetails && <Typography variant="body2">{previewDetails}</Typography>}
              {previewGuidance && <Typography variant="body2">{previewGuidance}</Typography>}
              {previewValidationFields?.map((field, index) => (
                <Typography key={`${field.name}-${index}`} variant="body2">
                  {field.name}: {field.message}
                </Typography>
              ))}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {previewFields.map((field) => (
                  <Button key={field} size="small" color="inherit" onClick={() => onCorrect(field)}>
                    {field === 'rules'
                      ? 'Review earning rules'
                      : field === 'deductions'
                        ? 'Review deduction rules'
                        : field === 'pfRuleId'
                          ? 'Review PF rule'
                          : field === 'effectiveMonth'
                            ? 'Review preview month'
                            : 'Review monthly amount'}
                  </Button>
                ))}
              </Box>
            </Alert>
          ) : null}
          {calculation ? (
            <Box sx={{ mt: 2 }} aria-live="polite">
              <SalaryTotals
                gross={calculation.grossSalary}
                deductions={calculation.totalDeductions}
                net={calculation.netSalary}
                employerCost={calculation.employerCost}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    calculation.pfRuleId
                      ? `PF · Rule version ${calculation.pfRuleVersion}`
                      : 'PF · Not applied'
                  }
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    calculation.employeeStateInsurance.managementMode === 'EXTERNAL'
                      ? 'ESIC · Handled outside ShikshaMitra'
                      : `ESIC · ${calculation.employeeStateInsurance.policyName || 'Selected policy'} · ${formatRuleLabel(calculation.employeeStateInsurance.coverageDecision || 'not evaluated')}`
                  }
                />
              </Box>
              {!calculation.targetResult.isExact && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  The preview differs from the requested amount by{' '}
                  {formatCurrency(calculation.targetResult.difference)}. Review the selected rules.
                </Alert>
              )}
            </Box>
          ) : null}
          {archived && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Archived templates cannot be recalculated.
            </Typography>
          )}
        </SectionCard>
      </Box>
      {calculation ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {[
            { title: 'Regular earnings', lines: calculation.earnings },
            { title: 'Deductions', lines: calculation.deductions },
            { title: 'Employer contributions', lines: calculation.employerContributions },
          ].map(({ title, lines }) => (
            <SectionCard
              key={title}
              title={title}
              paperProps={{
                sx: {
                  mb: 0,
                  minWidth: 0,
                  boxShadow: 'none',
                  transition: 'none',
                  '&:hover': { boxShadow: 'none' },
                },
              }}
              gridProps={{ spacing: 0, sx: { display: 'block' } }}
            >
              {!lines.length ? (
                <Typography variant="body2" color="text.secondary">
                  None for this sample.
                </Typography>
              ) : null}
              {lines.map((line) => (
                <Box key={line.code} display="flex" justifyContent="space-between" gap={2} py={0.5}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {line.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(line.amount)}
                  </Typography>
                </Box>
              ))}
            </SectionCard>
          ))}
          {calculation.warnings.map((warning) => (
            <Alert key={warning} severity="warning" sx={{ gridColumn: '1 / -1' }}>
              {formatRuleLabel(warning)}
            </Alert>
          ))}
        </Box>
      ) : null}
      {versions.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" mb={1}>
            Version history
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {versions.map((item) => (
              <Chip
                key={item.id}
                label={`Version ${item.versionNumber} - ${formatRuleLabel(item.status)}`}
              />
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
