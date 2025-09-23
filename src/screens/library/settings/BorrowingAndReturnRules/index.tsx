'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, TextField, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetBorrowingReturnRulesQuery } from 'src/redux/library/settingApi';

// Base validation schema for a single field
const createFieldValidationSchema = () =>
  Yup.number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const cleaned = originalValue.replace(/[^0-9]/g, '');
        return cleaned === '' ? null : Number(cleaned);
      }
      return value;
    })
    .nullable()
    .min(0, 'Must be at least 0')
    .max(99, 'Maximum 99 books allowed')
    .integer('Must be a whole number');

const BorrowingReturnRules = () => {
  // State for managing rules data
  const [rulesData, setRulesData] = useState<any>([]);
  const [originalRulesData, setOriginalRulesData] = useState<any[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  // Dialog control states
  const resetDialog = useBoolean();
  const saveDialog = useBoolean();

  // Fetch borrowing return rules data
  const { data: fetchedRulesData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBorrowingReturnRulesQuery,
  });

  // Create initial values for formik based on rulesData
  const getInitialValues = () => {
    const values: any = {};
    rulesData.forEach((rule: any) => {
      values[`${rule.id}_maxBooksPerMonth`] = rule.maxBooksPerMonth || 0;
      values[`${rule.id}_reservationLimit`] = rule.reservationLimit || 0;
    });
    return values;
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: Yup.object().shape(
      rulesData.reduce((schema: any, rule: any) => {
        schema[`${rule.id}_maxBooksPerMonth`] = createFieldValidationSchema();
        schema[`${rule.id}_reservationLimit`] = createFieldValidationSchema();
        return schema;
      }, {})
    ),
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave();
    },
  });

  // Initialize data when fetched
  useEffect(() => {
    if (fetchedRulesData) {
      setRulesData(fetchedRulesData);
      setOriginalRulesData(fetchedRulesData);
    }
  }, [fetchedRulesData]);

  // Handle field changes
  const handleFieldChange = (id: string, field: string, value: string) => {
    const fieldName = `${id}_${field}`;
    const numericValue = parseInt(value, 10);
    const finalValue = Number.isNaN(numericValue) ? null : numericValue;

    // Update formik values
    formik.setFieldValue(fieldName, finalValue);
    formik.setFieldTouched(fieldName, true);

    // Update rulesData state
    setRulesData((prev: any) =>
      prev.map((rule: { id: string; [key: string]: any }) =>
        rule.id === id ? { ...rule, [field]: finalValue } : rule
      )
    );
  };

  // Handle reset functionality
  const handleReset = () => {
    setRulesData(originalRulesData);
    formik.resetForm();
    resetDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Borrowing & Return Rules have been reset successfully',
    });
  };

  // Handle save button click - validate first before opening dialog
  const handleSaveClick = async () => {
    // Validate all fields first
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      // Mark all fields as touched to show errors
      const touchedFields: any = {};
      Object.keys(formik.values).forEach((key) => {
        touchedFields[key] = true;
      });
      formik.setTouched(touchedFields);
      return;
    }

    // If validation passes, open save dialog
    saveDialog.onTrue();
  };

  // Handle save functionality (called after confirmation)
  const handleSave = async () => {
    setSaveLoading(true);

    try {
      saveDialog.onFalse();
      shikshaMitraToast.success({
        message: 'Borrowing & Return Rules have been saved successfully',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: 'Failed to save borrowing & return rules',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Check if there are any changes
  const hasChanges = JSON.stringify(rulesData) !== JSON.stringify(originalRulesData);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Borrowing & Return Rules"
        description="This screen sets the borrowing policies for different member roles, including maximum books allowed, reservation limits, and applicable late return fines."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/setting' },
          { name: 'Borrowing & Return Rules', href: '/library/settings/borrowing-return-rules' },
        ]}
        action={
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              onClick={() => resetDialog.onTrue()}
              disabled={!hasChanges || saveLoading}
              size="small"
            >
              Reset
            </Button>
            <LoadingButton
              loading={saveLoading}
              startIcon={!saveLoading ? <Save /> : undefined}
              variant="contained"
              onClick={handleSaveClick}
              disabled={!hasChanges}
              size="small"
            >
              Save
            </LoadingButton>
          </Box>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        tableId="borrowing-return-rules-table"
        isLoading={isLoading}
        isPagination={false}
        isSearch={false}
        isFilter={false}
        columns={[
          {
            id: 'role',
            label: 'Role',
            align: 'left',
            isSort: false,
            isFilter: false,
            render: (value) => (
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
            ),
          },
          {
            id: 'maxBooksPerMonth',
            label: 'Max Books (Month)',
            align: 'left',
            isSort: false,
            isFilter: false,
            render: (value, row) => {
              const fieldName = `${row.id}_maxBooksPerMonth`;

              return (
                <Box mb={2}>
                  <ShakingTextField
                    error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
                  >
                    <TextField
                      size="small"
                      type="number"
                      label="Max Books (Month)"
                      value={value === 0 ? '0' : value || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 2) {
                          handleFieldChange(row.id, 'maxBooksPerMonth', val);
                        }
                      }}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      sx={{ width: '100%' }}
                      inputProps={{ min: 0, max: 99, maxLength: 2 }}
                      error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
                      helperText={(formik.touched[fieldName] && formik.errors[fieldName]) as string}
                      disabled={saveLoading}
                    />
                  </ShakingTextField>
                </Box>
              );
            },
          },
          {
            id: 'reservationLimit',
            label: 'Reservation Limit (Month)',
            align: 'left',
            isSort: false,
            isFilter: false,
            render: (value, row) => {
              const fieldName = `${row.id}_reservationLimit`;

              return (
                <Box mb={2}>
                  <ShakingTextField
                    error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
                  >
                    <TextField
                      size="small"
                      type="number"
                      label="Reservation Limit (Month)"
                      value={value === 0 ? '0' : value || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 2) {
                          handleFieldChange(row.id, 'reservationLimit', val);
                        }
                      }}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      sx={{ width: '100%' }}
                      inputProps={{ min: 0, max: 99, maxLength: 2 }}
                      error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
                      helperText={(formik.touched[fieldName] && formik.errors[fieldName]) as string}
                      disabled={saveLoading}
                    />
                  </ShakingTextField>
                </Box>
              );
            },
          },
        ]}
        data={rulesData || []}
      />

      <ConfirmDialog
        open={resetDialog.value}
        onClose={() => !saveLoading && resetDialog.onFalse()}
        title="Reset"
        content="Are you sure you want to reset all borrowing & return rules to original values?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            variant="contained"
            size="small"
            onClick={handleReset}
            disabled={saveLoading}
          >
            Reset
          </Button>
        }
      />

      <ConfirmDialog
        open={saveDialog.value}
        onClose={() => !saveLoading && saveDialog.onFalse()}
        title="Save"
        content="Are you sure you want to save these borrowing & return rules changes?"
        action={
          <LoadingButton
            loading={saveLoading}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
            size="small"
            onClick={handleSave}
          >
            Save
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default BorrowingReturnRules;
