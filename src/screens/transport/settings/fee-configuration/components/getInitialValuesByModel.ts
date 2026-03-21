import dayjs from 'dayjs';

export const getInitialValuesByModel = (
  model: string,
  editData: any = null,
  stopBasedFeeData?: any
) => {
  const baseDate = editData?.effectiveFrom ? dayjs(editData.effectiveFrom) : dayjs();

  const defaults: Record<string, any> = {
    // 'flat-rate': {
    //   model: 'flat-rate',
    //   feeAmount: '',
    //   feeFrequency: '',
    //   effectiveFrom: baseDate,
    // },

    'distance-based': {
      model: 'distance-based',
      ratePerKm: '',
      feeFrequency: '',
      effectiveFrom: baseDate,
    },

    'stop-based': {
      model: 'stop-based',
      effectiveFrom: baseDate,
      feeFrequency: '',
    },

    // 'zone-based': {
    //   model: 'zone-based',
    //   zones: [],
    //   effectiveFrom: baseDate,
    // },
  };

  // ✅ Merge edit data if present (for editing)
  if (editData) {
    // For stop-based, map the stops properly with all expected fields
    if (model === 'stop-based' && Array.isArray(editData.stops)) {
      return {
        ...defaults[model],
        ...editData,
        effectiveFrom: dayjs(editData?.effectiveFrom || baseDate),
      };
    }

    // ✅ For other models
    return {
      ...defaults[model],
      ...editData,
      effectiveFrom: dayjs(editData?.effectiveFrom || baseDate),
    };
  }

  // ✅ Return default structure for new creation
  return defaults[model];
};
