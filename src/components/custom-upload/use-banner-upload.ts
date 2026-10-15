import { useDropzone } from 'react-dropzone';
import { useRef, useState, useEffect } from 'react';
import { fileToBase64 } from 'src/utils/file-to-base64';

import type { CustomUploadProps } from './custom-upload';

export function useBannerUpload({ onChange, onBusyChange, disabled }: CustomUploadProps) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('');
  const mounted = useRef(true);
  const reading = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const dropzone = useDropzone({
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/gif': ['.gif'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: disabled || busy,
    noClick: true,
    noKeyboard: true,
    onDropRejected: (rejections) => {
      const codes = rejections.flatMap((item) => item.errors.map((itemError) => itemError.code));
      setError(
        codes.includes('too-many-files')
          ? 'Choose one banner image at a time.'
          : codes.includes('file-too-large')
            ? 'Choose an image smaller than 5 MB.'
            : 'Choose a JPG, PNG, or GIF image.'
      );
    },
    onDropAccepted: async ([file]) => {
      if (!file || reading.current) return;
      reading.current = true;
      setBusy(true);
      setError('');
      onBusyChange?.(true);
      try {
        const image = await fileToBase64(file);
        if (!mounted.current) return;
        onChange?.([image]);
        setFileName(file.name);
      } catch {
        if (mounted.current) setError('Unable to read this image. Please choose it again.');
      } finally {
        reading.current = false;
        if (mounted.current) {
          setBusy(false);
          onBusyChange?.(false);
        }
      }
    },
  });

  const clear = () => {
    setError('');
    setFileName('');
    onChange?.([]);
  };

  return { ...dropzone, error, busy, fileName, clear };
}
