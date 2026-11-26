import { useRef, useEffect } from 'react';
import { fileToBase64 } from 'src/utils/file-to-base64';

import StudentPhotoInput from '../components/student-photo-input';
import { getAdmissionPhotoError, ADMISSION_PHOTO_MAX_BYTES } from './admission-profile-photo';

type Props = {
  field: { label: string; required: boolean; helpText?: string | null };
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onBusyChange?: (busy: boolean) => void;
};

export function AdmissionProfilePhotoField({
  field,
  value,
  disabled,
  error,
  onChange,
  onBlur,
  onBusyChange,
}: Props) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const savedError = getAdmissionPhotoError(value);
  return (
    <StudentPhotoInput
      label={field.label}
      required={field.required}
      helpText={field.helpText}
      value={savedError ? null : value || null}
      error={error || savedError}
      maxBytes={ADMISSION_PHOTO_MAX_BYTES}
      disabled={disabled}
      onBusyChange={onBusyChange}
      onAccept={async (file) => {
        const next = await fileToBase64(file).catch(() => {
          throw new Error('Photo could not be read. Choose the file again.');
        });
        if (!mounted.current) return;
        const invalid = getAdmissionPhotoError(next);
        if (invalid) throw new Error(invalid);
        onChange(next);
        onBlur?.();
      }}
      onClear={() => {
        onChange('');
        onBlur?.();
      }}
    />
  );
}
