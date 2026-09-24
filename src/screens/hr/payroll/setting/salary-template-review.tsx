import type {
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
import { Box, Card, Chip, Grid, Alert, Button, Typography, CardContent } from '@mui/material';

import { formatRuleLabel } from './salary-template-editor-utils';

type Props = {
  serverError: string;
  onReload: () => void;
  templateId?: string;
  issues: string[];
  readOnly: boolean;
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
  onEditSection: (section: 'Basic Information' | 'Earnings' | 'Deductions') => void;
};
export default function SalaryTemplateReview({
  serverError,
  onReload,
  templateId,
  issues,
  readOnly,
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
  onEditSection,
}: Props) {
  return (
    <Box display="grid" gap={2}>
      <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
        {(['Basic Information', 'Earnings', 'Deductions'] as const).map((section) => (
          <Button
            key={section}
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:pencil-outline" />}
            onClick={() => onEditSection(section)}
          >
            {readOnly ? 'View' : 'Edit'} {section}
          </Button>
        ))}
      </Box>
      {serverError ? (
        <Alert
          severity="error"
          action={
            templateId ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" />}
                onClick={onReload}
              >
                Reload
              </Button>
            ) : undefined
          }
        >
          {serverError}
        </Alert>
      ) : null}
      {issues.length ? (
        <Alert severity="warning">
          <Typography variant="subtitle2">Complete these items before saving:</Typography>
          <Box component="ul" sx={{ pl: 2.5, mb: 0 }}>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </Box>
        </Alert>
      ) : (
        <Alert severity={!readOnly && previewCurrent ? 'success' : 'info'}>
          {readOnly
            ? 'This version is read-only. Existing salary setups remain unchanged.'
            : previewCurrent
              ? 'This sample is valid. You can save the active version.'
              : 'Calculate the current rules to enable Save.'}
        </Alert>
      )}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Sample calculation</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preview the current rules before saving. This sample validates the selected amount;
            employee eligibility is checked during salary generation.
          </Typography>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid size={{ xs: 12, sm: 5 }}>
              <ShakingTextField>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  name="sampleMonthlyAmount"
                  label="Sample monthly amount"
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
            <Grid size={{ xs: 12, sm: 5 }}>
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
              size={{ xs: 12, sm: 2 }}
              sx={{ display: 'flex', justifyContent: 'flex-end', alignSelf: 'center' }}
            >
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:calculator" />}
                loading={calculating}
                onClick={runSample}
                disabled={
                  archived ||
                  calculating ||
                  issues.length > 0 ||
                  !Number.isFinite(sampleAmount) ||
                  sampleAmount <= 0 ||
                  !effectiveMonth
                }
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
        </CardContent>
      </Card>
      {calculation ? (
        <Box>
          {[
            { title: 'Regular earnings', lines: calculation.earnings },
            { title: 'Deductions', lines: calculation.deductions },
            { title: 'Employer contributions', lines: calculation.employerContributions },
          ].map(({ title, lines }) => (
            <Card key={title} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" mb={1}>
                  {title}
                </Typography>
                {!lines.length ? (
                  <Typography variant="body2" color="text.secondary">
                    None for this sample.
                  </Typography>
                ) : null}
                {lines.map((line) => (
                  <Box
                    key={line.code}
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    py={0.5}
                  >
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
              </CardContent>
            </Card>
          ))}
          {calculation.warnings.map((warning) => (
            <Alert key={warning} severity="warning" sx={{ mt: 1 }}>
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
