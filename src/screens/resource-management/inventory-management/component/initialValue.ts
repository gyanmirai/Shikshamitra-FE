import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

import type {
  IInventoryItem,
  IProcurementFormValues,
  IIssueResourceFormValues,
} from '../inventory-interface';

export function getInitialInventoryItem(
  data: Partial<IInventoryItem> = {},
  isEdit = false
): IInventoryItem {
  return {
    itemCode: data?.itemCode ?? '',
    itemName: data?.itemName ?? '',
    category: data?.category ?? '',
    subCategory: data?.subCategory ?? '',
    resourceConditionStatus: data?.resourceConditionStatus ?? '',
    resourceMeasurementUnit: data?.resourceMeasurementUnit ?? '',
    quantity: data?.quantity ?? null,
    available: data?.available ?? 0,
    campusName: data?.campusName ?? '',
    buildingName: data?.buildingName ?? '',
    roomNumber: data?.roomNumber ?? '',
    floorNumber: data?.floorNumber ?? '',
    location: data?.location ?? '',
    termAndCondition: data?.termAndCondition ?? '',
    warrantyExpiryDate: data?.warrantyExpiryDate ?? null,
    resourceImage: data?.resourceImage ?? '',
    resourceBill: data?.resourceBill ?? '',
    purchasedVendorName: data?.purchasedVendorName ?? '',
    resourcePurchaseDate: data?.resourcePurchaseDate ?? null,
    lastUpdatedDate: data?.lastUpdatedDate ?? (null as unknown as Dayjs),
    status: data?.status ?? 0,
    assignedTo: data?.assignedTo ?? '',
    id: isEdit
      ? (data?.id ?? Math.floor(Math.random() * 1000000000))
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
