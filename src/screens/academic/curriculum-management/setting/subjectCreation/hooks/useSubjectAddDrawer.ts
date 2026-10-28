'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetSubjectLookupQuery,
  useBulkAddSubjectsMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { IPendingRow } from '../type';

interface UseSubjectAddDrawerProps {
  onClose: () => void;
}

export const useSubjectAddDrawer = ({ onClose }: UseSubjectAddDrawerProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: existingSubjects } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectLookupQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: { skip: !(currentMedium as Medium)?.id, refetchOnMountOrArgChange: 60 },
  });

  const [bulkAddSubjects, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useBulkAddSubjectsMutation,
  });

  const [rows, setRows] = useState<IPendingRow[]>([
    {
      tempId: `temp-${Date.now()}`,
      name: '',
      displayName: '',
      category: 'General',
      color: '',
      icon: '',
      status: 'Active',
      sortOrder: '',
    },
  ]);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const isDirty = rows.some(
    (row) =>
      row.name.trim() !== '' ||
      row.displayName.trim() !== '' ||
      row.color !== '' ||
      row.sortOrder !== '' ||
      row.category !== 'General' ||
      row.icon !== '' ||
      row.status !== 'Active'
  );

  /**
   * Memoization Justification:
   * Compiles existingNames from API list into a Set of lowercase strings.
   * This permits fast O(1) duplicate checks and avoids traversing the array on every keystroke.
   */
  const existingNames = useMemo(
    () => new Set((existingSubjects || []).map((s: any) => s.name.trim().toLowerCase())),
    [existingSubjects]
  );

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        tempId: `temp-${Date.now()}-${Math.random()}`,
        name: '',
        displayName: '',
        category: 'General',
        color: '',
        icon: '',
        status: 'Active',
        sortOrder: '',
      },
    ]);
  }, []);

  const updateRow = useCallback(
    (tempId: string, field: keyof Omit<IPendingRow, 'tempId'>, value: string) => {
      setRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));
    },
    []
  );

  const removeRow = useCallback((tempId: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.tempId !== tempId);
      return next.length === 0
        ? [
            {
              tempId: `temp-${Date.now()}`,
              name: '',
              displayName: '',
              category: 'General',
              color: '',
              icon: '',
              status: 'Active',
              sortOrder: '',
            },
          ]
        : next;
    });
  }, []);

  const getDuplicateError = useCallback(
    (name: string, tempId: string): string | null => {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return null;
      if (existingNames.has(trimmed)) return 'Subject already exists';
      const countInList = rows.filter(
        (r) => r.tempId !== tempId && r.name.trim().toLowerCase() === trimmed
      ).length;
      return countInList > 0 ? 'Duplicate in this list' : null;
    },
    [existingNames, rows]
  );

  const resetAndClose = useCallback(() => {
    onClose();
    setConfirmCloseOpen(false);
    setTimeout(() => {
      setRows([
        {
          tempId: `temp-${Date.now()}`,
          name: '',
          displayName: '',
          category: 'General',
          color: '',
          icon: '',
          status: 'Active',
          sortOrder: '',
        },
      ]);
      setShowErrors(false);
    }, 300);
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    resetAndClose();
  }, [isDirty, resetAndClose]);

  const handleSave = async () => {
    const hasError = rows.some((r) => {
      const nameEmpty = !r.name.trim();
      const dupError = r.name.trim() ? getDuplicateError(r.name, r.tempId) : null;
      const colorError = !r.color;

      let sortOrderError = false;
      if (r.sortOrder !== '') {
        const num = Number(r.sortOrder);
        if (Number.isNaN(num) || !Number.isInteger(num) || num < 1 || num > 999999) {
          sortOrderError = true;
        }
      }

      return nameEmpty || dupError || colorError || sortOrderError;
    });
    if (hasError) {
      setShowErrors(true);
      shikshaMitraToast.error({ message: 'Please fix all errors before saving.' });
      return;
    }
    setShowErrors(false);
    try {
      await bulkAddSubjects({
        academicMediumId: (currentMedium as Medium).id,
        body: {
          subjects: rows.map((row) => ({
            name: row.name.trim(),
            displayName: row.displayName.trim() || null,
            category: row.category,
            color: row.color,
            icon: row.icon || null,
            status: statusToNumber(row.status),
            sortOrder: row.sortOrder === '' ? null : Number(row.sortOrder),
            educationMediumId: (currentMedium as Medium).id,
          })),
        },
      }).unwrap();
      shikshaMitraToast.success({
        message:
          rows.length === 1
            ? `"${rows[0].name.trim()}" added successfully`
            : `${rows.length} subjects added successfully`,
      });
      resetAndClose();
    } catch (error) {
      console.error('Failed to save subjects', error);
    }
  };

  return {
    rows,
    isSaving,
    showErrors,
    addRow,
    updateRow,
    removeRow,
    getDuplicateError,
    resetAndClose,
    requestClose,
    confirmCloseOpen,
    setConfirmCloseOpen,
    handleSave,
  };
};

const statusToNumber = (status: string) => {
  if (status === 'Inactive') return 1;
  if (status === 'Archived') return 2;
  return 0;
};
