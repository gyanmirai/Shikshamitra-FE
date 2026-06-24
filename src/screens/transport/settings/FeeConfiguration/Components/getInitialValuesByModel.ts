import dayjs from 'dayjs';

export const getInitialValuesByModel = (
  model: string,
  editData: any = null,
  feeConfiguration?: any
) => {
  const source = editData || feeConfiguration;
  const baseDate = source?.effectiveFrom ? dayjs(source.effectiveFrom) : dayjs();

  const defaults: Record<string, any> = {
    'distance-based': {
      model: 'distance-based',
      ratePerKm: '',
      feeFrequency: '',
      chargeCategoryId: '',
      effectiveFrom: baseDate,
    },

    'stop-based': {
      model: 'stop-based',
      effectiveFrom: baseDate,
      feeFrequency: '',
      chargeCategoryId: '',
    },
  };

  if (!source) {
    return defaults[model];
  }

  return {
    ...defaults[model],
    ...source,
    model: source.model || source.feeModelType || model,
    feeFrequency: String(source.feeFrequency ?? source.frequency ?? ''),
    chargeCategoryId: source.chargeCategoryId || '',
    effectiveFrom: dayjs(source.effectiveFrom || baseDate),
  };
};
