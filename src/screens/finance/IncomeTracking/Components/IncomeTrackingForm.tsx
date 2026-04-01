import { Box } from '@mui/material';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import IncomeFormFields from './IncomeFormFields';
import IncomeFormActions from './IncomeFormActions';
import { useIncomeForm } from '../hooks/useIncomeForm';

import type { IIncomeTrackingFormProps } from '../types';

const IncomeTrackingForm: React.FC<IIncomeTrackingFormProps> = ({ open, onClose, editData }) => {
  const {
    formik,
    incomeCategoryOptions,
    paymentMethodOptions,
    currentYear,
    addLoading,
    updateLoading,
    incomeOptionsLoading,
  } = useIncomeForm(onClose, editData);

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    incomeDetails: true,
    additionalNotes: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const handleSubmit = useCallback(() => {
    const fieldToPanelMap: Record<string, string> = {
      categoryId: 'incomeDetails',
      categoryTags: 'incomeDetails',
      name: 'incomeDetails',
      amount: 'incomeDetails',
      paymentMethod: 'incomeDetails',
      paymentDate: 'incomeDetails',
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

  if (!open.value) return null;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <IncomeFormFields
            formik={formik}
            incomeCategoryOptions={incomeCategoryOptions?.items || []}
            paymentMethodOptions={paymentMethodOptions}
            currentYear={currentYear}
            incomeOptionsLoading={incomeOptionsLoading}
            expandedPanels={expandedPanels}
            onAccordionToggle={handleAccordionToggle}
          />
        </Scrollbar>

        <IncomeFormActions
          onClose={onClose}
          isLoading={addLoading || updateLoading}
          isEdit={!!editData}
          onSubmit={handleSubmit}
        />
      </Box>
    </BackPopUpChecked>
  );
};

export default IncomeTrackingForm;
