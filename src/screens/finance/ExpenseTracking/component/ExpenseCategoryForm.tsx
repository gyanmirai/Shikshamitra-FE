import { LoadingButton } from '@mui/lab';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import ExpenseFormFields from './ExpenseFormFields';
import { useExpenseForm } from '../hooks/useExpenseForm';

import type { IExpenseFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseFormProps> = ({ open, onClose, editData }) => {
  const {
    formik,
    addLoading,
    updateLoading,
    categoryOptions,
    paymentMethodOptions,
    currentYear,
    categoryOptionsLoading,
  } = useExpenseForm({ onClose, editData });

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    expenseDetails: true,
    additionalNotes: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const handleSubmit = useCallback(() => {
    const fieldToPanelMap: Record<string, string> = {
      categoryId: 'expenseDetails',
      categoryTags: 'expenseDetails',
      name: 'expenseDetails',
      amount: 'expenseDetails',
      paymentDate: 'expenseDetails',
      paymentMethod: 'expenseDetails',
      notes: 'additionalNotes',
    };

    formik.validateForm().then((errors) => {
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const panelsToOpen: Record<string, boolean> = {};
        errorKeys.forEach((key) => {
          if (fieldToPanelMap[key]) {
            panelsToOpen[fieldToPanelMap[key]] = true;
          }
        });
        setExpandedPanels((prev) => ({ ...prev, ...panelsToOpen }));
      }
      formik.handleSubmit();
    });
  }, [formik]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar
          sx={{
            height: '100%',
            p: 2,
          }}
        >
          <ExpenseFormFields
            formik={formik}
            categoryOptions={categoryOptions?.items || []}
            currentYear={currentYear}
            paymentMethodOptions={paymentMethodOptions}
            categoryOptionsLoading={categoryOptionsLoading}
            expandedPanels={expandedPanels}
            onAccordionToggle={handleAccordionToggle}
          />

        </Scrollbar>

        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onClose(null, false)}
            color="inherit"
            disabled={addLoading || updateLoading}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            loading={addLoading || updateLoading}
            disabled={addLoading || updateLoading}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={16}
                height={16}
              />
            }
            onClick={handleSubmit}
            type="button"
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </Box>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
