import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatCurrency } from 'src/utils/cureencyFormater';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Paper, Button, TextField, Typography } from '@mui/material';

import { RenderPfRules } from './RenderPfRules';
import PayrollComponentDialog from './PayrollComponentDialog';
import { CardActions, SectionCard } from './InformationFields';
import PayrollTempComponentDialog from './PayrollTempComponentDialog';
import { isSalaryComponentFixed, isPercentageSalaryComponent } from '../salary-utils';

import type { FieldsType } from './types';

export const RenderComponents = ({ formik, name, label, type, showTempAdd = false }: any) => {
  const { values } = formik;
  const components = values[name] || [];
  const isDialogOpen = useBoolean();
  const isAddingTemp = useBoolean(false);

  const handleAdd = (selectedComponents: any[]) => {
    // Preserve existing temp components so they are not lost when adding from dropdown
    const tempComponents = components.filter((c: any) => !!c?.isTemp);
    const normalized = selectedComponents.map((c: any) => {
      const cComponentId = c._id || c.componentId || c.id;
      const existing = components.find((ex: any) => (ex.componentId || ex.id) === cComponentId);
      return {
        ...c,
        id: existing?.id ?? null,
        componentId: cComponentId,
        amount: existing?.amount ?? (isPercentageSalaryComponent(c) ? null : (c.amount ?? 0)),
        applicableMonth: existing?.applicableMonth ?? null,
      };
    });
    formik.setFieldValue(name, [...tempComponents, ...normalized]);
    if (isAddingTemp.value) {
      isAddingTemp.onFalse();
    }
  };

  const handleAddTemp = (selectedValues: any) => {
    const updatedComponents = [...components, selectedValues];
    formik.setFieldValue(name, updatedComponents);
    isAddingTemp.onFalse();
  };

  const handleRemove = (index: number) => {
    const updatedComponents = components.filter((_: any, i: number) => i !== index);
    formik.setFieldValue(name, updatedComponents);
  };

  // Build table rows — attach original index for edit/delete
  const tableRows = components.map((c: any, idx: number) => ({
    _idx: idx,
    _raw: c,
    name: c?.earningComponentName || c?.deductionComponentName || c?.name || '-',
    amount: c?.amount ?? 0,
    percentage: c?.percentage ?? null,
    isFixed: isSalaryComponentFixed(c),
    isPercentage: isPercentageSalaryComponent(c),
    isTemp: !!c?.isTemp,
    applicableMonth: c?.applicableMonth,
  }));

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', mt: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={1}>
        <Typography
          variant="h6"
          sx={{
            borderLeft: (theme) =>
              `4px solid ${
                type === 'earning' ? theme.palette.success.main : theme.palette.error.main
              }`,
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
                isDialogOpen.onFalse();
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

      {/* Table */}
      <Box px={2} pb={2} sx={{ flex: 1 }}>
        <CustomizableTable
          tableId={`${name}-components-table`}
          isFilter={false}
          isPagination={false}
          isSearch={false}
          isShowedDense={false}
          data={tableRows}
          noDataText={
            <Typography variant="body2" color="text.secondary">
              No {type} components added yet. Click the button above to add.
            </Typography>
          }
          columns={[
            {
              id: 'name',
              label: 'Component',
              render(value: any, row: any) {
                return (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          borderLeft: (theme) =>
                            `3px solid ${
                              row.isTemp
                                ? theme.palette.warning.main
                                : type === 'earning'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main
                            }`,
                          pl: 1,
                        }}
                      >
                        {value}
                      </Typography>
                      {row.isTemp && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'warning.soft',
                            color: 'warning.dark',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '10px',
                          }}
                        >
                          Temp
                        </Typography>
                      )}
                    </Box>
                    {row.applicableMonth && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'background.neutral',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          color: 'text.secondary',
                        }}
                      >
                        {dayjs(row.applicableMonth).format('MMM-YYYY')}
                      </Typography>
                    )}
                  </Box>
                );
              },
            },
            {
              id: 'amount',
              label: 'Amount / %',
              render(value: any, row: any) {
                if (row.isPercentage) {
                  return (
                    <Typography variant="body2" fontWeight={500}>
                      {row.percentage != null ? `${row.percentage}%` : '-'}
                    </Typography>
                  );
                }
                if (row.isFixed) {
                  return (
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(value)}
                    </Typography>
                  );
                }
                return (
                  <NumericFormatCustom
                    size="small"
                    variant="standard"
                    label=""
                    name={`${name}.${row._idx}.amount`}
                    value={value ?? 0}
                    onChange={(e: any) => {
                      let val = e.target.value;
                      val = val.replace(/[₹,\s]/g, '');
                      if (!/^\d*$/.test(val)) return;
                      formik.setFieldValue(
                        `${name}.${row._idx}.amount`,
                        val !== '' ? Number(val) : 0
                      );
                      formik.setFieldTouched(`${name}.${row._idx}.amount`, true, false);
                    }}
                    sx={{ width: 110 }}
                  />
                );
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              isFilter: false,
              sticky: true,
              minWidth: '80px',
              render(_value: any, row: any) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showDeleteIcon
                    handleDeleteClick={() => handleRemove(row._idx)}
                  />
                );
              },
            },
          ]}
        />
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
      {isAddingTemp.value && (
        <PayrollTempComponentDialog
          open={isAddingTemp.value}
          onClose={isAddingTemp.onFalse}
          type={type}
          onAdd={handleAddTemp}
          initialValues={components}
        />
      )}
    </Paper>
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
              label="Bank Name *"
              name="bankName"
              value={values.bankName || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('bankName', newName);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('bankName', e.target.value.trim());
                formik.handleBlur(e);
              }}
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
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('branchName', newName);
                }
              }}
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
              label="Account Holder Name *"
              name="accountHolderName"
              value={values.accountHolderName || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue('accountHolderName', newName);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('accountHolderName', e.target.value.trim());
                formik.handleBlur(e);
              }}
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
              label="Account Number *"
              name="accountNumber"
              type="number"
              value={values.accountNumber || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 18) {
                  formik.setFieldValue('accountNumber', value);
                }
              }}
              onBlur={(e) => {
                formik.setFieldValue('accountNumber', e.target.value.trim());
                formik.handleBlur(e);
              }}
              inputProps={{
                min: 0,
              }}
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
              label="IFSC Code *"
              name="ifscCode"
              value={values.ifscCode || ''}
              onChange={handleChange}
              onBlur={(e) => {
                formik.setFieldValue('ifscCode', e.target.value.trim());
                formik.handleBlur(e);
              }}
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
          <ShakingTextField error={formik.touched.punchId && Boolean(formik.errors.punchId)}>
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Punch Id"
              name="punchId"
              onBlur={(e) => {
                formik.setFieldValue('punchId', e.target.value.trim());
                formik.handleBlur(e);
              }}
              value={values.punchId || ''}
              onChange={handleChange}
              error={formik.touched.punchId && Boolean(formik.errors.punchId)}
              helperText={formik.touched.punchId && formik.errors.punchId}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField
            error={
              formik.touched.totalWorkingHourPerMonth &&
              Boolean(formik.errors.totalWorkingHourPerMonth)
            }
          >
            <TextField
              size="small"
              fullWidth
              disabled={!isEditable.value}
              label="Total Working Hours (Month)"
              name="totalWorkingHourPerMonth"
              type="number"
              value={values.totalWorkingHourPerMonth || ''}
              onChange={(e) => {
                const { value } = e.target;
                if (value.length <= 3) {
                  formik.handleChange(e);
                }
              }}
              inputProps={{
                min: 0,
              }}
              error={
                formik.touched.totalWorkingHourPerMonth &&
                Boolean(formik.errors.totalWorkingHourPerMonth)
              }
              helperText={
                formik.touched.totalWorkingHourPerMonth && formik.errors.totalWorkingHourPerMonth
              }
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
