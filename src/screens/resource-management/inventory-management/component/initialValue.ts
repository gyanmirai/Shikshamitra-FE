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
    categoryName: isEdit ? (data.categoryName ?? '') : '',
    quantity: isEdit ? (data.quantity ?? '') : '',
    id: isEdit
      ? (data.id ?? Math.floor(Math.random() * 1000000000))
      : Math.floor(Math.random() * 1000000000),
    campusName: isEdit ? (data.campusName ?? '') : '',
    buildingName: isEdit ? (data.buildingName ?? '') : '',
    roomNumber: isEdit ? (data.roomNumber ?? '') : '',
    floorNumber: isEdit ? (data.floorNumber ?? '') : '',
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
