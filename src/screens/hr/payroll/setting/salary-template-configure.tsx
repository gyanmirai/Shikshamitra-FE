import type { FormikProps } from 'formik';
import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { useContext } from 'react';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { HrSetupTaskContext } from 'src/screens/hr/setup/hr-setup-editor-context';
import {
  Box,
  Grid,
  Alert,
  Button,
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

import { EsiPolicyFields } from './esi-policy-fields';
import SalaryTemplateRules from './salary-template-rules';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

import type { EditorValues } from './salary-template-form-model';

type Props = {
  previewMonth: string;
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
  previewMonth,
  formik,
  readOnly,
  componentNames,
  expanded,
  onToggle,
  onReveal,
  onAdd,
  issues,
}: Props) {
  const openTask = useContext(HrSetupTaskContext);
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
          <Typography variant="subtitle2">Complete the configuration before previewing:</Typography>
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
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Saving creates a new active version for future salary setups. Existing staff
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
              {openTask && pfFormulaPresent && !pfError && (
                <Button size="small" disabled={readOnly} onClick={() => openTask('pf')}>
                  Create required PF rule
                </Button>
              )}
              {pfError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  PF rules could not be loaded.
                </Alert>
              ) : null}
              <Box sx={{ mt: 2 }}>
                <EsiPolicyFields
                  mode={formik.values.defaultEsiManagementMode}
                  policyId={formik.values.defaultEsiPolicyId}
                  reason={formik.values.defaultEsiExternalReason}
                  month={previewMonth}
                  disabled={readOnly}
                  onChange={({ mode, policyId, reason }) =>
                    formik.setValues({
                      ...formik.values,
                      defaultEsiManagementMode: mode,
                      defaultEsiPolicyId: policyId,
                      defaultEsiExternalReason: reason,
                    })
                  }
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Professional Tax uses effective statutory rules.
              </Typography>
              {openTask &&
                formik.values.rules.some((rule) => rule.formulaType === 'PROFESSIONAL_TAX') && (
                  <Button
                    size="small"
                    disabled={readOnly}
                    onClick={() => openTask('professional-tax')}
                  >
                    Configure required Professional Tax rule
                  </Button>
                )}
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
                  PF and ESIC policies default from this template. ESIC eligibility remains based on
                  staff enrollment, wage classifications, and the payroll month. Professional Tax
                  uses effective statutory rules.
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
