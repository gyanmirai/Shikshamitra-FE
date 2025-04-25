import type {
  IResourceAllocateFormValues,
  IResourceTransferFormValues,
} from './resource-allocation-interface';

export function getInitialResourceAllocateValues(
  data: Partial<IResourceAllocateFormValues> = {},
  isEdit = false
): IResourceAllocateFormValues {
  return {
    resourceName: isEdit ? (data.resourceName ?? '') : '',
    quantity: isEdit ? (data.quantity ?? 0) : 0,
    allocationTarget: isEdit ? (data.allocationTarget ?? '') : '',
    assignedTo: isEdit ? (data.assignedTo ?? '') : '',
    allocationDate: isEdit ? (data.allocationDate ?? null) : null,
    expectedReturnDate: isEdit ? (data.expectedReturnDate ?? null) : null,
    purposeOfAllocation: isEdit ? (data.purposeOfAllocation ?? '') : '',
  };
}

export function getInitialResourceTransferValues(
  data: Partial<IResourceTransferFormValues> = {},
  isEdit = false
): IResourceTransferFormValues {
  return {
    currentLocation: isEdit ? (data.currentLocation ?? '') : '',
    allocationTarget: isEdit ? (data.allocationTarget ?? '') : '',
    assignedTo: isEdit ? (data.assignedTo ?? '') : '',
    transferDate: isEdit ? (data.transferDate ?? null) : null,
    reasonOfTransfer: isEdit ? (data.reasonOfTransfer ?? '') : '',
  };
}
