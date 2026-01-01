import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Card, Grid, Paper, Button, TextField, IconButton, Typography } from '@mui/material';

import { RenderPfRules } from './RenderPfRules';
import PayrollComponentDialog from './PayrollComponentDialog';
import { CardActions, SectionCard } from './InformationFields';

import type { FieldsType } from './types';

export const RenderComponents = ({ formik, name, label, type, showTempAdd = false }: any) => {
  const { values } = formik;
  const components = values[name] || [];
  const isDialogOpen = useBoolean();
  const isAddingTemp = useBoolean(false);

  const handleAdd = (selectedNames: string[]) => {
    formik.setFieldValue(name, selectedNames);
    // Reset temp add mode after adding
    if (isAddingTemp.value) {
      isAddingTemp.onFalse();
    }
  };

  const handleRemove = (index: number) => {
    const updatedComponents = components.filter((_: any, i: number) => i !== index);
    formik.setFieldValue(name, updatedComponents);
  };

  return (
    <Box mt={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          sx={{
            borderLeft: (theme) =>
              `4px solid ${type === 'earning' ? theme.palette.success.main : theme.palette.error.main}`,
            pl: 1,
          }}
        >
          {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {showTempAdd && (
            <Button
              variant="soft"
              color="warning"
              startIcon={<Add />}
              size="small"
              onClick={() => {
                isAddingTemp.onTrue();
                isDialogOpen.onTrue();
              }}
            >
              Temp {type === 'earning' ? 'Earning' : 'Deduction'}
            </Button>
          )}
          <Button
            variant="soft"
            startIcon={<Add />}
            onClick={() => {
              isAddingTemp.onFalse();
              isDialogOpen.onTrue();
            }}
            size="small"
          >
            {type === 'earning' ? 'Earning' : 'Deduction'}
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {components.map((component: any, index: number) => {
          const { isFixed } = component;
          // If it's fixed, we don't show inputs. If it's not fixed, we show Amount.
          // We never show "Type" dropdown as per requirement.

          return (
            <Card
              key={index}
              sx={{
                p: 2,
                position: 'relative',
                boxShadow: (theme) => theme.customShadows.z4,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={isFixed ? 0 : 2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Iconify
                    icon={
                      type === 'earning'
                        ? 'solar:wallet-money-bold-duotone'
                        : 'solar:minus-circle-bold-duotone'
                    }
                    color={type === 'earning' ? 'success.main' : 'error.main'}
                    width={18}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {component?.componentName || component?.name}
                  </Typography>

                  {isFixed && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        bgcolor: 'background.neutral',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      Fixed Value
                    </Typography>
                  )}
                  {isFixed && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        bgcolor: 'background.neutral',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      ₹ {formatNumber(component.amount) || '10,000'}
                    </Typography>
                  )}
                  {component.isTemp && <Label color="warning">Temp</Label>}
                  {!isFixed && (
                    <ShakingTextField
                      error={
                        formik.touched[name]?.[index]?.amount &&
                        Boolean((formik.errors[name] as any)?.[index]?.amount)
                      }
                    >
                      <NumericFormatCustom
                        fullWidth
                        size="small"
                        required
                        variant="standard"
                        label="Amount"
                        name={`${name}.${index}.amount`}
                        value={component.amount}
                        onChange={formik.handleChange}
                        error={
                          formik.touched[name]?.[index]?.amount &&
                          Boolean((formik.errors[name] as any)?.[index]?.amount)
                        }
                        helperText={
                          formik.touched[name]?.[index]?.amount &&
                          (formik.errors[name] as any)?.[index]?.amount
                        }
                        sx={{ ml: 2 }}
                      />
                    </ShakingTextField>
                  )}
                </Box>
                <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            </Card>
          );
        })}

        {components.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              bgcolor: (theme) => theme.palette.background.neutral,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No {type} components added yet. Click the button above to add.
            </Typography>
          </Paper>
        )}
      </Box>

      {isDialogOpen.value && (
        <PayrollComponentDialog
          open={isDialogOpen.value}
          onClose={isDialogOpen.onFalse}
          type={type}
          onAdd={handleAdd}
          values={components}
        />
      )}
    </Box>
  );
};

const RenderPayrollFields = (props: any) => {
  const { formik, isMainForm } = props;
  const { values, handleChange } = formik;
  const isEditable = useBoolean(isMainForm);

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <Box>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isLoading={formik.isSubmitting}
            isEdit={isEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Box>
      )}
      <SectionCard title="Payroll Details">
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.bankName && Boolean(formik.errors.bankName)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Bank Name"
              name="bankName"
              value={values.bankName || ''}
              onChange={handleChange}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.branchName && Boolean(formik.errors.branchName)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Branch Name"
              name="branchName"
              value={values.branchName || ''}
              onChange={handleChange}
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              helperText={formik.touched.branchName && formik.errors.branchName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Account Holder Name"
              name="accountHolderName"
              value={values.accountHolderName || ''}
              onChange={handleChange}
              error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
              helperText={formik.touched.accountHolderName && formik.errors.accountHolderName}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Account Number"
              name="accountNumber"
              type="number"
              value={values.accountNumber || ''}
              onChange={handleChange}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="IFSC Code"
              name="ifscCode"
              value={values.ifscCode || ''}
              onChange={handleChange}
              error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
              helperText={formik.touched.ifscCode && formik.errors.ifscCode}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RenderPfRules
            disabled={!isEditable.value}
            formik={formik}
            // value={values.pfRule || ''}
            // onChange={(e) => setFormValues({ ...formValues, pfRule: e.target?.value ?? e })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.epfNumber && Boolean(formik.errors.epfNumber)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="EPF Number"
              name="epfNumber"
              value={values.epfNumber || ''}
              onChange={handleChange}
              error={formik.touched.epfNumber && Boolean(formik.errors.epfNumber)}
              helperText={formik.touched.epfNumber && formik.errors.epfNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.uanNumber && Boolean(formik.errors.uanNumber)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="UAN Number"
              name="uanNumber"
              value={values.uanNumber || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 12) {
                  formik.handleChange(e);
                  formik.validateField('uanNumber');
                }
              }}
              error={formik.touched.uanNumber && Boolean(formik.errors.uanNumber)}
              helperText={formik.touched.uanNumber && formik.errors.uanNumber}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.basicSalary && Boolean(formik.errors.basicSalary)}
          >
            <TextField
              size="small"
              type="number"
              fullWidth
              disabled={!isEditable.value}
              label="Basic Salary"
              name="basicSalary"
              value={values.basicSalary || ''}
              onChange={handleChange}
              error={formik.touched.basicSalary && Boolean(formik.errors.basicSalary)}
              helperText={formik.touched.basicSalary && formik.errors.basicSalary}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.punchId && Boolean(formik.errors.punchId)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Punch Id"
              name="punchId"
              value={values.punchId || ''}
              onChange={handleChange}
              error={formik.touched.punchId && Boolean(formik.errors.punchId)}
              helperText={formik.touched.punchId && formik.errors.punchId}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={formik.touched.tdsPercentage && Boolean(formik.errors.tdsPercentage)}
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="TDS Percentage"
              name="tdsPercentage"
              type="number"
              value={values.tdsPercentage || ''}
              onChange={handleChange}
              error={formik.touched.tdsPercentage && Boolean(formik.errors.tdsPercentage)}
              helperText={formik.touched.tdsPercentage && formik.errors.tdsPercentage}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.tdsAmount && Boolean(formik.errors.tdsAmount)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="TDS Amount"
              name="tdsAmount"
              type="number"
              value={values.tdsAmount || ''}
              onChange={handleChange}
              error={formik.touched.tdsAmount && Boolean(formik.errors.tdsAmount)}
              helperText={formik.touched.tdsAmount && formik.errors.tdsAmount}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="earningComponents"
            label="Earning Components"
            type="earning"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RenderComponents
            formik={formik}
            name="deductionComponents"
            label="Deduction Components"
            type="deduction"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp(props) {
      return <RenderPayrollFields {...props} />;
    },
  },
];
