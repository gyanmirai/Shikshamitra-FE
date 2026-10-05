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
import { Box, Chip, Grid, Alert, Typography } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { formatRuleLabel } from './salary-template-editor-utils';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

type Props = {
  salaryBasis: SalaryBasis;
  previewCurrent: boolean;
  sampleAmount: number;
  setSampleAmount: (value: number) => void;
  effectiveMonth: string;
  setEffectiveMonth: (value: string) => void;
  runSample: () => void;
  calculating: boolean;
  archived: boolean;
  previewError: string;
  calculation?: SalaryTemplateCalculation;
  versions: SalaryTemplateVersion[];
};
export default function SalaryTemplateReview({
  salaryBasis,
  previewCurrent,
  sampleAmount,
  setSampleAmount,
  effectiveMonth,
  setEffectiveMonth,
  runSample,
  calculating,
  archived,
  previewError,
  calculation,
  versions,
}: Props) {
  return (
    <Box display="grid" gap={2}>
      <Box
        component="section"
        id="salary-sample-calculation"
        aria-label="Sample calculation"
        tabIndex={-1}
      >
        <SectionCard
          title="Sample calculation"
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
              label={previewCurrent ? 'Current sample' : 'Sample only'}
            />
          }
        >
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preview the current rules before saving. This sample validates the selected amount;
            staff eligibility is checked during salary generation.
          </Typography>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <ShakingTextField>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  name="sampleMonthlyAmount"
                  label={
                    salaryBasis === 'EMPLOYER_COST'
                      ? 'Monthly cost to school (CTC)'
                      : 'Monthly salary'
                  }
                  value={sampleAmount}
                  decimalScale={2}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || floatValue <= 100000000
                  }
                  onValueChange={({ floatValue }) => setSampleAmount(floatValue ?? 0)}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Sample effective month"
                  views={['year', 'month']}
                  openTo="month"
                  format="MMMM YYYY"
                  value={effectiveMonth ? dayjs(`${effectiveMonth}-01`) : null}
                  onChange={(value) =>
                    setEffectiveMonth(value?.isValid() ? value.format('YYYY-MM') : '')
                  }
                  slotProps={{
                    textField: { size: 'small', fullWidth: true, name: 'sampleEffectiveMonth' },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{ xs: 12, md: 2 }}
              sx={{ display: 'flex', justifyContent: 'flex-end', alignSelf: 'center' }}
            >
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:calculator" />}
                loading={calculating}
                onClick={runSample}
                disabled={archived || calculating}
              >
                Calculate
              </LoadingButton>
            </Grid>
          </Grid>
          {previewError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {previewError}
            </Alert>
          ) : null}
          {calculation ? (
            <Grid
              container
              spacing={1}
              mt={1}
              aria-live="polite"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {[
                ['Full-month Gross', calculation.grossSalary],
                [
                  'Allocated regular earnings',
                  calculation.earnings.reduce((sum, line) => sum + line.amount, 0),
                ],
                ['Deductions', calculation.totalDeductions],
                ['Net salary', calculation.netSalary],
                ['Employer contributions', calculation.employerContributionTotal],
                ['Employer cost', calculation.employerCost],
                ['Target difference', calculation.targetResult.difference],
              ].map(([label, amount]) => (
                <Grid
                  key={String(label)}
                  size={{ xs: 6, md: 4 }}
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="subtitle1">{formatCurrency(Number(amount))}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(Number(amount) * 12)} yearly
                  </Typography>
                </Grid>
              ))}
            </Grid>
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
