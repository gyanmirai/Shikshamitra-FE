'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  usePutAccountHeadMutation,
  usePostAccountHeadMutation,
} from 'src/redux/finance/accountHeadApi';
import {
  Grid,
  Chip,
  Button,
  Switch,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

import { IAccountHeadFormProps } from './type';
import { AccountHeadInitialValues } from './AccountHeadInitialValues';
import { AccountHeadValidationSchema } from './AccountHeadValidationSchema';

const HEAD_TYPES = [
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
  { value: 'Bank-Cash', label: 'Bank-Cash' },
  { value: 'Liability', label: 'Liability' },
];

const LINKED_SOURCES = [
  { value: 'FeeHead', label: 'Fee Head' },
  { value: 'ChargeCategory', label: 'Charge Category' },
  { value: 'IncomeCategory', label: 'Income Category' },
  { value: 'ExpenseCategory', label: 'Expense Category' },
  { value: 'BankAccount', label: 'Bank Account' },
  { value: 'PayrollComponent', label: 'Payroll Component' },
  { value: 'Manual', label: 'Manual' },
];

const AccountHeadForm: React.FC<IAccountHeadFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [addAccountHead, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostAccountHeadMutation,
  });

  const [updateAccountHead, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutAccountHeadMutation,
  });

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    basicInfo: true,
    linkedSourcesPanel: true,
    balancePanel: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const formik = useFormik({
    initialValues: editData
      ? {
          ...AccountHeadInitialValues,
          ...editData,
        }
      : AccountHeadInitialValues,
    validationSchema: AccountHeadValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await performSubmission(values);
    },
  });

  const performSubmission = async (values: any) => {
    try {
      const payload = {
        ...values,
      };

      if (editData?.id) {
        await updateAccountHead({
          id: editData.id,
          body: payload,
        }).unwrap();
        shikshaMitraToast.success({ message: `Account Head updated successfully` });
      } else {
        await addAccountHead({
          ...payload,
          academicYearId: currentYear?.id,
        }).unwrap();
        shikshaMitraToast.success({ message: `Account Head added successfully` });
      }
      onClose(null, true);
    } catch (error) {
      console.error('Save operation failed:', error);
      shikshaMitraToast.error({
        message: `Failed to ${editData ? 'update' : 'create'} account head`,
      });
    }
  };

  const handleSubmit = useCallback(() => {
    formik.validateForm().then((errors) => {
      formik.handleSubmit();
    });
  }, [formik]);

  const derivedNature = useMemo(() => {
    switch (formik.values.headType) {
      case 'Income':
      case 'Liability':
        return 'Credit';
      case 'Expense':
        return 'Debit';
      case 'Bank-Cash':
        return 'Asset';
      default:
        return '';
    }
  }, [formik.values.headType]);

  useEffect(() => {
    if (derivedNature && formik.values.nature !== derivedNature) {
      formik.setFieldValue('nature', derivedNature);
    }
  }, [derivedNature, formik.values.nature, formik]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Section: Basic Info */}
        <Accordion
          expanded={expandedPanels.basicInfo}
          onChange={() => handleAccordionToggle('basicInfo')}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px !important',
            mb: 1.5,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2" fontWeight={700}>
              Basic Info
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.headName && Boolean(formik.errors.headName)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Head Name *"
                    name="headName"
                    value={formik.values.headName}
                    onChange={formik.handleChange}
                    error={formik.touched.headName && Boolean(formik.errors.headName)}
                    helperText={formik.touched.headName && formik.errors.headName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.headType && Boolean(formik.errors.headType)}
                >
                  <CustomSelect
                    label="Head Type *"
                    options={HEAD_TYPES}
                    value={formik.values.headType}
                    onChange={(val) => formik.setFieldValue('headType', val)}
                    formControlProps={{ fullWidth: true, size: 'small' }}
                    error={formik.touched.headType && Boolean(formik.errors.headType)}
                    helperText={(formik.touched.headType && formik.errors.headType) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
                {derivedNature && (
                  <Chip label={`Nature: ${derivedNature}`} color="primary" variant="outlined" />
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isActive}
                      onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                      name="isActive"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section: Linked Sources */}
        <Accordion
          expanded={expandedPanels.linkedSourcesPanel}
          onChange={() => handleAccordionToggle('linkedSourcesPanel')}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px !important',
            mb: 1.5,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2" fontWeight={700}>
              Linked Sources
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={formik.touched.linkedSources && Boolean(formik.errors.linkedSources)}
                >
                  <Autocomplete
                    multiple
                    id="linkedSources"
                    options={LINKED_SOURCES}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={
                      LINKED_SOURCES.filter((source) =>
                        formik.values.linkedSources?.includes(source.value)
                      ) || []
                    }
                    onChange={(_, newValue) => {
                      formik.setFieldValue(
                        'linkedSources',
                        newValue.map((v) => v.value)
                      );
                    }}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox style={{ marginRight: 8 }} checked={selected} />
                          {option.label}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Linked Sources *"
                        size="small"
                        error={formik.touched.linkedSources && Boolean(formik.errors.linkedSources)}
                        helperText={
                          (formik.touched.linkedSources && formik.errors.linkedSources) as string
                        }
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return <Chip size="small" key={key} label={option.label} {...tagProps} />;
                      })
                    }
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section: Balance & Notes */}
        <Accordion
          expanded={expandedPanels.balancePanel}
          onChange={() => handleAccordionToggle('balancePanel')}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px !important',
            mb: 1.5,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2" fontWeight={700}>
              Balance & Notes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Opening Balance *"
                  name="openingBalance"
                  value={formik.values.openingBalance || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[₹,\s]/g, '');
                    formik.setFieldValue('openingBalance', Number(val));
                  }}
                  error={!!(formik.touched.openingBalance && formik.errors.openingBalance)}
                  helperText={formik.touched.openingBalance && formik.errors.openingBalance}
                  sx={{
                    width: '100%',
                    padding: '0',
                    borderRadius: 1,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  label="Notes"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="button"
          variant="contained"
          size="small"
          loading={isAddLoading || isUpdateLoading}
          disabled={isAddLoading || isUpdateLoading}
          onClick={handleSubmit}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AccountHeadForm;
