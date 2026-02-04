import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetPaymentMethodsConfigQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';
import {
  useGetIncomeTrackingQuery,
  useAddIncomeTrackingMutation,
  useUpdateIncomeTrackingMutation,
} from 'src/redux/finance/incomeTrackingManagement/incomeTracking';

import { getInitialIncomeData } from '../Components/IncomeInitialValues';
import { getIncomeFormSchema } from '../Components/IncomeValidationSchema';

import type { IIncomeFormValues } from '../types';

export const useIncomeForm = (
  onClose: (e: any, isSubmit?: boolean) => void,
  editData: IIncomeFormValues | null
) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch income options
  const { data: incomeOptionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeTrackingQuery,
  });

  // Mutations
  const { addIncomeTracking } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddIncomeTrackingMutation,
  });

  const { updateIncomeTracking } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateIncomeTrackingMutation,
  });

  const { data: paymentMethodsConfigData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentMethodsConfigQuery,
  });
  const paymentMethodOptions = useMemo(
    () =>
      incomeOptionsData?.paymentMethodOptions ||
      Object.keys(paymentMethodsConfigData || {}).map((method) => ({
        value: method,
        label: method,
      })),
    [incomeOptionsData?.paymentMethodOptions, paymentMethodsConfigData]
  );

  const initialValues = useMemo(() => getInitialIncomeData(editData), [editData]);
  const validationSchema = useMemo(() => getIncomeFormSchema(currentYear), [currentYear]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        const payload = {
          academicYearId: currentYear?.id,
          categoryId: values.incomeCategory,
          name: values.incomeName,
          categoryTags: values.incomeCategoryTags || [],
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          paymentDate: values.date?.toISOString(),
          notes: values.notes || '',
        };

        if (editData?.id) {
          await updateIncomeTracking({
            incomeId: editData.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Income Tracking "${values.incomeName}" updated successfully!`,
          });
        } else {
          await addIncomeTracking(payload).unwrap();
          shikshaMitraToast.success({
            message: `Income Tracking "${values.incomeName}" added successfully!`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} income tracking`,
        });
      } finally {
        setIsLoading(false);
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
    isLoading,
    incomeCategoryOptions,
    paymentMethodOptions,
    currentYear,
  };
};
