'use client';

import type { FormikProps } from 'formik';
import type { SalaryBasis } from 'src/redux/hr/salary-template-api';

import { useState, useEffect } from 'react';
import { fDate } from 'src/utils/format-time';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Calculate, ExpandMore, AutoAwesome } from '@mui/icons-material';
import { useGetEsiEstablishmentQuery } from 'src/redux/hr/statutory-scheme-api';
import {
  useCalculateSalaryTemplateMutation,
  useGetPublishedSalaryTemplatesQuery,
} from 'src/redux/hr/salary-template-api';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Paper,
  Button,
  Select,
  Switch,
  Divider,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  ToggleButton,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { buildAppliedSalaryStructure } from './salary-structure-builder-utils';

type Props = {
  formik: FormikProps<any>;
};

const Summary = ({ label, value }: { label: string; value: number }) => (
  <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="subtitle1" fontWeight={700}>
      {formatCurrency(value)}
    </Typography>
  </Paper>
);

export function SalaryStructureBuilder({ formik }: Props) {
  const {
    data: templateData,
    isLoading: templatesLoading,
    isError: templatesError,
  } = useGetPublishedSalaryTemplatesQuery();
  const { data: pfData, isError: pfRulesError } = useGetPFQuery({});
  const { data: esiEstablishment } = useGetEsiEstablishmentQuery();
  const [calculate, calculationState] = useCalculateSalaryTemplateMutation();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>('GROSS');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(
    Number(formik.values.quotedMonthlyAmount || 0)
  );
  const [pfApplicable, setPfApplicable] = useState(Boolean(formik.values.pfRule));
  const [pfRuleId, setPfRuleId] = useState<string>(formik.values.pfRule || '');
  const [calculationInputKey, setCalculationInputKey] = useState('');
  const [attemptedInputKey, setAttemptedInputKey] = useState('');

  useEffect(() => {
    setSelectedTemplateId(formik.values.sourceSalaryTemplateId || '');
    setSalaryBasis(formik.values.quotedSalaryBasis === 'TAKE_HOME' ? 'TAKE_HOME' : 'GROSS');
    setMonthlyAmount(Number(formik.values.quotedMonthlyAmount || 0));
    setPfApplicable(Boolean(formik.values.pfRule));
    setPfRuleId(formik.values.pfRule || '');
    setCalculationInputKey('');
    setAttemptedInputKey('');
  }, [
    formik.values.pfRule,
    formik.values.quotedMonthlyAmount,
    formik.values.quotedSalaryBasis,
    formik.values.salaryGeneratedAt,
    formik.values.sourceSalaryTemplateId,
    formik.values.sourceSalaryTemplateVersionId,
  ]);

  const templates =
    templateData?.items?.filter((item) => item.status === 'PUBLISHED' && item.published) || [];
  const defaultTemplate = templates.find((item) => item.isDefault) || templates[0];
  const effectiveTemplateId = selectedTemplateId || defaultTemplate?.id || '';
  const selectedTemplate = templates.find((item) => item.id === effectiveTemplateId);
  const today = new Date().toISOString().slice(0, 10);
  const pfRules = (pfData?.items || []).filter(
    (rule: any) =>
      rule.isActive !== false &&
      (!rule.effectiveFrom || rule.effectiveFrom.slice(0, 10) <= today) &&
      (!rule.effectiveTo || rule.effectiveTo.slice(0, 10) >= today)
  );
  const effectivePfRuleId = pfApplicable
    ? pfRules.some((rule: any) => rule.id === pfRuleId)
      ? pfRuleId
      : pfRules[0]?.id || ''
    : '';
  const currentInputKey = [
    selectedTemplate?.published?.id,
    salaryBasis,
    monthlyAmount,
    effectivePfRuleId,
  ].join('|');
  const result = calculationInputKey === currentInputKey ? calculationState.data : undefined;

  const handleCalculate = async () => {
    if (!selectedTemplate?.published?.id || monthlyAmount <= 0) return;
    setAttemptedInputKey(currentInputKey);
    try {
      await calculate({
        templateVersionId: selectedTemplate.published.id,
        salaryBasis,
        monthlyAmount,
        pfRuleId: effectivePfRuleId || null,
      }).unwrap();
      setCalculationInputKey(currentInputKey);
    } catch {
      setCalculationInputKey('');
    }
  };

  const handleApply = () => {
    if (!result) return;
    const applied = buildAppliedSalaryStructure(
      result,
      formik.values.earningComponents,
      formik.values.deductionComponents
    );
    Object.entries(applied).forEach(([field, value]) => formik.setFieldValue(field, value, false));
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <AutoAwesome color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Build salary structure
          </Typography>
          <Chip label="Smart filler" color="primary" variant="soft" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter the school&apos;s quoted monthly salary, review the calculation, then apply it to
          the editable component lists below.
        </Typography>

        {formik.values.sourceSalaryTemplateVersion && (
          <Alert
            severity={formik.values.wasModifiedAfterGeneration ? 'warning' : 'info'}
            sx={{ mb: 2 }}
          >
            Generated from template version {formik.values.sourceSalaryTemplateVersion}
            {formik.values.salaryGeneratedAt ? ` on ${fDate(formik.values.salaryGeneratedAt)}` : ''}
            {formik.values.wasModifiedAfterGeneration ? '. Components were edited afterward.' : '.'}
          </Alert>
        )}

        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Salary template</InputLabel>
              <Select
                label="Salary template"
                value={effectiveTemplateId}
                disabled={templatesLoading}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} {template.isDefault ? '(Default)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={salaryBasis}
              onChange={(_event, value: SalaryBasis | null) => value && setSalaryBasis(value)}
              aria-label="Quoted salary basis"
            >
              <ToggleButton value="GROSS">Gross</ToggleButton>
              <ToggleButton value="TAKE_HOME">Take-home</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Quoted monthly salary"
              value={monthlyAmount || ''}
              inputProps={{ min: 1, step: 0.01 }}
              onChange={(event) => setMonthlyAmount(Number(event.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={
                calculationState.isLoading ? <CircularProgress size={16} /> : <Calculate />
              }
              disabled={
                !selectedTemplate ||
                monthlyAmount <= 0 ||
                calculationState.isLoading ||
                (pfApplicable && !effectivePfRuleId)
              }
              onClick={handleCalculate}
            >
              Calculate
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pfApplicable}
                  onChange={(event) => setPfApplicable(event.target.checked)}
                />
              }
              label="PF applicable"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormControl fullWidth size="small" disabled={!pfApplicable}>
              <InputLabel>PF rule</InputLabel>
              <Select
                label="PF rule"
                value={effectivePfRuleId}
                onChange={(event) => setPfRuleId(event.target.value)}
              >
                {pfRules.map((rule: any) => (
                  <MenuItem key={rule.id} value={rule.id}>
                    {rule.name} - {rule.employeePercentage}% employee
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {templatesError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Salary templates could not be loaded. Try again before calculating.
          </Alert>
        )}
        {!templatesLoading && !templatesError && templates.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Publish a salary template in Payroll settings before using this builder.
          </Alert>
        )}
        {pfApplicable && pfRulesError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            PF rules could not be loaded. Turn off PF or try again.
          </Alert>
        )}
        {pfApplicable && !pfRulesError && pfRules.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No effective PF rule is available. Turn off PF or configure an active rule.
          </Alert>
        )}

        {esiEstablishment?.status === 'Active' ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            ESI is system-managed. Payroll will evaluate coverage and calculate both employee and
            employer contributions from statutory wages, even when this template has no ESI row.
          </Alert>
        ) : esiEstablishment?.status === 'Ready' ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ESI setup is ready but not active. Complete the impact review in Payroll settings before
            relying on ESI calculations.
          </Alert>
        ) : null}

        {calculationState.isError && attemptedInputKey === currentInputKey && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Unable to calculate this salary structure. Review the amount, template, and statutory
            rule selections.
          </Alert>
        )}

        {result && (
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Gross" value={result.grossSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Basic" value={result.basicSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Deductions" value={result.totalDeductions} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Net salary" value={result.netSalary} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Employer contributions" value={result.employerContributionTotal} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Summary label="Employer cost" value={result.employerCost} />
              </Grid>
            </Grid>
            {result.warnings.map((warning) => (
              <Alert key={warning} severity="warning" sx={{ mt: 1.5 }}>
                {warning}
              </Alert>
            ))}
            <Accordion
              disableGutters
              elevation={0}
              sx={{ mt: 1.5, border: 1, borderColor: 'divider' }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Formula breakdown</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {result.formulaTrace.map((line) => (
                  <Typography key={line} variant="body2" color="text.secondary" gutterBottom>
                    {line}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
            <Box display="flex" justifyContent="flex-end" mt={1.5}>
              <Button variant="contained" onClick={handleApply}>
                Apply to earnings and deductions
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Grid>
  );
}
