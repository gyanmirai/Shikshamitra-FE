import type { RootState } from 'src/redux/store';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik, type FormikHelpers } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetExpenseOptionsQuery,
  usePutExpenseDetailsMutation,
  usePostExpenseDetailsMutation,
  useGetPaymentMethodsConfigQuery,
} from 'src/redux/finance/expenseApi/expenseDetailedApi';

import { getInitialExpenseData } from '../component/ExpenseInitialValues';
import { getExpenseFormSchema } from '../component/ExpenseValidationSchema';
import { paymentMethodsConfig as localPaymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IExpenseFormProps, IExpenseFormValues } from '../component/type';

export const useExpenseForm = ({
  onClose,
  editData,
}: Pick<IExpenseFormProps, 'onClose' | 'editData'>) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Hooks
  const { data: expenseOptionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseOptionsQuery,
  });

  const { postExpenseDetails } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostExpenseDetailsMutation,
  });

  const { putExpenseDetails } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutExpenseDetailsMutation,
  });

  const { data: paymentMethodsConfigData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentMethodsConfigQuery,
  });

  // Derived Data
  const categoryOptions = useMemo(
    () => expenseOptionsData?.categoryOptions || [],
    [expenseOptionsData]
  );

  const paymentMethodsConfig = useMemo(
    () => paymentMethodsConfigData || localPaymentMethodsConfig,
    [paymentMethodsConfigData]
  );

  const paymentMethodOptions = useMemo(
    () =>
      expenseOptionsData?.paymentMethodOptions ||
      Object.keys(paymentMethodsConfig).map((method) => ({
        value: method,
        label: method.charAt(0).toUpperCase() + method.slice(1),
      })),
    [expenseOptionsData, paymentMethodsConfig]
  );

  // Form Submission Handler
  const handleSubmit = async (
    values: IExpenseFormValues,
    { setSubmitting }: FormikHelpers<IExpenseFormValues>
  ) => {
    try {
      setIsSubmitting(true);

      const payload = {
        academicYearId: currentYear?.id,
        categoryId: values.expenseCategory,
        name: values.expenseName,
        categoryTags: values.expenseCategoryTags || [],
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.date?.toISOString(),
        notes: values.notes || '',
        paymentDetails: values.paymentDetails,
      };

      if (editData?.id) {
        await putExpenseDetails({
          expenseId: editData.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.expenseName} updated successfully!`,
        });
      } else {
        await postExpenseDetails(payload).unwrap();

        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.expenseName} added successfully!`,
        });
      }
      onClose(null, true);
    } catch (error) {
      console.error('Save operation failed:', error);
      shikshaMitraToast.error({
        message: `Failed to ${editData ? 'update' : 'create'} expense tracking`,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Formik Initialization
  const formik = useFormik<IExpenseFormValues>({
    initialValues: getInitialExpenseData(editData),
    validationSchema: getExpenseFormSchema(currentYear),
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  return {
    formik,
    isSubmitting,
    categoryOptions,
    paymentMethodsConfig,
    paymentMethodOptions,
    currentYear,
  };
};
