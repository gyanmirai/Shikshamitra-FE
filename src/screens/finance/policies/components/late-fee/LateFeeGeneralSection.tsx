'use client';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import CustomAccordion from 'src/components/custom-accordian';
import {
  Grid,
  Select,
  Switch,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

interface LateFeeGeneralSectionProps {
  formik: any;
  academicYears: any[];
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeGeneralSection({
  formik,
  academicYears,
  expanded,
  onToggle,
}: LateFeeGeneralSectionProps) {
  return (
    <CustomAccordion
      title="1. General Information"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Grid container spacing={2.5} p={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.academicYearId && Boolean(formik.errors.academicYearId)}
            >
              <InputLabel>Academic Year *</InputLabel>
              <Select
                label="Academic Year *"
                name="academicYearId"
                value={formik.values.academicYearId}
                onChange={formik.handleChange}
              >
                {academicYears?.map((y: any) => (
                  <MenuItem key={y.id} value={y.id}>
                    {y.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Policy Name *"
              name="policyName"
              value={formik.values.policyName}
              onChange={formik.handleChange}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={formik.touched.policyName && (formik.errors.policyName as string)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Policy Code (Auto)"
              name="policyCode"
              value={formik.values.policyCode}
              slotProps={{ input: { readOnly: true } }}
              sx={{ '& input': { color: 'text.secondary' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Priority"
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              helperText="Processing order of multiple matching policies"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Effective From *"
              value={formik.values.effectiveFrom ? dayjs(formik.values.effectiveFrom) : null}
              onChange={(date) =>
                formik.setFieldValue('effectiveFrom', date ? date.toISOString() : null)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: formik.touched.effectiveFrom && Boolean(formik.errors.effectiveFrom),
                  helperText:
                    formik.touched.effectiveFrom && (formik.errors.effectiveFrom as string),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Effective To"
              value={formik.values.effectiveTo ? dayjs(formik.values.effectiveTo) : null}
              onChange={(date) =>
                formik.setFieldValue('effectiveTo', date ? date.toISOString() : null)
              }
              minDate={formik.values.effectiveFrom ? dayjs(formik.values.effectiveFrom) : undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: formik.touched.effectiveTo && Boolean(formik.errors.effectiveTo),
                  helperText: formik.touched.effectiveTo && (formik.errors.effectiveTo as string),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.isDefault}
                  onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
                />
              }
              label={<Typography variant="body2">Set as Default Late Fee Policy</Typography>}
            />
          </Grid>
        </Grid>
      }
    />
  );
}
