import type { FileData } from 'src/components/custom-upload';

import { useRef, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

export const REFERENCE_FILE_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg';
const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;
const REFERENCE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export function useReferenceFileUpload(
  setAttachment: (file: FileData | null) => Promise<unknown>,
  disabled = false
) {
  const [uploadFile] = useUploadCurriculumFileMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const pending = useRef(false);
  const blocked = useRef(false);
  const activeRequest = useRef<ReturnType<typeof uploadFile> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeRequest.current?.abort();
    };
  }, []);

  const reject = (message: string) => {
    blocked.current = true;
    setError(message);
    setFailedFile(null);
  };

  const change = async (file: File | FileData | null) => {
    if (pending.current || disabled) return;
    if (!(file instanceof File)) {
      blocked.current = false;
      setError(null);
      setFailedFile(null);
      await setAttachment(file);
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!file.size || file.size > MAX_REFERENCE_BYTES) {
      reject(file.size ? 'File exceeds the 5 MB size limit.' : 'Select a non-empty file.');
      return;
    }
    if (!REFERENCE_TYPES[extension] || (file.type && file.type !== REFERENCE_TYPES[extension])) {
      reject('Unsupported file type. Select a PDF, DOCX, PNG, or JPG/JPEG file.');
      return;
    }

    pending.current = true;
    blocked.current = true;
    setIsUploading(true);
    setError(null);
    setFailedFile(null);
    const body = new FormData();
    body.append('File', file);
    const request = uploadFile(body);
    activeRequest.current = request;
    try {
      const response = await request.unwrap();
      if (!mounted.current) return;
      const filePath: unknown = response?.data;
      if (typeof filePath !== 'string' || !filePath.trim()) {
        throw new Error('The upload did not return an attachment. Please retry.');
      }
      await setAttachment({
        filePath,
        url: filePath,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      blocked.current = false;
    } catch (uploadError: unknown) {
      if (!mounted.current) return;
      const detail =
        uploadError instanceof Error
          ? uploadError.message
          : parseApiProblemDetail(uploadError).detail;
      setError(`Upload failed. ${detail || 'Please try again.'}`);
      setFailedFile(file);
    } finally {
      if (mounted.current) {
        pending.current = false;
        activeRequest.current = null;
        setIsUploading(false);
      }
    }
  };

  return {
    isUploading,
    error,
    failedFile,
    isBlocked: () => blocked.current,
    change,
    reject,
    retry: () => failedFile && change(failedFile),
    clearError: () => {
      blocked.current = false;
      setError(null);
      setFailedFile(null);
    },
  };
}

export type ReferenceFileUploadState = ReturnType<typeof useReferenceFileUpload>;
