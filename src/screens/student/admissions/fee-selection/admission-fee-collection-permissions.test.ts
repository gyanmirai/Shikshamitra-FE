import { it, expect } from 'vitest';

import {
  getAdmissionFeeCollectionAccess,
  ADMISSION_FEE_COLLECTION_PERMISSIONS,
} from './admission-fee-collection-permissions';

const grants = (...names: string[]) => names.map((name) => ({ name, isGranted: true }));

it('requires exact Finance view and add grants without relying on menu visibility or Student edit', () => {
  expect(
    getAdmissionFeeCollectionAccess(
      grants('Finance.Fees.FeeCollections', 'Students.Onboarding.Add')
    )
  ).toEqual({ canView: false, canCollect: false, canViewReceipts: false });
  expect(
    getAdmissionFeeCollectionAccess(grants(ADMISSION_FEE_COLLECTION_PERMISSIONS.collect))
  ).toEqual({ canView: false, canCollect: false, canViewReceipts: false });
  expect(
    getAdmissionFeeCollectionAccess(grants(ADMISSION_FEE_COLLECTION_PERMISSIONS.view))
  ).toEqual({ canView: true, canCollect: false, canViewReceipts: false });
});

it('permits scoped cashier capabilities without the Finance module navigation grant', () => {
  expect(
    getAdmissionFeeCollectionAccess(grants(...Object.values(ADMISSION_FEE_COLLECTION_PERMISSIONS)))
  ).toEqual({ canView: true, canCollect: true, canViewReceipts: true });
});

it('keeps receipts unavailable when that exact permission is denied', () => {
  expect(
    getAdmissionFeeCollectionAccess([
      ...grants(
        ADMISSION_FEE_COLLECTION_PERMISSIONS.view,
        ADMISSION_FEE_COLLECTION_PERMISSIONS.collect
      ),
      { name: ADMISSION_FEE_COLLECTION_PERMISSIONS.receipts, isGranted: false },
    ])
  ).toEqual({ canView: true, canCollect: true, canViewReceipts: false });
  expect(getAdmissionFeeCollectionAccess(undefined).canCollect).toBe(false);
});
