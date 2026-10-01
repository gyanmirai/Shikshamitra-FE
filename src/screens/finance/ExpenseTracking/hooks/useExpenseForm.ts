import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetExpenseCategoryQuery } from 'src/redux/finance/expenseCategory';
import {
  usePutExpenseDetailsMutation,
  usePostExpenseDetailsMutation,
} from 'src/redux/finance/expenseApi/expenseDetailedApi';

import { getInitialExpenseData } from '../component/ExpenseInitialValues';
import { getExpenseFormSchema } from '../component/ExpenseValidationSchema';

import type { IExpenseFormProps, IExpenseFormValues } from '../component/type';

// Payment method options derived directly from the enum
export const paymentMethodOptions = Object.entries(PaymentMethodLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const useExpenseForm = ({
  onClose,
  editData,
}: Pick<IExpenseFormProps, 'onClose' | 'editData'>) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [postExpenseDetails, { isLoading: addLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostExpenseDetailsMutation,
  });

  const [putExpenseDetails, { isLoading: updateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutExpenseDetailsMutation,
  });

  const { data: categoryOptions, isLoading: categoryOptionsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseCategoryQuery,
    params: { academicYearId: currentYear?.id },
  });

  // Form Submission Handler - payload matches API contract exactly
  const handleSubmit = async (values: IExpenseFormValues) => {
    try {
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
        await putExpenseDetails({
          expenseId: editData.id,
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.name} updated successfully!`,
        });
      } else {
        await postExpenseDetails({
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.name} added successfully!`,
        });
      }
      onClose(null, true);
    } catch (error) {
      console.error('Save operation failed:', error);
      shikshaMitraToast.error({
        message: `Failed to ${editData ? 'update' : 'create'} expense tracking`,
      });
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
    addLoading,
    updateLoading,
    categoryOptions,
    paymentMethodOptions,
    currentYear,
    categoryOptionsLoading,
  };
};
