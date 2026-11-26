import type { PendingFrameImage } from 'src/components/image-frame/image-frame';

import { Stack, Typography } from '@mui/material';
import { UploadAvatar } from 'src/components/upload';
import { useId, useRef, useState, useEffect } from 'react';
import { loadFrameImage } from 'src/components/image-frame/image-frame';
import { ImageFrameDialog } from 'src/components/image-frame/image-frame-dialog';

export const RECORD_PHOTO_MAX_BYTES = 3 * 1024 * 1024;
const STUDENT_FRAME = { width: 640, height: 640 };
const PHOTO_TYPES = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

type Props = {
  label: string;
  value: string | File | null;
  maxBytes: number;
  disabled?: boolean;
  required?: boolean;
  helpText?: string | null;
  error?: string;
  onAccept: (file: File) => void | Promise<void>;
  onClear?: () => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function StudentPhotoInput({
  label,
  value,
  maxBytes,
  disabled,
  required,
  helpText,
  error,
  onAccept,
  onClear,
  onBusyChange,
}: Props) {
  const helperId = useId();
  const [pending, setPending] = useState<PendingFrameImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const mounted = useRef(true);
  const locked = useRef(false);
  const busyCallback = useRef(onBusyChange);
  const sizeLabel = `${maxBytes / (1024 * 1024)} MB`;

  useEffect(() => {
    busyCallback.current = onBusyChange;
  }, [onBusyChange]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (locked.current) busyCallback.current?.(false);
    };
  }, []);
  useEffect(
    () => () => {
      if (pending) URL.revokeObjectURL(pending.url);
    },
    [pending]
  );

  const changeBusy = (next: boolean) => {
    if (!mounted.current) return;
    locked.current = next;
    setBusy(next);
    busyCallback.current?.(next);
  };
  const prepare = async (file?: File) => {
    if (!file || disabled || locked.current) return;
    const validType = file.type in PHOTO_TYPES;
    if (!validType || file.size === 0 || file.size > maxBytes) {
      setFailure(
        file.size > maxBytes
          ? `Photo must be ${sizeLabel} or smaller.`
          : 'Choose a valid JPG or PNG photo.'
      );
      return;
    }
    changeBusy(true);
    setFailure('');
    let url: string | undefined;
    try {
      url = URL.createObjectURL(file);
      const image = await loadFrameImage(url);
      const { naturalWidth: width, naturalHeight: height } = image;
      if (!width || !height || width > 10000 || height > 10000 || width * height > 25000000)
        throw new Error('Choose a photo up to 10,000 px per side and 25 megapixels.');
      if (mounted.current) {
        setPending({ file, image, url });
        url = undefined;
      }
    } catch (cause) {
      if (mounted.current)
        setFailure(cause instanceof Error ? cause.message : 'The photo could not be opened.');
      changeBusy(false);
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };
  const apply = async (file: File) => {
    if (!mounted.current) return;
    setPending(null);
    try {
      await onAccept(file);
    } catch (cause) {
      if (mounted.current)
        setFailure(
          cause instanceof Error ? cause.message : 'The photo could not be prepared. Try again.'
        );
    } finally {
      changeBusy(false);
    }
  };
  const displayedError = failure || error;
  return (
    <Stack spacing={1} alignItems="center" aria-busy={busy}>
      <Typography variant="subtitle2">
        {label}
        {required ? ' *' : ''}
      </Typography>
      <UploadAvatar
        title={label}
        value={value}
        accept={PHOTO_TYPES}
        maxSize={maxBytes}
        disabled={disabled || busy}
        error={Boolean(displayedError)}
        avatarRootProps={{
          role: 'button',
          'aria-label': `Choose ${label.toLowerCase()}`,
          'aria-describedby': helperId,
          'aria-disabled': Boolean(disabled || busy),
        }}
        onDrop={(files) => prepare(files[0])}
        onDropRejected={(files) => {
          setFailure(
            files.some((file) => file.errors.some((issue) => issue.code === 'file-too-large'))
              ? `Photo must be ${sizeLabel} or smaller.`
              : 'Choose a valid JPG or PNG photo.'
          );
        }}
        onDelete={
          onClear && !disabled && !busy
            ? () => {
                setFailure('');
                onClear();
              }
            : undefined
        }
      />
      <Typography
        id={helperId}
        variant="caption"
        color={displayedError ? 'error.main' : 'text.secondary'}
        role={displayedError ? 'alert' : undefined}
      >
        {displayedError ||
          (busy && !pending ? 'Preparing photo…' : helpText || `JPG or PNG, up to ${sizeLabel}.`)}
      </Typography>
      {pending && (
        <ImageFrameDialog
          pending={pending}
          label={label}
          frame={STUDENT_FRAME}
          maxBytes={maxBytes}
          previewMaxWidth={240}
          circularPreview
          titleInfo="Fit or fill the frame, then adjust zoom and position. The preview shows how the photo looks in an avatar."
          applyLabel="Use framed photo"
          onClose={() => {
            setPending(null);
            changeBusy(false);
          }}
          onApply={apply}
        />
      )}
    </Stack>
  );
}
