import type { ButtonProps } from '@mui/material';

import React, { useRef } from 'react';

import { Button } from '@mui/material';

type UploadButtonProps = ButtonProps & {
  onChange?: (e: any) => void;
  multiple?: boolean;
  accept?: string;
};

const UploadButton = ({
  onClick = () => {},
  onChange = () => {},
  multiple = false,
  accept = 'image/*',
  ...props
}: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <input
        ref={inputRef}
        accept="image/*"
        multiple={multiple}
        onChange={onChange}
        type="file"
        style={{ display: 'none' }}
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
