import type { FormikProps } from 'formik';
import type { FileData } from 'src/components/custom-upload';

import { useState, useEffect } from 'react';
import CustomUpload from 'src/components/custom-upload';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type { BookFormValues } from '../Components/type';

export function BookCoverUpload({
  formik,
  disabled,
  onBusyChange,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [error, setError] = useState('');
  const [upload, { isLoading }] = useUploadCurriculumFileMutation();
  useEffect(() => {
    onBusyChange(isLoading);
    return () => onBusyChange(false);
  }, [isLoading, onBusyChange]);
  const value: FileData | undefined = formik.values.coverImage
    ? {
        filePath: formik.values.coverImage,
        name: formik.values.coverImage.split('/').pop() || 'Book cover',
      }
    : undefined;

  const change = async (file: File | FileData | null) => {
    if (disabled || isLoading) return;
    setError('');
    if (!file) {
      formik.setFieldValue('coverImage', '');
      return;
    }
    if (!(file instanceof File)) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Select a PNG or JPEG cover image.');
      return;
    }
    const body = new FormData();
    body.append('FileName', file.name);
    body.append('File', file);
    try {
      const response = await upload(body).unwrap();
      const path = typeof response === 'string' ? response : response?.data;
      if (typeof path !== 'string' || !path)
        throw new Error('The upload did not return a saved file.');
      await formik.setFieldValue('coverImage', path);
    } catch (failure) {
      setError(
        parseApiProblemDetail(failure).detail ||
          'Could not upload the cover. Your previous cover is retained.'
      );
    }
  };

  return (
    <CustomUpload
      multiple={false}
      value={value}
      onChange={change}
      disabled={disabled}
      loading={isLoading}
      accept="image/png,image/jpeg"
      primaryText="Book cover"
      secondaryText="PNG or JPEG, up to 5 MB."
      error={error}
      onReject={setError}
      parentsProps={{ 'aria-label': 'Book cover image' }}
    />
  );
}
