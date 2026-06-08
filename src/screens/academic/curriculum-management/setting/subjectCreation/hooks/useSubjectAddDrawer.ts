'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddSubjectMutation,
  useGetCoreSubjectsByMediumQuery,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { IPendingRow } from '../type';

interface UseSubjectAddDrawerProps {
  onClose: () => void;
}

export const useSubjectAddDrawer = ({ onClose }: UseSubjectAddDrawerProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: existingSubjects } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: { skip: !(currentMedium as Medium)?.id },
  });

  const [addSubject, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectMutation,
  });

  const [rows, setRows] = useState<IPendingRow[]>([
    { tempId: `temp-${Date.now()}`, name: '', color: '' },
  ]);
  const [showErrors, setShowErrors] = useState(false);

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
      { tempId: `temp-${Date.now()}-${Math.random()}`, name: '', color: '' },
    ]);
  }, []);

  const updateRow = useCallback((tempId: string, field: 'name' | 'color', value: string) => {
    setRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));
  }, []);

  const removeRow = useCallback((tempId: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.tempId !== tempId);
      return next.length === 0 ? [{ tempId: `temp-${Date.now()}`, name: '', color: '' }] : next;
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
    setTimeout(() => {
      setRows([{ tempId: `temp-${Date.now()}`, name: '', color: '' }]);
      setShowErrors(false);
    }, 300);
  }, [onClose]);

  const handleSave = async () => {
    const hasError = rows.some(
      (r) => !r.name.trim() || !r.color || !!getDuplicateError(r.name, r.tempId)
    );
    if (hasError) {
      setShowErrors(true);
      shikshaMitraToast.error({ message: 'Please fix all errors before saving.' });
      return;
    }
    setShowErrors(false);
    try {
      await Promise.all(
        rows.map((row) =>
          (addSubject as any)({
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: row.name.trim(),
              color: row.color,
              educationMediumId: (currentMedium as Medium).id,
            },
          }).unwrap()
        )
      );
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
    handleSave,
  };
};
