import { useState, useCallback } from 'react';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';

import type { IClassWiseFeeItem, IClassWiseFeeStructureCard } from '../type';

export const useFeeStructureCardForm = (initial: IClassWiseFeeStructureCard) => {
  const [data, setData] = useState<IClassWiseFeeStructureCard>(initial);
  const [originalData, setOriginalData] = useState<IClassWiseFeeStructureCard | null>(null);
  const [isEditing, setIsEditing] = useState(!initial._id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const enterEdit = useCallback(() => {
    setOriginalData(
      (prev) => prev ?? { ...data, feeHeads: data.feeHeads.map((fh) => ({ ...fh })) }
    );
    setIsEditing(true);
  }, [data]);

  const discardEdit = useCallback(() => {
    setData((prev) => originalData ?? prev);
    setOriginalData(null);
    setIsEditing(false);
  }, [originalData]);

  const setName = useCallback((value: string) => {
    setData((prev) => ({ ...prev, name: value }));
  }, []);

  const updateFeeHead = useCallback((index: number, field: keyof IClassWiseFeeItem, value: any) => {
    setData((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.map((fh, i) => (i === index ? { ...fh, [field]: value } : fh)),
    }));
  }, []);

  const addFeeHeads = useCallback((items: IClassWiseFeeItem[]) => {
    setData((prev) => ({ ...prev, feeHeads: [...prev.feeHeads, ...items] }));
  }, []);

  const removeFeeHead = useCallback((index: number) => {
    setData((prev) => ({ ...prev, feeHeads: prev.feeHeads.filter((_, i) => i !== index) }));
  }, []);

  const saveSuccess = useCallback((savedData: IClassWiseFeeStructureCard) => {
    setData(savedData);
    setOriginalData(null);
    setIsEditing(false);
    setIsSaving(false);
  }, []);

  const lockSuccess = useCallback(() => {
    setData((prev) => ({ ...prev, status: FeeStructureLockStatusType.Locked }));
    setIsLocking(false);
  }, []);

  const unlockSuccess = useCallback(() => {
    setData((prev) => ({ ...prev, status: FeeStructureLockStatusType.Unlocked }));
    setIsLocking(false);
  }, []);

  const isDirty =
    isEditing && originalData !== null && JSON.stringify(data) !== JSON.stringify(originalData);

  const isLocked = data.status === FeeStructureLockStatusType.Locked;

  return {
    data,
    originalData,
    isEditing,
    isSaving,
    isDeleting,
    isLocking,
    isDirty,
    isLocked,
    setIsSaving,
    setIsDeleting,
    setIsLocking,
    enterEdit,
    discardEdit,
    setName,
    updateFeeHead,
    addFeeHeads,
    removeFeeHead,
    saveSuccess,
    lockSuccess,
    unlockSuccess,
  };
};
