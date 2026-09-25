import type { FormikProps } from 'formik';
import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { useGetPFQuery } from 'src/redux/PF/PFApi';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Card,
  Grid,
  Alert,
  Select,
  Switch,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import SalaryTemplateRules from './salary-template-rules';

import type { EditorValues } from './salary-template-form-model';

type Props = {
  formik: FormikProps<EditorValues>;
  readOnly: boolean;
  componentNames: Map<string, string>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (kind: SalaryTemplateRule['lineKind']) => void;
  onAddProfessionalTax: () => void;
  issues: string[];
};
export default function SalaryTemplateConfigure({
  formik,
  readOnly,
  componentNames,
  expanded,
  onToggle,
  onAdd,
  onAddProfessionalTax,
  issues,
}: Props) {
  const { data: pfData, isError: pfError } = useGetPFQuery({});
  const pfRules = (pfData?.items || []).filter((rule: { isActive: boolean }) => rule.isActive);
  const pfFormulaPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND'
  );
  const common = { formik, readOnly, componentNames, expanded, onToggle };
  return (
    <Box display="grid" gap={3}>
      {issues.length > 0 && (
        <Alert severity="warning">
          <Typography variant="subtitle2">Complete the configuration before reviewing:</Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </Box>
        </Alert>
      )}
      <Card
        component="section"
        id="salary-basic-information"
        tabIndex={-1}
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Typography variant="h6" mb={2}>
          Basic Information
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Saving creates a new active version for future salary setups. Existing employee salary
              revisions stay unchanged.
            </Alert>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
              <TextField
                size="small"
                fullWidth
                required
                label="Template name"
                disabled={readOnly}
                {...formik.getFieldProps('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              fullWidth
              label="Description"
              disabled={readOnly}
              {...formik.getFieldProps('description')}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small" disabled={readOnly}>
              <InputLabel id="salary-template-basis">Default salary basis</InputLabel>
              <Select
                size="small"
                labelId="salary-template-basis"
                label="Default salary basis"
                {...formik.getFieldProps('defaultSalaryBasis')}
              >
                <MenuItem value="EMPLOYER_COST">Employer cost</MenuItem>
                <MenuItem value="GROSS">Gross salary</MenuItem>
                <MenuItem value="TAKE_HOME">Take-home salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small" disabled={readOnly}>
              <InputLabel id="salary-template-protection">Protection policy</InputLabel>
              <Select
                size="small"
                labelId="salary-template-protection"
                label="Protection policy"
                {...formik.getFieldProps('defaultProtectionPolicy')}
                onChange={(event) => {
                  formik.setFieldValue('defaultProtectionPolicy', event.target.value);
                  formik.setFieldValue('defaultSalaryBasis', event.target.value === 'PROTECT_TAKE_HOME' ? 'TAKE_HOME' : 'EMPLOYER_COST');
                }}
              >
                <MenuItem value="PROTECT_EMPLOYER_COST">Protect school cost (CTC)</MenuItem>
                <MenuItem value="PROTECT_TAKE_HOME">Protect employee take-home</MenuItem>
                {formik.values.defaultProtectionPolicy === 'PROTECT_GROSS' && (
                  <MenuItem value="PROTECT_GROSS" disabled>Legacy gross protection: choose a new policy</MenuItem>
                )}
              </Select>
              <FormHelperText>
                {formik.values.defaultProtectionPolicy === 'PROTECT_TAKE_HOME'
                  ? 'The school covers PT, employee PF and ESI by adjusting gross. Other deductions still reduce payout.'
                  : 'Gross adjusts to keep recurring gross plus employer contributions within the agreed CTC.'}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Card>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <SalaryTemplateRules {...common} lineKind="EARNING" onAdd={() => onAdd('EARNING')} />
        <Box display="grid" gap={2} minWidth={0}>
          <SalaryTemplateRules {...common} lineKind="DEDUCTION" onAdd={() => onAdd('DEDUCTION')} />
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Statutory deductions
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose PT and PF for this template. ESI is calculated automatically from statutory coverage.
              </Typography>
              <FormControlLabel
                label="Apply Professional Tax (PT)"
                control={
                  <Switch
                    disabled={readOnly}
                    checked={formik.values.rules.some((rule) => rule.semanticType === 'PROFESSIONAL_TAX')}
                    onChange={(_, checked) => {
                      if (checked) onAddProfessionalTax();
                      else formik.setFieldValue('rules', formik.values.rules
                        .filter((rule) => rule.semanticType !== 'PROFESSIONAL_TAX')
                        .map((rule, displayOrder) => ({ ...rule, displayOrder })));
                    }}
                  />
                }
              />
              <Typography variant="body2" color="text.secondary" mb={2}>
                PT uses the applicable effective slab. The package protection policy determines how gross adjusts.
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.defaultPfApplicable}
                        disabled={readOnly}
                        onChange={(_, checked) =>
                          formik.setFieldValue('defaultPfApplicable', checked)
                        }
                        inputProps={{ 'aria-label': 'PF applicable by default' }}
                      />
                    }
                    label="PF applicable by default"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <FormControl
                    size="small"
                    fullWidth
                    disabled={readOnly || !pfFormulaPresent || pfError}
                    error={formik.touched.defaultPfRuleId && Boolean(formik.errors.defaultPfRuleId)}
                  >
                    <InputLabel id="salary-template-pf">Default PF rule</InputLabel>
                    <Select
                      size="small"
                      labelId="salary-template-pf"
                      label="Default PF rule"
                      {...formik.getFieldProps('defaultPfRuleId')}
                      error={
                        formik.touched.defaultPfRuleId && Boolean(formik.errors.defaultPfRuleId)
                      }
                    >
                      {pfRules.map((rule: any) => (
                        <MenuItem key={rule.id} value={rule.id}>
                          {rule.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {formik.touched.defaultPfRuleId && formik.errors.defaultPfRuleId}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              {pfError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  PF rules could not be loaded.
                </Alert>
              ) : null}
              <Alert severity="info" sx={{ mt: 2 }}>
                ESI is system-managed. Eligibility and both contributions are recalculated from
                establishment, enrollment, wage classifications, effective month, and current rules.
                ESI cannot be edited here.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
