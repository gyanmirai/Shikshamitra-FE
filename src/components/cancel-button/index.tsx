import React from 'react';

import { Button } from '@mui/material';

import { Iconify } from '../iconify';

import type { CancelButtonProps } from './inerface';

const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  buttonText = 'Cancel',
  startIcon = <Iconify icon="basil:cross-solid" />,
}) => (
  <Button onClick={onClick} variant="outlined" startIcon={startIcon}>
    {buttonText}
  </Button>
);

export default CancelButton;
