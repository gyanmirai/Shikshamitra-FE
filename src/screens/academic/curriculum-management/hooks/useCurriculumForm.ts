'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import type { TCurriculum, CurriculumFormProps } from '../types';

export const useCurriculumForm = ({
  onSubmit,
  onClose,
  data,
  isEdit,
}: Omit<CurriculumFormProps, 'setSearchParams'>) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: {
      className: data?.className || '',
      curriculumName: data?.curriculumName || '',
      subjects: data?.subjects.map((subject) => subject.name) || [],
      startDate: data?.startDate ? dayjs(data?.startDate) : dayjs(),
      endDate: data?.endDate ? dayjs(data?.endDate) : null,
      scheduleDate: data?.startDate ? dayjs(data?.startDate) : dayjs(),
      status: data?.status || 'Unpublish',
    },
    onSubmit: (values) => {
      const formData: TCurriculum = {
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
        subjects: values.subjects.map((name: string) => ({
          name,
          color: '#000',
        })),
      };
      onSubmit(formData);
      onClose();
    },
  });

  return {
    formik,
    classData,
    isLoading,
    isDraft,
    setIsDraft,
  };
};
