import dayjs from 'dayjs';

import type {
  IAddResourceFormValues,
  IProcurementFormValues,
  IIssueResourceFormValues,
} from '../inventory-interface';

export function getInitialResourceValues(
  data: Partial<IAddResourceFormValues> = {},
  isEdit = false
): IAddResourceFormValues {
  return {
    itemName: isEdit ? (data.itemName ?? '') : '',
    category: isEdit ? (data.category ?? '') : '',
    subCategory: isEdit ? (data.subCategory ?? '') : '',
    resourceConditionStatus: isEdit ? (data.resourceConditionStatus ?? '') : '',
    resourceMeasurementUnit: isEdit ? (data.resourceMeasurementUnit ?? '') : '',
    quantity: isEdit ? (data.quantity ?? '') : '',
    campusName: isEdit ? (data.campusName ?? '') : '',
    buildingName: isEdit ? (data.buildingName ?? '') : '',
    roomNumber: isEdit ? (data.roomNumber ?? '') : '',
    floorNumber: isEdit ? (data.floorNumber ?? '') : '',
    termAndCondition: isEdit ? (data.termAndCondition ?? '') : '',
    warrantyExpiryDate: isEdit ? (data.warrantyExpiryDate ?? null) : null,
    resourceImage: isEdit ? (data.resourceImage ?? '') : '',
    resourceBill: isEdit ? (data.resourceBill ?? '') : '',
    purchasedVendorName: isEdit ? (data.purchasedVendorName ?? '') : '',
    resourcePurchaseDate: isEdit ? (data.resourcePurchaseDate ?? null) : null,
    id: isEdit
      ? (data.id ?? Math.floor(Math.random() * 1000000000))
      : Math.floor(Math.random() * 1000000000),
  };
}

export function getInitialIssueResourceValues(
  data: Partial<IIssueResourceFormValues> = {},
  isEdit = false
): IIssueResourceFormValues {
  return {
    selectItem: isEdit ? (data.selectItem ?? '') : '',
    issuedTo: isEdit ? (data.issuedTo ?? '') : '',
    quantity: isEdit ? (data.quantity ?? '') : '',
    purpose: isEdit ? (data.purpose ?? '') : '',
    date: isEdit ? (data.date ?? dayjs()) : dayjs(),
  };
}

export function getInitialProcurementValues(
  data: Partial<IProcurementFormValues> = {},
  isEdit = false
): IProcurementFormValues {
  return {
    selectItem: isEdit ? (data.selectItem ?? '') : '',
    category: isEdit ? (data.category ?? '') : '',
    quantity: isEdit ? (data.quantity ?? '') : '',
    requestedBy: isEdit ? (data.requestedBy ?? '') : '',
    justification: isEdit ? (data.justification ?? '') : '',
    prefrerredVendor: isEdit ? (data.prefrerredVendor ?? '') : '',
    priority: isEdit ? (data.priority ?? '') : '',
    estimatedCost: isEdit ? (data.estimatedCost ?? '') : '',
  };
}
