// components/SubmitButton.jsx
import React from 'react';

import { LoadingButton } from '@mui/lab';

import { Iconify } from '../iconify/iconify';

import type { SubmitButtonProps } from './interface';

const SubmitButton: React.FC<SubmitButtonProps> = ({
  disabled = false,
  loading = false,
  onClick,
  type = 'submit',
  buttonText = 'Submit',
  variant = 'contained',
  startIcon = <Iconify icon="material-symbols-light:save" />,
}) => (
  <LoadingButton
    loading={loading}
    type={type}
    variant={variant}
    onClick={onClick}
    startIcon={startIcon}
    disabled={disabled}
    size="small"
  >
    {buttonText}
  </LoadingButton>
);

export default SubmitButton;
