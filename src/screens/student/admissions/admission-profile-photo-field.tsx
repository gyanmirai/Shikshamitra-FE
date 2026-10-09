import { Stack, Typography } from '@mui/material';
import { UploadAvatar } from 'src/components/upload';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { useId, useRef, useState, useEffect } from 'react';

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
  const [reading, setReading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const helperId = useId();
  const mounted = useRef(true);
  const busyCallback = useRef(onBusyChange);
  useEffect(() => {
    busyCallback.current = onBusyChange;
  }, [onBusyChange]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      busyCallback.current?.(false);
    };
  }, []);
  const displayedError = uploadError || error || getAdmissionPhotoError(value);
  return (
    <Stack spacing={1} alignItems="center" aria-busy={reading}>
      <Typography variant="subtitle2">
        {field.label}
        {field.required ? ' *' : ''}
      </Typography>
      <UploadAvatar
        avatarRootProps={{
          role: 'button',
          'aria-label': `Choose ${field.label.toLowerCase()}`,
          'aria-describedby': helperId,
          'aria-disabled': disabled || reading,
        }}
        title={field.label}
        value={getAdmissionPhotoError(value) ? null : value || null}
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
        maxSize={ADMISSION_PHOTO_MAX_BYTES}
        disabled={disabled || reading}
        error={Boolean(displayedError)}
        onDrop={async (files) => {
          if (!files.length || disabled || reading) return;
          setReading(true);
          busyCallback.current?.(true);
          setUploadError(undefined);
          try {
            const nextValue = await fileToBase64(files[0]);
            if (!mounted.current) return;
            const nextError = getAdmissionPhotoError(nextValue);
            if (nextError) setUploadError(nextError);
            else {
              onChange(nextValue);
              onBlur?.();
            }
          } catch {
            if (mounted.current) setUploadError('Photo could not be read. Choose the file again.');
          } finally {
            if (mounted.current) setReading(false);
            busyCallback.current?.(false);
          }
        }}
        onDropRejected={(files) =>
          setUploadError(
            files.some((file) => file.errors.some((reason) => reason.code === 'file-too-large'))
              ? 'Photo must be 2 MB or smaller.'
              : 'Choose a valid JPG or PNG photo.'
          )
        }
        onDelete={
          disabled || reading
            ? undefined
            : () => {
                setUploadError(undefined);
                onChange('');
                onBlur?.();
              }
        }
      />
      <Typography
        id={helperId}
        variant="caption"
        color={displayedError ? 'error.main' : 'text.secondary'}
        role={displayedError ? 'alert' : undefined}
      >
        {displayedError ||
          (reading ? 'Reading photo…' : field.helpText || 'JPG or PNG, up to 2 MB.')}
      </Typography>
    </Stack>
  );
}
