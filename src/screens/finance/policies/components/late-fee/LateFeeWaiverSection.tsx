'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import {
  Grid,
  Switch,
  Checkbox,
  FormGroup,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

interface LateFeeWaiverSectionProps {
  formik: any;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeWaiverSection({
  formik,
  expanded,
  onToggle,
}: LateFeeWaiverSectionProps) {
  return (
    <CustomAccordion
      title="6. Waiver & Approval Configurations"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Grid container spacing={2.5} p={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.waiverAllowed}
                  onChange={(e) => formik.setFieldValue('waiverAllowed', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">Allow partial/full waivers of late fees</Typography>
              }
            />
          </Grid>

          {formik.values.waiverAllowed && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Maximum Waiver Percentage (%)"
                  name="maximumWaiverPercentage"
                  value={formik.values.maximumWaiverPercentage ?? ''}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formik.values.approvalRequired}
                      onChange={(e) => formik.setFieldValue('approvalRequired', e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Require manager approval before applying waivers
                    </Typography>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formik.values.reasonMandatory}
                      onChange={(e) => formik.setFieldValue('reasonMandatory', e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">Force staff to type waiver reason notes</Typography>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" mb={1} color="text.secondary">
                  Allowed Roles to Process/Approve Fines:
                </Typography>
                <FormGroup row>
                  {['Accountant', 'Finance Manager', 'Principal', 'Super Admin'].map((role) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Checkbox
                          size="small"
                          checked={formik.values.waiveRoleIds.includes(role)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formik.values.waiveRoleIds, role]
                              : formik.values.waiveRoleIds.filter((r: string) => r !== role);
                            formik.setFieldValue('waiveRoleIds', next);
                          }}
                        />
                      }
                      label={<Typography variant="caption">{role}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </>
          )}
        </Grid>
      }
    />
  );
}
