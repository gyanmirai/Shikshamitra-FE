import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import ExpenseFormFields from './ExpenseFormFields';
import { useExpenseForm } from '../hooks/useExpenseForm';

import type { IExpenseFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseFormProps> = ({ open, onClose, editData }) => {
  const {
    formik,
    isSubmitting,
    categoryOptions,
    paymentMethodsConfig,
    paymentMethodOptions,
    currentYear,
  } = useExpenseForm({ onClose, editData });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <ExpenseFormFields
              formik={formik}
              categoryOptions={categoryOptions}
              currentYear={currentYear}
              paymentMethodsConfig={paymentMethodsConfig}
              paymentMethodOptions={paymentMethodOptions}
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
              type="submit"
              size="small"
              variant="contained"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
