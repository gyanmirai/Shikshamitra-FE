import React from 'react';
import { Box } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import IncomeFormFields from './IncomeFormFields';
import IncomeFormActions from './IncomeFormActions';
import { useIncomeForm } from '../hooks/useIncomeForm';

import type { IIncomeTrackingFormProps } from '../types';

const IncomeTrackingForm: React.FC<IIncomeTrackingFormProps> = ({ open, onClose, editData }) => {
  const { formik, isLoading, incomeCategoryOptions, paymentMethodOptions, currentYear } =
    useIncomeForm(onClose, editData);

  // If dialog is not open, render nothing or lightweight placeholder
  // But usually it's controlled by parent.
  if (!open.value) return null;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <IncomeFormFields
              formik={formik}
              incomeCategoryOptions={incomeCategoryOptions}
              paymentMethodOptions={paymentMethodOptions}
              currentYear={currentYear}
            />
          </Scrollbar>

          <IncomeFormActions onClose={onClose} isLoading={isLoading} isEdit={!!editData} />
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default IncomeTrackingForm;
