import React from 'react';
import { Iconify } from 'src/components/iconify';

const menuIconView = (icon: string) =>
  React.createElement(Iconify, {
    icon,
    sx: {
      width: '22px !important',
      height: '22px !important',
      opacity: 0.7,
    },
  });

export default menuIconView;
