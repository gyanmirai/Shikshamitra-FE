import type { ButtonProps } from '@mui/material';

import React, { useRef } from 'react';
import { Button } from '@mui/material';

type UploadButtonProps = ButtonProps & {
  onChange?: (e: any) => void;
  multiple?: boolean;
  accept?: string;
  fileInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};
const UploadButton = ({
  onClick = () => {},
  onChange = () => {},
  multiple = false,
  fileInputProps,
  ...props
}: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <input
        ref={inputRef}
        multiple={multiple}
        onChange={onChange}
        type="file"
        style={{ display: 'none' }}
        {...fileInputProps}
      />
      <Button
        onClick={(e) => {
          inputRef?.current?.click?.();
          onClick(e);
        }}
        {...props}
      />
    </>
  );
};

export default UploadButton;
