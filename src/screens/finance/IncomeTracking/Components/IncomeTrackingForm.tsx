import React from 'react';
import { Box } from '@mui/material';
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

  if (!open.value) return null;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <IncomeFormFields
              formik={formik}
              incomeCategoryOptions={incomeCategoryOptions?.items || []}
              paymentMethodOptions={paymentMethodOptions}
              currentYear={currentYear}
              incomeOptionsLoading={incomeOptionsLoading}
            />
          </Scrollbar>

          <IncomeFormActions
            onClose={onClose}
            isLoading={addLoading || updateLoading}
            isEdit={!!editData}
          />
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default IncomeTrackingForm;
