import type {
  IAssignedToPurchase,
  IProcurementAndVendorFromValues,
} from './procurement-and-vendor-interface';

export function getInitialProcurementAndVendorValues(
  data: Partial<IProcurementAndVendorFromValues> = {},
  isEdit = false
): IProcurementAndVendorFromValues {
  return {
    resourceCategory: data.resourceCategory || '',
    resourceName: data.resourceName || '',
    purpose: data.purpose || '',
    quantity: data.quantity || 0,
    expectedDeliveryDate: data.expectedDeliveryDate || null,
    status: data.status || '',
  };
}

export function getInitialAssignedToPurchaseValues(): IAssignedToPurchase {
  return {
    assignedTo: '',
    priority: '',
    description: '',
  };
}
