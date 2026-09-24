import { useEffect } from 'react';

import { getInitialValues } from '../../initialValues';
import { createDefaultConfig } from '../utils/generateSlots';

interface SlotFormState {
  setFieldValue: (field: string, value: unknown) => Promise<unknown>;
  values: { slotConfigurations?: unknown[] };
}

interface SlotFormSyncParams {
  existingClassSlotData?: unknown;
  formik: SlotFormState;
  isEdit?: boolean;
  isExistingSlotLoading?: boolean;
  selectedClassSlotId?: string;
}

export const useSlotFormSync = ({
  existingClassSlotData,
  formik,
  isEdit,
  isExistingSlotLoading,
  selectedClassSlotId,
}: SlotFormSyncParams) => {
  useEffect(() => {
    if (!formik.values.slotConfigurations?.length && !isExistingSlotLoading) {
      formik.setFieldValue('slotConfigurations', [createDefaultConfig()]);
    }
    // Formik is intentionally excluded because its object identity changes after field updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.slotConfigurations, isExistingSlotLoading]);

  useEffect(() => {
    if (!isEdit && selectedClassSlotId && existingClassSlotData) {
      const populated = getInitialValues('', existingClassSlotData);
      formik.setFieldValue('slotConfigurations', populated.slotConfigurations);
    }
    // Formik is intentionally excluded because this effect is driven by the fetched record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingClassSlotData, isEdit, selectedClassSlotId]);
};
