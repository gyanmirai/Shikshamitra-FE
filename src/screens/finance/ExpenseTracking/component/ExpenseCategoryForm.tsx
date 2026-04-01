import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
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
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
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

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onClose(null, false)}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={16}
                height={16}
              />
            }
            type="button"
            size="small"
            variant="contained"
            loading={addLoading || updateLoading}
            disabled={addLoading || updateLoading}
            onClick={handleSubmit}
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
