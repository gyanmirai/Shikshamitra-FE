import type { IDeliveryChannel } from '../type';

// Initial Values
export const getDeliveryChannelInitialValues = (editData?: IDeliveryChannel | null) => ({
  deliveryChannel: editData?.deliveryChannel || '',
  description: editData?.description || '',
  color: editData?.color || '',
});
