import type { PayslipSettings, SalaryDocumentPresentation } from 'src/redux/hr/payslip-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { FormSectionCard } from 'src/components/form-section-card';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { Box, Stack, Switch, Button, Typography, FormControlLabel } from '@mui/material';

import { salaryDocumentFields } from './salary-document-fields';

export default function PayslipSettingsFields({
  initial,
  presentation,
  automaticEmail,
  disabled,
  update,
  onEmailChange,
}: {
  initial: PayslipSettings;
  presentation: SalaryDocumentPresentation;
  automaticEmail: boolean;
  disabled: boolean;
  update: (key: keyof SalaryDocumentPresentation, value: unknown) => void;
  onEmailChange: (checked: boolean) => void;
}) {
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <FormSectionCard
        icon={GlobalIcons.building}
        title="School Branding"
        descriptionTooltip="School name, address and logo are shared with Institute Setup. Already-issued documents retain their original identity."
      >
        <Box sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2">
            {initial.schoolName || 'School name not configured'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'pre-line', mt: 0.5 }}
          >
            {initial.schoolAddress ||
              'Add your school address in Institute Setup before issuing documents.'}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          href={instituteSetupPaths.schoolIdentity}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          startIcon={<Iconify icon={GlobalIcons.edit} />}
        >
          Open Institute Setup
        </Button>
      </FormSectionCard>
      <FormSectionCard
        icon={GlobalIcons.documentIcon}
        title="Payslip Appearance"
        descriptionTooltip="Choose the layout and optional sections for newly issued payslips. The live PDF uses your unsaved choices."
      >
        <CustomSelect
          name="layout"
          size="small"
          fullWidth
          label="Layout"
          value={presentation.layout}
          disabled={disabled}
          options={[
            { value: 'Compact', label: 'Compact' },
            { value: 'Detailed', label: 'Detailed' },
          ]}
          onChange={(value) => update('layout', value)}
        />
        <Stack
          sx={{
            '& .MuiFormControlLabel-root': { m: 0, minWidth: 0, minHeight: 44 },
            '& .MuiFormControlLabel-label': { typography: 'body2' },
          }}
        >
          {(
            [
              ['showStaffDetails', 'Staff details'],
              ['showBankDetails', 'Bank details'],
              ['showAttendance', 'Attendance and leave'],
              ['showEarningsBreakdown', 'Earnings breakdown'],
              ['showZeroDeductions', 'Zero-value deductions'],
            ] as const
          ).map(([key, label]) => (
            <FormControlLabel
              key={key}
              label={label}
              control={
                <Switch
                  size="small"
                  name={key}
                  checked={presentation[key]}
                  disabled={disabled}
                  onChange={(_, checked) => update(key, checked)}
                />
              }
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Employee identity, period, totals, and every nonzero deduction always appear. Changes
          apply to newly issued documents.
        </Typography>
      </FormSectionCard>
      <FormSectionCard
        icon={GlobalIcons.report}
        title="Statements And Register"
        descriptionTooltip="Select optional columns for employee statement and school register exports. These choices do not affect the payslip PDF."
      >
        {(
          [
            ['statementColumns', 'Employee statement columns'],
            ['registerColumns', 'School register columns'],
          ] as const
        ).map(([key, label]) => (
          <CustomSelect
            key={key}
            name={key}
            multiple
            size="small"
            fullWidth
            label={label}
            value={presentation[key]}
            disabled={disabled}
            options={salaryDocumentFields.map(([value, name]) => ({ value, label: name }))}
            onChange={(value) => update(key, value)}
            helperText="An empty selection uses the standard columns. Identity and totals remain included."
            sx={{ '& .MuiSelect-select': { whiteSpace: 'normal', overflowWrap: 'anywhere' } }}
          />
        ))}
      </FormSectionCard>
      <FormSectionCard
        icon={GlobalIcons.email}
        title="Delivery"
        descriptionTooltip="Controls email delivery after payroll finalization. Saving this preference does not send a sample or issue payslips."
      >
        <FormControlLabel
          label="Email each employee after payroll finalization"
          sx={{ m: 0, minWidth: 0, minHeight: 44 }}
          control={
            <Switch
              size="small"
              name="automaticEmail"
              checked={automaticEmail}
              disabled={disabled}
              onChange={(_, checked) => onEmailChange(checked)}
            />
          }
        />
      </FormSectionCard>
    </Stack>
  );
}
