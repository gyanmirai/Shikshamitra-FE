import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetIncomeCategoriesQuery } from 'src/redux/finance/incomeCategory';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useAddIncomeTrackingMutation,
  useUpdateIncomeTrackingMutation,
} from 'src/redux/finance/incomeTrackingManagement/incomeTracking';

import { getInitialIncomeData } from '../Components/IncomeInitialValues';
import { getIncomeFormSchema } from '../Components/IncomeValidationSchema';

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

  const [uploadCurriculumFile, { isLoading: uploadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const initialValues = useMemo(() => getInitialIncomeData(editData), [editData]);
  const validationSchema = useMemo(() => getIncomeFormSchema(currentYear), [currentYear]);

  // File upload handler
  const handleFileUpload = async (files: (File | string)[]) => {
    try {
      const formData = new FormData();
      formData.append('FileName', (files[0] as File)?.name);
      formData.append('File', files[0] as File);
      const response = await uploadCurriculumFile(formData).unwrap();
      return response.data;
    } catch (error) {
      console.error('File upload failed:', error);
      shikshaMitraToast.error({
        message: 'Failed to upload document',
      });
      throw error;
    }
  };

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
          ...(values.document && { document: values.document }),
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
    uploadLoading,
    incomeOptionsLoading,
    handleFileUpload,
  };
};
