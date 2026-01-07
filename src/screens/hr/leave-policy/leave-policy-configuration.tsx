'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
// Icons
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  Box,
  Card,
  Chip,
  Grid,
  Step,
  Stack,
  Button,
  Drawer,
  Switch,
  Slider,
  Stepper,
  Tooltip,
  MenuItem,
  TextField,
  StepLabel,
  Typography,
  IconButton,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import { DEFAULT_LEAVE_TYPES } from './types';

import type { LeavePolicyConfig } from './types';

// Validation for the drawer form
const validationSchema = Yup.object().shape({
  annualQuota: Yup.number().required('Required').min(0),
  maxCarryForwardDays: Yup.number().when('carryForwardAllowed', {
    is: true,
    then: (schema) => schema.required('Required when Carry Forward is enabled'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const LeavePolicyConfiguration = () => {
  const [policies, setPolicies] = useState<LeavePolicyConfig[]>(DEFAULT_LEAVE_TYPES);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicyConfig | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleEditClick = (policy: LeavePolicyConfig) => {
    setSelectedPolicy(policy);
    setIsDrawerOpen(true);
    setActiveStep(0); // Reset stepper
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedPolicy(null);
  };

  // Formik for the side drawer
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: selectedPolicy || DEFAULT_LEAVE_TYPES[0], // Fallback to avoid null errors primarily
    validationSchema,
    onSubmit: (values) => {
      // Update the policies list
      setPolicies((prev) => prev.map((p) => (p.id === values.id ? { ...p, ...values } : p)));
      handleDrawerClose();
    },
  });

  const { values, handleChange, setFieldValue, handleSubmit, touched, errors } = formik;

  // Stepper content
  const steps = ['Accrual Logic', 'Carry Forward', 'Encashment'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Accrual Logic
        return (
          <Stack spacing={3} mt={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Define how leaves are credited to the employee account.
            </Typography>

            <TextField
              fullWidth
              select
              label="Accrual Frequency"
              name="accrualFrequency"
              value={values.accrualFrequency}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Quarterly">Quarterly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </TextField>

            <Box>
              <Typography gutterBottom variant="caption">
                Annual Quota: {values.annualQuota} Days
              </Typography>
              <Slider
                value={values.annualQuota}
                onChange={(_, val) => setFieldValue('annualQuota', val)}
                valueLabelDisplay="auto"
                min={0}
                max={60}
                step={0.5}
              />
            </Box>

            {values.accrualFrequency === 'Monthly' && (
              <Box p={2} bgcolor="background.neutral" borderRadius={1} border="1px dashed #ccc">
                <Typography variant="body2">
                  <strong>Impact:</strong> Employees will receive approximately{' '}
                  <strong>{(values.annualQuota / 12).toFixed(2)}</strong> days per month.
                </Typography>
              </Box>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={values.proRata}
                  onChange={(e) => setFieldValue('proRata', e.target.checked)}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2">Pro-rata Accrual</Typography>
                  <Tooltip title="Calculate based on joining date">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Stack>
              }
            />
          </Stack>
        );
      case 1: // Carry Forward
        return (
          <Stack spacing={3} mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.carryForwardAllowed}
                  onChange={(e) => setFieldValue('carryForwardAllowed', e.target.checked)}
                />
              }
              label="Enable Carry Forward"
            />

            {values.carryForwardAllowed && (
              <TextField
                fullWidth
                label="Max Carry Forward Days"
                name="maxCarryForwardDays"
                type="number"
                value={values.maxCarryForwardDays || ''}
                onChange={handleChange}
                size="small"
              />
            )}
          </Stack>
        );
      case 2: // Encashment
        return (
          <Stack spacing={3} mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.encashable}
                  onChange={(e) => setFieldValue('encashable', e.target.checked)}
                />
              }
              label="Allow Leave Encashment"
            />

            {values.encashable && (
              <TextField
                fullWidth
                label="Max Encashable Days"
                name="encashmentLimit"
                type="number"
                value={values.encashmentLimit || ''}
                onChange={handleChange}
                size="small"
                helperText="Limit applied at time of separation or year-end"
              />
            )}
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Leave Policies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage leave types, accruals, and permissions.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Leave Type
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {policies.map((policy) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={policy.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #E0E0E0',
                borderRadius: 3,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 4, borderColor: 'primary.main', cursor: 'pointer' },
              }}
              onClick={() => handleEditClick(policy)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Chip
                    label={policy.code}
                    color="primary"
                    variant={policy.isPaid ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {policy.name}
                </Typography>

                <Stack spacing={1} mt={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarMonthIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {policy.annualQuota} Days / Year
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {policy.carryForwardAllowed && (
                      <Chip label="Carry Fwd" size="small" variant="soft" />
                    )}
                    {policy.encashable && (
                      <Chip label="Encashable" size="small" variant="soft" color="success" />
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Configuration Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 0 } }}
      >
        {selectedPolicy && (
          <Box height="100%" display="flex" flexDirection="column">
            {/* Drawer Header */}
            <Box p={3} borderBottom="1px solid #eee">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Configure {selectedPolicy.name}
                </Typography>
                <IconButton onClick={handleDrawerClose}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Drawer Content */}
            <Box flex={1} overflow="auto" p={3}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box mt={4}>{renderStepContent(activeStep)}</Box>
            </Box>

            {/* Drawer Footer */}
            <Box p={3} borderTop="1px solid #eee" bgcolor="background.paper">
              <Stack direction="row" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={() => handleSubmit()}>
                    Save & Close
                  </Button>
                ) : (
                  <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
                    Next
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default LeavePolicyConfiguration;
