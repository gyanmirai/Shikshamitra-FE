import type { FormikProps } from 'formik';
import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { useGetPFQuery } from 'src/redux/PF/PFApi';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Alert,
  Select,
  Switch,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import SalaryTemplateRules from './salary-template-rules';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

import type { EditorValues } from './salary-template-form-model';

type Props = {
  formik: FormikProps<EditorValues>;
  readOnly: boolean;
  componentNames: Map<string, string>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onReveal: (id: string) => void;
  onAdd: (kind: SalaryTemplateRule['lineKind']) => void;
  issues: string[];
};
export default function SalaryTemplateConfigure({
  formik,
  readOnly,
  componentNames,
  expanded,
  onToggle,
  onReveal,
  onAdd,
  issues,
}: Props) {
  const { data: pfData, isError: pfError } = useGetPFQuery({});
  const pfRules = (pfData?.items || []).filter((rule: { isActive: boolean }) => rule.isActive);
  const pfFormulaPresent = formik.values.rules.some(
    (rule) => rule.formulaType === 'EMPLOYEE_PROVIDENT_FUND'
  );
  const common = { formik, readOnly, componentNames, expanded, onToggle, onReveal };
  return (
    <Box display="grid" gap={3}>
      {issues.length > 0 && (
        <Alert severity="warning">
          <Typography variant="subtitle2">
            Complete the configuration before calculating:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </Box>
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Box
          component="section"
          id="salary-basic-information"
          aria-label="Basic Information"
          tabIndex={-1}
          sx={{ display: 'flex', minWidth: 0 }}
        >
          <SectionCard
            title="Basic Information"
            paperProps={{
              sx: {
                mb: 0,
                flex: 1,
                minWidth: 0,
                p: { xs: 2, md: 3 },
                borderColor: 'divider',
                boxShadow: 'none',
                transition: 'none',
                '&:hover': { boxShadow: 'none' },
              },
            }}
            gridProps={{ spacing: 0 }}
          >
            <Grid container rowSpacing={3} columnSpacing={2} sx={{ width: 1, minWidth: 0, pt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                  <TextField
                    size="small"
                    fullWidth
                    required
                    label="Template name"
                    slotProps={{ inputLabel: { shrink: true } }}
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
                  slotProps={{ inputLabel: { shrink: true } }}
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
                  >
                    <MenuItem value="PROTECT_EMPLOYER_COST">Protect employer cost</MenuItem>
                    <MenuItem value="PROTECT_GROSS">Protect gross salary</MenuItem>
                    <MenuItem value="PROTECT_TAKE_HOME">Protect take-home salary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Saving creates a new active version for future salary setups. Existing employee
                  salary revisions stay unchanged.
                </Typography>
              </Grid>
            </Grid>
          </SectionCard>
        </Box>
        <Box
          component="section"
          id="salary-statutory-defaults"
          aria-label="Statutory Defaults"
          tabIndex={-1}
          sx={{ display: 'flex', minWidth: 0 }}
        >
          <SectionCard
            title="Statutory Defaults"
            paperProps={{
              sx: {
                mb: 0,
                flex: 1,
                minWidth: 0,
                p: { xs: 2, md: 3 },
                borderColor: 'divider',
                boxShadow: 'none',
                transition: 'none',
                '&:hover': { boxShadow: 'none' },
              },
            }}
            gridProps={{ spacing: 0 }}
          >
            <Box sx={{ width: 1, minWidth: 0 }}>
              <Grid container spacing={2} sx={{ width: 1, minWidth: 0 }}>
                <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12 }}>
                  <FormControl
                    size="small"
                    fullWidth
                    disabled={readOnly || !pfFormulaPresent || pfError}
                    error={formik.touched.defaultPfRuleId && Boolean(formik.errors.defaultPfRuleId)}
                  >
                    <InputLabel id="salary-template-pf" shrink>
                      Default PF rule
                    </InputLabel>
                    <Select
                      size="small"
                      notched
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
                      {(formik.touched.defaultPfRuleId && formik.errors.defaultPfRuleId) ||
                        (!pfFormulaPresent ? 'Add a PF deduction to choose its default rule.' : '')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              {pfError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  PF rules could not be loaded.
                </Alert>
              ) : null}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Professional Tax and ESI use system rules.
              </Typography>
              <Box
                component="details"
                sx={{
                  mt: 1,
                  '& > summary': {
                    cursor: 'pointer',
                    typography: 'body2',
                    color: 'text.primary',
                    py: 0.5,
                    borderRadius: 0.5,
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  },
                }}
              >
                <Box component="summary">How statutory rules apply</Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  PF can default from this template version. Professional Tax uses effective
                  statutory rules. ESI eligibility and both contributions are recalculated from
                  establishment, enrollment, wage classifications, effective month, and current
                  rules. ESI cannot be edited here.
                </Typography>
              </Box>
            </Box>
          </SectionCard>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <SalaryTemplateRules {...common} lineKind="EARNING" onAdd={() => onAdd('EARNING')} />
        <SalaryTemplateRules {...common} lineKind="DEDUCTION" onAdd={() => onAdd('DEDUCTION')} />
      </Box>
    </Box>
  );
}
