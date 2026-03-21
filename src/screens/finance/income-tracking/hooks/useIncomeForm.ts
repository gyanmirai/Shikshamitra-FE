import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetIncomeCategoriesQuery } from 'src/redux/finance/incomeCategory';
import {
  useAddIncomeTrackingMutation,
  useUpdateIncomeTrackingMutation,
} from 'src/redux/finance/income-tracking-management/incomeTracking';

import { getInitialIncomeData } from '../components/IncomeInitialValues';
import { getIncomeFormSchema } from '../components/IncomeValidationSchema';

import type { IIncomeRecord } from '../types';

// Payment method options derived directly from the enum
export const paymentMethodOptions = Object.entries(PaymentMethodLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const useIncomeForm = (
  onClose: (e: any, isSubmit?: boolean) => void,
  editData: IIncomeRecord | null
) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Fetch income category options
  const { data: incomeOptionsData, isLoading: incomeOptionsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
    },
  });

  // Mutations
  const [addIncomeTracking, { isLoading: addLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddIncomeTrackingMutation,
  });

  const [updateIncomeTracking, { isLoading: updateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateIncomeTrackingMutation,
  });

  const initialValues = useMemo(() => getInitialIncomeData(editData), [editData]);
  const validationSchema = useMemo(() => getIncomeFormSchema(currentYear), [currentYear]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Payload matches the API contract exactly
        const payload = {
          categoryId: values.categoryId,
          name: values.name,
          categoryTags: values.categoryTags || [],
          amount: values.amount,
          paymentMethod: values.paymentMethod, // integer enum
          paymentDate: values.paymentDate?.toISOString(),
          notes: values.notes || null,
        };

        if (editData?.id) {
          await updateIncomeTracking({
            incomeId: editData.id,
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Income Tracking "${values.name}" updated successfully!`,
          });
        } else {
          await addIncomeTracking({
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Income Tracking "${values.name}" added successfully!`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} income tracking`,
        });
      }
    },
  });

  /**
   * Memoization Justification:
   * Memoize options to prevent unnecessary re-renders of Select components.
   */
  const incomeCategoryOptions = useMemo(() => incomeOptionsData || [], [incomeOptionsData]);

  return {
    formik,
    incomeCategoryOptions,
    paymentMethodOptions,
    currentYear,
    addLoading,
    updateLoading,
    incomeOptionsLoading,
  };
};
