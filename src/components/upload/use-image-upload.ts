import { useDropzone } from 'react-dropzone';

export function useImageUpload({
  disabled,
  maxSize,
  onUpload,
}: {
  disabled: boolean;
  maxSize: number;
  onUpload: (file: File) => void;
}) {
  const dropzone = useDropzone({
    disabled,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    maxSize,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    onDropAccepted: (files) => {
      if (files[0]) onUpload(files[0]);
    },
  });
  const codes = dropzone.fileRejections.flatMap(({ errors }) => errors.map(({ code }) => code));
  const rejection = codes.includes('too-many-files')
    ? 'Choose one image at a time.'
    : codes.includes('file-invalid-type')
      ? 'Choose a PNG or JPG image.'
      : codes.includes('file-too-large')
        ? `Choose an image no larger than ${maxSize / 1024 / 1024} MB.`
        : '';
  return { ...dropzone, rejection };
}
