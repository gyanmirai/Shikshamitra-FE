'use client';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';

import type { TCurriculum } from '../types';

export const CurriculumData: TCurriculum[] = [
  {
    id: 1,
    className: '1',
    curriculumName: 'First Grade Curriculum',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-28'),
    endDate: dayjs('2024-12-28'),
    scheduleDate: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
  {
    id: 2,
    className: '2',
    curriculumName: 'Second Grade Curriculum',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2023-10-28'),
    endDate: dayjs('2024-10-20'),
    scheduleDate: dayjs('2024-10-28'),
    status: 'Publish',
  },
  {
    id: 3,
    className: '3',
    curriculumName: 'Third Grade Curriculum',
    subjects: [
      { name: 'Math', color: '#0077b6' },
      { name: 'Science', color: '#8e44ad' },
      { name: 'English', color: '#2980b9' },
      { name: 'Gujarati', color: '#e74c3c' },
    ],
    startDate: dayjs('2024-10-11'),
    endDate: dayjs('2024-10-28'),
    scheduleDate: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
];

export const useCurriculumOverview = () => {
  const [curriculumTableData, setCurriculumTableData] = useState<TCurriculum[]>(CurriculumData);
  const [selectedCurriculum, setSelectedCurriculum] = useState<TCurriculum | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setSelectedCurriculum(null);
    setIsEdit(false);
    confirmPublishDialog.onFalse();
  }, [confirmPublishDialog]);

  const handleEditCurriculum = useCallback((curriculum: TCurriculum) => {
    setSelectedCurriculum(curriculum);
    setIsEdit(true);
    setOpen(true);
  }, []);

  const confirmStatusChange = useCallback(() => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setCurriculumTableData((curriculum) =>
        curriculum.map((curr) => (curr.id === id ? { ...curr, status: newValue } : curr))
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  }, [pendingStatusChange, confirmPublishDialog]);

  const handleSubmit = useCallback(
    (values: TCurriculum) => {
      if (isEdit) {
        setCurriculumTableData((prev) =>
          prev.map((curr) => (curr.id === selectedCurriculum?.id ? values : curr))
        );
      } else {
        setCurriculumTableData((prev) => [...prev, values]);
      }
      handleCloseDialog();
    },
    [isEdit, selectedCurriculum, handleCloseDialog]
  );

  const handleStatusChange = useCallback(
    (id: number, value: string) => {
      setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
      confirmPublishDialog.onTrue();
    },
    [confirmPublishDialog]
  );

  const handleOpenAdd = useCallback(() => {
    setIsEdit(false);
    setSelectedCurriculum(null);
    setOpen(true);
  }, []);

  return {
    curriculumTableData,
    selectedCurriculum,
    isEdit,
    open,
    pendingStatusChange,
    confirmPublishDialog,
    handleCloseDialog,
    handleEditCurriculum,
    confirmStatusChange,
    handleSubmit,
    handleStatusChange,
    handleOpenAdd,
  };
};
